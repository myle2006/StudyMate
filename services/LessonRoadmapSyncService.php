<?php

class LessonRoadmapSyncService
{
    public function __construct(private ?PDO $db = null)
    {
        $this->db ??= Database::connection();
    }

    public function syncAfterLessonCreated(array $lesson, int $adminId, ?array $quizFile = null): array
    {
        $this->ensureSchema();

        $subject = $this->fetchSubject((int) $lesson['subject_id']);
        if ($subject === null) {
            return ['templates' => 0, 'roadmaps' => 0, 'assignment_id' => null, 'dependencies' => 0];
        }

        (new RoadmapTemplateProvisioner($this->db))->ensureForSubject($subject);

        $assignmentId = $this->ensureQuizAssignment($lesson, $adminId, null);
        $quizQuestionCount = 0;
        if ($quizFile !== null) {
            $quizQuestionCount = $this->importQuizQuestionsFromFile($assignmentId, $quizFile);
            $quizAttachmentPath = $this->storeQuizFile($quizFile);
            $this->updateQuizAssignmentAttachment($assignmentId, $quizAttachmentPath);
        }

        $dependencyCount = $this->ensureDefaultDependency($lesson);
        $templateCount = $this->syncTemplates($lesson, $assignmentId);
        $roadmapCount = $this->syncActiveRoadmaps($lesson, $assignmentId);

        return [
            'templates' => $templateCount,
            'roadmaps' => $roadmapCount,
            'assignment_id' => $assignmentId,
            'dependencies' => $dependencyCount,
            'quiz_questions' => $quizQuestionCount,
        ];
    }

    public function syncAfterLessonUpdated(array $lesson, ?array $quizFile = null, ?int $adminId = null): array
    {
        $this->ensureSchema();

        $assignmentId = $this->findQuizAssignmentId($lesson);
        if ($assignmentId === null && $adminId !== null) {
            $assignmentId = $this->ensureQuizAssignment($lesson, $adminId, null);
        }

        $quizQuestionCount = 0;
        if ($quizFile !== null && $assignmentId !== null) {
            $quizQuestionCount = $this->importQuizQuestionsFromFile($assignmentId, $quizFile);
            $quizAttachmentPath = $this->storeQuizFile($quizFile);
            $this->updateQuizAssignmentAttachment($assignmentId, $quizAttachmentPath);
        }

        $templateCount = $this->updateTemplateNodes($lesson, $assignmentId);
        $roadmapCount = $this->updateRoadmapNodes($lesson, $assignmentId);

        return [
            'templates' => $templateCount,
            'roadmaps' => $roadmapCount,
            'assignment_id' => $assignmentId,
            'quiz_questions' => $quizQuestionCount,
        ];
    }

    public function syncAfterLessonDeleted(array $lesson): array
    {
        $this->ensureSchema();

        $lessonId = (int) $lesson['id'];
        $roadmapIds = $this->fetchAll(
            'SELECT DISTINCT roadmap_id AS id
             FROM learning_roadmap_items
             WHERE lesson_id = :lesson_id',
            ['lesson_id' => $lessonId]
        );

        $deleteDependencies = $this->db->prepare(
            'DELETE FROM lesson_dependencies
             WHERE lesson_id = :lesson_id OR prerequisite_lesson_id = :lesson_id'
        );
        $deleteDependencies->execute(['lesson_id' => $lessonId]);
        $dependencyCount = $deleteDependencies->rowCount();

        $deleteTemplateTasks = $this->db->prepare('DELETE FROM roadmap_template_tasks WHERE lesson_id = :lesson_id');
        $deleteTemplateTasks->execute(['lesson_id' => $lessonId]);
        $templateCount = $deleteTemplateTasks->rowCount();

        $deleteRoadmapItems = $this->db->prepare('DELETE FROM learning_roadmap_items WHERE lesson_id = :lesson_id');
        $deleteRoadmapItems->execute(['lesson_id' => $lessonId]);
        $roadmapCount = $deleteRoadmapItems->rowCount();

        $roadmapModel = new LearningRoadmap();
        foreach ($roadmapIds as $roadmap) {
            $roadmapModel->recalculateProgress((int) $roadmap['id']);
        }

        return [
            'templates' => $templateCount,
            'roadmaps' => $roadmapCount,
            'dependencies' => $dependencyCount,
        ];
    }

    public function validateQuizFile(?array $file): ?string
    {
        if ($file === null) {
            return null;
        }

        $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        $allowed = ['pdf', 'doc', 'docx', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'xls', 'xlsx', 'csv'];
        if (! in_array($extension, $allowed, true)) {
            return 'File quiz chi ho tro pdf, doc, docx, xls, xlsx, csv, zip, rar, png, jpg hoac jpeg.';
        }

        if ((int) ($file['size'] ?? 0) > 10 * 1024 * 1024) {
            return 'File quiz khong duoc vuot qua 10MB.';
        }

        if ($extension === 'csv') {
            try {
                (new AssignmentQuizQuestion())->parseCsv((string) $file['tmp_name']);
            } catch (Throwable $exception) {
                return $exception->getMessage();
            }
        }

        return null;
    }

    private function ensureSchema(): void
    {
        foreach ([
            BASE_PATH . '/database/migrations/create_roadmap_templates_tables.sql',
            BASE_PATH . '/database/migrations/alter_lessons_add_chapter.sql',
            BASE_PATH . '/database/migrations/alter_roadmap_lesson_content_nodes.sql',
            BASE_PATH . '/database/migrations/create_lesson_dependencies_table.sql',
            BASE_PATH . '/database/migrations/create_assignment_quiz_questions_table.sql',
        ] as $path) {
            $sql = file_get_contents($path);
            if ($sql === false) {
                continue;
            }

            foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
                if ($statement !== '') {
                    $this->db->exec($statement);
                }
            }
        }
    }

    private function fetchSubject(int $subjectId): ?array
    {
        return $this->fetchOne(
            'SELECT id, subject_code, subject_name, description, status
             FROM subjects
             WHERE id = :id AND deleted_at IS NULL
             LIMIT 1',
            ['id' => $subjectId]
        );
    }

    private function ensureQuizAssignment(array $lesson, int $adminId, ?string $attachmentPath): int
    {
        $title = 'Quiz xác nhận: ' . (string) $lesson['title'];
        $existing = $this->fetchOne(
            'SELECT id, attachment_path
             FROM assignments
             WHERE subject_id = :subject_id
               AND title = :title
               AND deleted_at IS NULL
             LIMIT 1',
            [
                'subject_id' => (int) $lesson['subject_id'],
                'title' => $title,
            ]
        );

        if ($existing) {
            if ($attachmentPath !== null && empty($existing['attachment_path'])) {
                $update = $this->db->prepare('UPDATE assignments SET attachment_path = :attachment_path, updated_at = NOW() WHERE id = :id');
                $update->execute(['id' => (int) $existing['id'], 'attachment_path' => $attachmentPath]);
            }

            return (int) $existing['id'];
        }

        $insert = $this->db->prepare(
            'INSERT INTO assignments
                (subject_id, title, description, deadline, attachment_path, status, created_by)
             VALUES
                (:subject_id, :title, :description, DATE_ADD(NOW(), INTERVAL 30 DAY), :attachment_path, :status, :created_by)'
        );
        $insert->execute([
            'subject_id' => (int) $lesson['subject_id'],
            'title' => $title,
            'description' => 'Quiz/bài kiểm tra ngắn dùng để xác nhận đã hoàn thành bài học "' . (string) $lesson['title'] . '".',
            'attachment_path' => $attachmentPath,
            'status' => ($lesson['status'] ?? 'draft') === 'published' ? 'open' : 'draft',
            'created_by' => $adminId,
        ]);

        return (int) $this->db->lastInsertId();
    }

    private function findQuizAssignmentId(array $lesson): ?int
    {
        $existingNode = $this->fetchOne(
            'SELECT assignment_id
             FROM roadmap_template_tasks
             WHERE lesson_id = :lesson_id AND assignment_id IS NOT NULL
             LIMIT 1',
            ['lesson_id' => (int) $lesson['id']]
        );
        if ($existingNode && ! empty($existingNode['assignment_id'])) {
            return (int) $existingNode['assignment_id'];
        }

        $title = 'Quiz xác nhận: ' . (string) $lesson['title'];
        $assignment = $this->fetchOne(
            'SELECT id
             FROM assignments
             WHERE subject_id = :subject_id
               AND title = :title
               AND deleted_at IS NULL
             LIMIT 1',
            [
                'subject_id' => (int) $lesson['subject_id'],
                'title' => $title,
            ]
        );

        return $assignment ? (int) $assignment['id'] : null;
    }

    private function ensureDefaultDependency(array $lesson): int
    {
        $lessonId = (int) $lesson['id'];
        $subjectId = (int) $lesson['subject_id'];
        if ($lessonId <= 0 || $subjectId <= 0) {
            return 0;
        }

        $hasDependency = $this->fetchOne(
            'SELECT id
             FROM lesson_dependencies
             WHERE lesson_id = :lesson_id
             LIMIT 1',
            ['lesson_id' => $lessonId]
        );
        if ($hasDependency !== null) {
            return 0;
        }

        $previousLesson = $this->fetchOne(
            'SELECT id
             FROM lessons
             WHERE subject_id = :subject_id
               AND id <> :lesson_id
               AND deleted_at IS NULL
             ORDER BY id DESC
             LIMIT 1',
            ['subject_id' => $subjectId, 'lesson_id' => $lessonId]
        );
        if ($previousLesson === null) {
            return 0;
        }

        $insert = $this->db->prepare(
            'INSERT INTO lesson_dependencies
                (subject_id, lesson_id, prerequisite_lesson_id, relation_type)
             VALUES
                (:subject_id, :lesson_id, :prerequisite_lesson_id, "required")
             ON DUPLICATE KEY UPDATE relation_type = VALUES(relation_type), updated_at = NOW()'
        );
        $insert->execute([
            'subject_id' => $subjectId,
            'lesson_id' => $lessonId,
            'prerequisite_lesson_id' => (int) $previousLesson['id'],
        ]);

        return $insert->rowCount() > 0 ? 1 : 0;
    }

    private function syncTemplates(array $lesson, int $assignmentId): int
    {
        $templates = $this->fetchAll(
            'SELECT id
             FROM roadmap_templates
             WHERE subject_id = :subject_id AND status = "active"
             ORDER BY duration_months ASC',
            ['subject_id' => (int) $lesson['subject_id']]
        );

        $synced = 0;
        foreach ($templates as $template) {
            $phase = $this->fetchOne(
                'SELECT id
                 FROM roadmap_template_phases
                 WHERE template_id = :template_id
                 ORDER BY phase_number ASC
                 LIMIT 1',
                ['template_id' => (int) $template['id']]
            );
            if ($phase === null) {
                continue;
            }

            $existing = $this->fetchOne(
                'SELECT id
                 FROM roadmap_template_tasks
                 WHERE phase_id = :phase_id AND lesson_id = :lesson_id
                 LIMIT 1',
                ['phase_id' => (int) $phase['id'], 'lesson_id' => (int) $lesson['id']]
            );

            if ($existing) {
                $update = $this->db->prepare(
                    'UPDATE roadmap_template_tasks
                     SET assignment_id = :assignment_id,
                         content_type = "lesson",
                         branch_label = :branch_label,
                         title = :title,
                         description = :description,
                         expected_result = :expected_result,
                         suggested_task = :suggested_task,
                         reference_materials = :reference_materials,
                         completion_criteria = :completion_criteria,
                         updated_at = NOW()
                     WHERE id = :id'
                );
                $update->execute([
                    'id' => (int) $existing['id'],
                    ...$this->templateContentParams($lesson, $assignmentId),
                ]);
                $synced++;
                continue;
            }

            $insert = $this->db->prepare(
                'INSERT INTO roadmap_template_tasks
                    (phase_id, lesson_id, assignment_id, content_type, branch_label, is_required, allow_skip,
                     task_number, week_number, title, description, expected_result, suggested_task,
                     reference_materials, completion_criteria, priority)
                 VALUES
                    (:phase_id, :lesson_id, :assignment_id, "lesson", :branch_label, 1, 0,
                     :task_number, 1, :title, :description, :expected_result, :suggested_task,
                     :reference_materials, :completion_criteria, "high")'
            );
            $insert->execute($this->templateNodeParams($phase, $lesson, $assignmentId, $this->nextTaskNumber((int) $phase['id'])));
            $synced++;
        }

        return $synced;
    }

    private function syncActiveRoadmaps(array $lesson, int $assignmentId): int
    {
        $roadmaps = $this->fetchAll(
            'SELECT id
             FROM learning_roadmaps
             WHERE subject_id = :subject_id
               AND deleted_at IS NULL
               AND status IN ("draft", "active")
             ORDER BY id ASC',
            ['subject_id' => (int) $lesson['subject_id']]
        );

        $synced = 0;
        foreach ($roadmaps as $roadmap) {
            $roadmapId = (int) $roadmap['id'];
            $existing = $this->fetchOne(
                'SELECT id FROM learning_roadmap_items WHERE roadmap_id = :roadmap_id AND lesson_id = :lesson_id LIMIT 1',
                ['roadmap_id' => $roadmapId, 'lesson_id' => (int) $lesson['id']]
            );
            if ($existing) {
                continue;
            }

            $next = $this->fetchOne(
                'SELECT COALESCE(MAX(week_number), 1) AS week_number,
                        COALESCE(MAX(order_number), 0) + 1 AS order_number
                 FROM learning_roadmap_items
                 WHERE roadmap_id = :roadmap_id',
                ['roadmap_id' => $roadmapId]
            ) ?: ['week_number' => 1, 'order_number' => 1];

            $insert = $this->db->prepare(
                'INSERT INTO learning_roadmap_items
                    (roadmap_id, lesson_id, assignment_id, content_type, branch_label, is_required, allow_skip,
                     week_number, order_number, title, description, expected_result, suggested_task,
                     planned_date, start_time, duration_minutes, priority, status, completion_percent)
                 VALUES
                    (:roadmap_id, :lesson_id, :assignment_id, "lesson", :branch_label, 1, 0,
                     :week_number, :order_number, :title, :description, :expected_result, :suggested_task,
                     NULL, NULL, :duration_minutes, "high", "not_started", 0)'
            );
            $insert->execute([
                'roadmap_id' => $roadmapId,
                'lesson_id' => (int) $lesson['id'],
                'assignment_id' => $assignmentId,
                'week_number' => max(1, (int) $next['week_number']),
                'order_number' => max(1, (int) $next['order_number']),
                ...$this->roadmapNodeParams($lesson),
            ]);

            (new LearningRoadmap())->recalculateProgress($roadmapId);
            $synced++;
        }

        return $synced;
    }

    private function updateTemplateNodes(array $lesson, ?int $assignmentId): int
    {
        $statement = $this->db->prepare(
            'UPDATE roadmap_template_tasks
             SET assignment_id = COALESCE(:assignment_id, assignment_id),
                 content_type = "lesson",
                 branch_label = :branch_label,
                 title = :title,
                 description = :description,
                 expected_result = :expected_result,
                 suggested_task = :suggested_task,
                 reference_materials = :reference_materials,
                 completion_criteria = :completion_criteria,
                 updated_at = NOW()
             WHERE lesson_id = :lesson_id'
        );
        $statement->execute([
            'lesson_id' => (int) $lesson['id'],
            ...$this->templateContentParams($lesson, $assignmentId),
        ]);

        return $statement->rowCount();
    }

    private function updateRoadmapNodes(array $lesson, ?int $assignmentId): int
    {
        $statement = $this->db->prepare(
            'UPDATE learning_roadmap_items
             SET assignment_id = COALESCE(:assignment_id, assignment_id),
                 content_type = "lesson",
                 branch_label = :branch_label,
                 title = :title,
                 description = :description,
                 expected_result = :expected_result,
                 suggested_task = :suggested_task,
                 duration_minutes = :duration_minutes,
                 updated_at = NOW()
             WHERE lesson_id = :lesson_id'
        );
        $statement->execute([
            'lesson_id' => (int) $lesson['id'],
            'assignment_id' => $assignmentId,
            ...$this->roadmapNodeParams($lesson),
        ]);

        return $statement->rowCount();
    }

    private function nextTaskNumber(int $phaseId): int
    {
        $row = $this->fetchOne(
            'SELECT COALESCE(MAX(task_number), 0) + 1 AS next_number
             FROM roadmap_template_tasks
             WHERE phase_id = :phase_id',
            ['phase_id' => $phaseId]
        );

        return max(1, (int) ($row['next_number'] ?? 1));
    }

    private function templateNodeParams(array $phase, array $lesson, int $assignmentId, int $taskNumber): array
    {
        return [
            'phase_id' => (int) $phase['id'],
            'lesson_id' => (int) $lesson['id'],
            'task_number' => $taskNumber,
            ...$this->templateContentParams($lesson, $assignmentId),
        ];
    }

    private function templateContentParams(array $lesson, ?int $assignmentId): array
    {
        return [
            'assignment_id' => $assignmentId,
            'branch_label' => $this->sectionLabel($lesson),
            'title' => (string) $lesson['title'],
            'description' => (string) ($lesson['content'] ?? ''),
            'expected_result' => 'Hiểu và vận dụng được nội dung chính của bài học.',
            'suggested_task' => 'Hoàn thành quiz xác nhận sau khi học xong nội dung.',
            'reference_materials' => implode("\n", array_filter([
                $lesson['video_url'] ?? '',
                $lesson['external_url'] ?? '',
                $lesson['material_path'] ?? '',
            ])),
            'completion_criteria' => 'Hoàn thành bài học và nộp/hoàn tất quiz xác nhận.',
        ];
    }

    private function roadmapNodeParams(array $lesson): array
    {
        return [
            'title' => (string) $lesson['title'],
            'branch_label' => $this->sectionLabel($lesson),
            'description' => (string) ($lesson['content'] ?? ''),
            'expected_result' => 'Hiểu và vận dụng được nội dung chính của bài học.',
            'suggested_task' => 'Hoàn thành quiz xác nhận sau khi học xong nội dung.',
            'duration_minutes' => max(15, (int) ($lesson['duration_minutes'] ?? 45)),
        ];
    }

    private function storeQuizFile(array $file): string
    {
        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $uploadDir = BASE_PATH . '/public/uploads/assignments';

        if (! is_dir($uploadDir) && ! mkdir($uploadDir, 0755, true)) {
            throw new RuntimeException('Khong the tao thu muc luu file quiz.');
        }

        $fileName = 'quiz_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $targetPath = $uploadDir . '/' . $fileName;

        if (! move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
            throw new RuntimeException('Khong the luu file quiz.');
        }

        return public_url_path() . '/uploads/assignments/' . $fileName;
    }

    private function importQuizQuestionsFromFile(int $assignmentId, array $file): int
    {
        $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        if ($extension !== 'csv') {
            return 0;
        }

        return (new AssignmentQuizQuestion())->importCsv($assignmentId, (string) $file['tmp_name']);
    }

    private function updateQuizAssignmentAttachment(int $assignmentId, string $attachmentPath): void
    {
        $update = $this->db->prepare(
            'UPDATE assignments
             SET attachment_path = :attachment_path,
                 updated_at = NOW()
             WHERE id = :id AND deleted_at IS NULL'
        );
        $update->execute([
            'id' => $assignmentId,
            'attachment_path' => $attachmentPath,
        ]);
    }

    private function sectionLabel(array $lesson): string
    {
        $chapter = trim((string) ($lesson['chapter'] ?? ''));

        return $chapter !== '' ? $chapter : 'Chương 1';
    }

    private function fetchOne(string $sql, array $params = []): ?array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    private function fetchAll(string $sql, array $params = []): array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
