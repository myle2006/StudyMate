<?php

class LearningRoadmapItem extends Model
{
    private static bool $lessonChapterSchemaReady = false;

    public function getForRoadmap(int $roadmapId, ?int $studentId = null): array
    {
        $this->ensureLessonChapterSchema();
        $statement = $this->db()->prepare(
            'SELECT i.id, i.roadmap_id, i.lesson_id, i.assignment_id, i.content_type,
                    i.branch_label, i.is_required, i.allow_skip,
                    i.week_number, i.order_number, i.title, i.description,
                    expected_result, suggested_task, planned_date,
                    TIME_FORMAT(i.start_time, "%H:%i") AS start_time,
                    i.duration_minutes, i.priority, i.status, i.completion_percent,
                    i.learned_content, i.unfinished_content, i.note, i.self_assessment,
                    i.actual_study_minutes, i.schedule_id, i.rescheduled_from_date,
                    TIME_FORMAT(i.rescheduled_from_time, "%H:%i") AS rescheduled_from_time,
                    i.created_at, i.updated_at,
                    l.chapter AS lesson_chapter, l.title AS lesson_title, l.content AS lesson_content, l.video_url AS lesson_video_url,
                    l.external_url AS lesson_external_url, l.material_path AS lesson_material_path,
                    l.duration_minutes AS lesson_duration_minutes,
                    a.title AS assignment_title, a.description AS assignment_description,
                    a.deadline AS assignment_deadline, a.attachment_path AS assignment_attachment_path,
                    a.status AS assignment_status,
                    sub.id AS assignment_submission_id,
                    COALESCE(sub.status, "not_submitted") AS assignment_submission_status,
                    sub.submitted_at AS assignment_submitted_at,
                    sub.score AS assignment_score
             FROM learning_roadmap_items i
             LEFT JOIN lessons l ON l.id = i.lesson_id AND l.deleted_at IS NULL
             LEFT JOIN assignments a ON a.id = i.assignment_id AND a.deleted_at IS NULL
             LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = :student_id
             WHERE i.roadmap_id = :roadmap_id
             ORDER BY i.planned_date ASC, i.start_time ASC, i.week_number ASC, i.order_number ASC, i.id ASC'
        );
        $statement->execute(['roadmap_id' => $roadmapId, 'student_id' => $studentId ?? 0]);

        return $this->attachPrerequisiteItemIds($roadmapId, $statement->fetchAll());
    }

    public function findForStudent(int $id, int $userId): ?array
    {
        $this->ensureLessonChapterSchema();
        $statement = $this->db()->prepare(
            'SELECT i.id, i.roadmap_id, i.lesson_id, i.assignment_id, i.content_type,
                    i.branch_label, i.is_required, i.allow_skip,
                    i.week_number, i.order_number, i.title,
                    i.description, i.expected_result, i.suggested_task, i.planned_date,
                    TIME_FORMAT(i.start_time, "%H:%i") AS start_time,
                    i.duration_minutes, i.priority, i.status, i.completion_percent,
                    i.learned_content, i.unfinished_content, i.note, i.self_assessment,
                    i.actual_study_minutes, i.schedule_id, i.rescheduled_from_date,
                    TIME_FORMAT(i.rescheduled_from_time, "%H:%i") AS rescheduled_from_time,
                    r.subject_id, r.reminder_minutes_before, i.created_at, i.updated_at,
                    l.chapter AS lesson_chapter, l.title AS lesson_title, l.content AS lesson_content, l.video_url AS lesson_video_url,
                    l.external_url AS lesson_external_url, l.material_path AS lesson_material_path,
                    a.title AS assignment_title, a.description AS assignment_description,
                    a.deadline AS assignment_deadline, a.attachment_path AS assignment_attachment_path,
                    a.status AS assignment_status,
                    sub.id AS assignment_submission_id,
                    COALESCE(sub.status, "not_submitted") AS assignment_submission_status,
                    sub.submitted_at AS assignment_submitted_at,
                    sub.score AS assignment_score
             FROM learning_roadmap_items i
             INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
             LEFT JOIN lessons l ON l.id = i.lesson_id AND l.deleted_at IS NULL
             LEFT JOIN assignments a ON a.id = i.assignment_id AND a.deleted_at IS NULL
             LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = :user_id_for_submission
             WHERE i.id = :id
               AND r.user_id = :user_id
               AND r.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
            'user_id_for_submission' => $userId,
        ]);
        $item = $statement->fetch();

        return $item ?: null;
    }

    public function updateStatus(int $id, int $userId, string $status): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE learning_roadmap_items i
             INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
             SET i.status = :status,
                 i.completion_percent = CASE WHEN :status_for_percent = \'completed\' THEN 100 ELSE i.completion_percent END
             WHERE i.id = :id
               AND r.user_id = :user_id
               AND r.deleted_at IS NULL'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
            'status' => $status,
            'status_for_percent' => $status,
        ]);

        return $statement->rowCount() > 0;
    }

    public function updateResult(int $id, int $userId, array $data): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE learning_roadmap_items i
             INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
             SET i.status = :status,
                 i.completion_percent = :completion_percent,
                 i.learned_content = :learned_content,
                 i.unfinished_content = :unfinished_content,
                 i.note = :note,
                 i.self_assessment = :self_assessment,
                 i.actual_study_minutes = :actual_study_minutes
             WHERE i.id = :id
               AND r.user_id = :user_id
               AND r.deleted_at IS NULL'
        );

        return $statement->execute([
            'id' => $id,
            'user_id' => $userId,
            'status' => trim((string) ($data['status'] ?? 'in_progress')),
            'completion_percent' => min(100, max(0, (float) ($data['completion_percent'] ?? 0))),
            'learned_content' => self::nullableText($data['learned_content'] ?? null),
            'unfinished_content' => self::nullableText($data['unfinished_content'] ?? null),
            'note' => self::nullableText($data['note'] ?? null),
            'self_assessment' => self::nullableInt($data['self_assessment'] ?? null),
            'actual_study_minutes' => self::nullableInt($data['actual_study_minutes'] ?? null),
        ]);
    }

    public function updateSchedule(int $id, int $userId, array $data): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE learning_roadmap_items i
             INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
             SET i.planned_date = :planned_date,
                 i.start_time = :start_time,
                 i.duration_minutes = :duration_minutes,
                 i.rescheduled_from_date = COALESCE(i.rescheduled_from_date, i.planned_date),
                 i.rescheduled_from_time = COALESCE(i.rescheduled_from_time, i.start_time),
                 i.status = :status
             WHERE i.id = :id
               AND r.user_id = :user_id
               AND r.deleted_at IS NULL'
        );

        return $statement->execute([
            'id' => $id,
            'user_id' => $userId,
            'planned_date' => trim((string) $data['planned_date']),
            'start_time' => trim((string) $data['start_time']),
            'duration_minutes' => max(15, (int) $data['duration_minutes']),
            'status' => trim((string) ($data['status'] ?? 'rescheduled')),
        ]);
    }

    public function updateScheduleId(int $id, ?int $scheduleId): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE learning_roadmap_items
             SET schedule_id = :schedule_id
             WHERE id = :id'
        );

        return $statement->execute([
            'id' => $id,
            'schedule_id' => $scheduleId,
        ]);
    }

    public function createMany(int $roadmapId, array $items): array
    {
        $statement = $this->db()->prepare(
            'INSERT INTO learning_roadmap_items
                (roadmap_id, lesson_id, assignment_id, content_type, branch_label,
                 is_required, allow_skip, week_number, order_number, title, description,
                 expected_result, suggested_task, planned_date, start_time,
                 duration_minutes, priority, status, completion_percent,
                 learned_content, unfinished_content, note, self_assessment,
                 actual_study_minutes)
             VALUES
                (:roadmap_id, :lesson_id, :assignment_id, :content_type, :branch_label,
                 :is_required, :allow_skip, :week_number, :order_number, :title, :description,
                 :expected_result, :suggested_task, :planned_date, :start_time,
                 :duration_minutes, :priority, :status, :completion_percent,
                 :learned_content, :unfinished_content, :note, :self_assessment,
                 :actual_study_minutes)'
        );

        $createdItems = [];
        foreach ($items as $index => $item) {
            $statement->execute([
                'roadmap_id' => $roadmapId,
                'lesson_id' => self::nullableInt($item['lesson_id'] ?? null),
                'assignment_id' => self::nullableInt($item['assignment_id'] ?? null),
                'content_type' => self::contentType($item['content_type'] ?? 'lesson'),
                'branch_label' => self::nullableText($item['branch_label'] ?? null),
                'is_required' => ! array_key_exists('is_required', $item) || (bool) $item['is_required'] ? 1 : 0,
                'allow_skip' => ! empty($item['allow_skip']) ? 1 : 0,
                'week_number' => (int) ($item['week_number'] ?? 1),
                'order_number' => (int) ($item['order_number'] ?? $index + 1),
                'title' => trim((string) ($item['title'] ?? '')),
                'description' => self::nullableText($item['description'] ?? null),
                'expected_result' => self::nullableText($item['expected_result'] ?? null),
                'suggested_task' => self::nullableText($item['suggested_task'] ?? null),
                'planned_date' => self::nullableText($item['planned_date'] ?? null),
                'start_time' => self::nullableText($item['start_time'] ?? null),
                'duration_minutes' => max(15, (int) ($item['duration_minutes'] ?? 60)),
                'priority' => trim((string) ($item['priority'] ?? 'medium')),
                'status' => trim((string) ($item['status'] ?? 'not_started')),
                'completion_percent' => min(100, max(0, (float) ($item['completion_percent'] ?? 0))),
                'learned_content' => self::nullableText($item['learned_content'] ?? null),
                'unfinished_content' => self::nullableText($item['unfinished_content'] ?? null),
                'note' => self::nullableText($item['note'] ?? null),
                'self_assessment' => self::nullableInt($item['self_assessment'] ?? null),
                'actual_study_minutes' => self::nullableInt($item['actual_study_minutes'] ?? null),
            ]);
            $createdItems[] = [
                ...$item,
                'id' => (int) $this->db()->lastInsertId(),
                'roadmap_id' => $roadmapId,
                'order_number' => (int) ($item['order_number'] ?? $index + 1),
            ];
        }

        return $createdItems;
    }

    public function replaceForRoadmap(int $roadmapId, array $items): void
    {
        $delete = $this->db()->prepare('DELETE FROM learning_roadmap_items WHERE roadmap_id = :roadmap_id');
        $delete->execute(['roadmap_id' => $roadmapId]);
        $this->createMany($roadmapId, $items);
    }

    private function attachPrerequisiteItemIds(int $roadmapId, array $items): array
    {
        if ($items === []) {
            return [];
        }
        $this->ensureLessonDependencySchema();

        $statement = $this->db()->prepare(
            'SELECT child.id AS item_id,
                    child.lesson_id AS lesson_id,
                    parent.id AS prerequisite_item_id,
                    d.prerequisite_lesson_id,
                    d.relation_type
             FROM learning_roadmap_items child
             INNER JOIN lesson_dependencies d ON d.lesson_id = child.lesson_id
             INNER JOIN learning_roadmap_items parent
                ON parent.roadmap_id = child.roadmap_id
               AND parent.lesson_id = d.prerequisite_lesson_id
             WHERE child.roadmap_id = :roadmap_id'
        );
        $statement->execute(['roadmap_id' => $roadmapId]);

        $dependenciesByItem = [];
        $lessonDependenciesByItem = [];
        $relationsByItem = [];
        foreach ($statement->fetchAll() as $dependency) {
            $itemId = (int) $dependency['item_id'];
            $dependenciesByItem[$itemId][] = (int) $dependency['prerequisite_item_id'];
            $lessonDependenciesByItem[$itemId][] = (int) $dependency['prerequisite_lesson_id'];
            $relationsByItem[$itemId][] = [
                'lesson_id' => (int) $dependency['lesson_id'],
                'prerequisite_lesson_id' => (int) $dependency['prerequisite_lesson_id'],
                'prerequisite_item_id' => (int) $dependency['prerequisite_item_id'],
                'relation_type' => (string) $dependency['relation_type'],
            ];
        }

        return array_map(static function (array $item) use ($dependenciesByItem, $lessonDependenciesByItem, $relationsByItem): array {
            $itemId = (int) $item['id'];
            $item['prerequisite_item_ids'] = array_values(array_unique($dependenciesByItem[$itemId] ?? []));
            $item['prerequisite_lesson_ids'] = array_values(array_unique($lessonDependenciesByItem[$itemId] ?? []));
            $item['dependencies'] = $relationsByItem[$itemId] ?? [];

            return $item;
        }, $items);
    }

    private function ensureLessonChapterSchema(): void
    {
        if (self::$lessonChapterSchemaReady) {
            return;
        }

        $this->db()->exec("ALTER TABLE lessons ADD COLUMN IF NOT EXISTS chapter VARCHAR(120) NOT NULL DEFAULT 'Chuong 1' AFTER subject_id");
        $this->db()->exec('CREATE INDEX IF NOT EXISTS idx_lessons_subject_chapter ON lessons (subject_id, chapter)');
        self::$lessonChapterSchemaReady = true;
    }

    private function ensureLessonDependencySchema(): void
    {
        $path = BASE_PATH . '/database/migrations/create_lesson_dependencies_table.sql';
        $sql = file_get_contents($path);
        if ($sql === false) {
            return;
        }

        foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
            if ($statement !== '') {
                $this->db()->exec($statement);
            }
        }
    }

    private static function nullableText(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));

        return $value !== '' ? $value : null;
    }

    private static function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private static function contentType(mixed $value): string
    {
        $value = trim((string) ($value ?? 'lesson'));

        return in_array($value, ['lesson', 'quiz', 'practice', 'project', 'reading'], true) ? $value : 'lesson';
    }
}
