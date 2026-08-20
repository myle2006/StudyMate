<?php

class RoadmapTemplate extends Model
{
    public function getForAssignedSubjects(int $studentId, ?int $subjectId = null): array
    {
        $params = [
            'student_id' => $studentId,
            'assignment_status' => 'active',
            'template_status' => 'active',
        ];
        $where = [
            'ss.student_id = :student_id',
            'ss.status = :assignment_status',
            't.status = :template_status',
            's.deleted_at IS NULL',
        ];

        if ($subjectId !== null && $subjectId > 0) {
            $where[] = 's.id = :subject_id';
            $params['subject_id'] = $subjectId;
        }

        $templates = $this->fetchTemplates(
            'SELECT t.id, t.subject_id, t.template_code, t.duration_months, t.title, t.overview,
                    t.goal, t.current_level, t.total_weeks, t.study_hours_per_week,
                    t.completion_criteria, t.final_assessment, t.reference_materials,
                    t.status, t.created_at, t.updated_at,
                    s.subject_code, s.subject_name
             FROM roadmap_templates t
             INNER JOIN subjects s ON s.id = t.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY s.subject_name ASC, t.duration_months ASC',
            $params
        );

        return $templates;
    }

    public function getAll(array $filters = []): array
    {
        $params = ['template_status' => trim((string) ($filters['status'] ?? 'active')) ?: 'active'];
        $where = [
            't.status = :template_status',
            's.deleted_at IS NULL',
        ];

        $subjectId = (int) ($filters['subject_id'] ?? 0);
        if ($subjectId > 0) {
            $where[] = 's.id = :subject_id';
            $params['subject_id'] = $subjectId;
        }

        return $this->fetchTemplates(
            'SELECT t.id, t.subject_id, t.template_code, t.duration_months, t.title, t.overview,
                    t.goal, t.current_level, t.total_weeks, t.study_hours_per_week,
                    t.completion_criteria, t.final_assessment, t.reference_materials,
                    t.status, t.created_at, t.updated_at,
                    s.subject_code, s.subject_name
             FROM roadmap_templates t
             INNER JOIN subjects s ON s.id = t.subject_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY s.subject_name ASC, t.duration_months ASC',
            $params
        );
    }

    private function fetchTemplates(string $sql, array $params): array
    {
        $statement = $this->db()->prepare($sql);
        $statement->execute($params);
        $templates = $statement->fetchAll();

        if ($templates === []) {
            return [];
        }

        $templateIds = array_map(static fn (array $template): int => (int) $template['id'], $templates);
        $phases = $this->getPhases($templateIds);
        $tasks = $this->getTasks(array_column($phases, 'id'));

        $tasksByPhase = [];
        foreach ($tasks as $task) {
            $phaseId = (int) $task['phase_id'];
            unset($task['phase_id']);
            $tasksByPhase[$phaseId][] = $task;
        }

        $phasesByTemplate = [];
        foreach ($phases as $phase) {
            $templateId = (int) $phase['template_id'];
            $phaseId = (int) $phase['id'];
            unset($phase['template_id']);
            $phase['tasks'] = $tasksByPhase[$phaseId] ?? [];
            $phasesByTemplate[$templateId][] = $phase;
        }

        return array_map(function (array $template) use ($phasesByTemplate): array {
            $template['id'] = (int) $template['id'];
            $template['subject_id'] = (int) $template['subject_id'];
            $template['duration_months'] = (int) $template['duration_months'];
            $template['total_weeks'] = (int) $template['total_weeks'];
            $template['study_hours_per_week'] = (float) $template['study_hours_per_week'];
            $template['phases'] = $phasesByTemplate[(int) $template['id']] ?? [];

            return $template;
        }, $templates);
    }

    private function getPhases(array $templateIds): array
    {
        if ($templateIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($templateIds), '?'));
        $statement = $this->db()->prepare(
            "SELECT id, template_id, phase_number, title, overview, start_week, end_week,
                    duration_weeks, outcome, completion_criteria
             FROM roadmap_template_phases
             WHERE template_id IN ({$placeholders})
             ORDER BY template_id ASC, phase_number ASC"
        );
        $statement->execute($templateIds);

        return array_map(function (array $phase): array {
            $phase['id'] = (int) $phase['id'];
            $phase['template_id'] = (int) $phase['template_id'];
            $phase['phase_number'] = (int) $phase['phase_number'];
            $phase['start_week'] = (int) $phase['start_week'];
            $phase['end_week'] = (int) $phase['end_week'];
            $phase['duration_weeks'] = (int) $phase['duration_weeks'];

            return $phase;
        }, $statement->fetchAll());
    }

    private function getTasks(array $phaseIds): array
    {
        if ($phaseIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($phaseIds), '?'));
        $statement = $this->db()->prepare(
            "SELECT id, phase_id, lesson_id, assignment_id, content_type, branch_label,
                    is_required, allow_skip, task_number, week_number, title, description,
                    expected_result, suggested_task, reference_materials,
                    completion_criteria, priority
             FROM roadmap_template_tasks
             WHERE phase_id IN ({$placeholders})
             ORDER BY phase_id ASC, week_number ASC, task_number ASC"
        );
        $statement->execute($phaseIds);
        $tasks = $statement->fetchAll();
        $dependenciesByLesson = $this->getLessonDependencies(array_filter(array_map(
            static fn (array $task): ?int => ! empty($task['lesson_id']) ? (int) $task['lesson_id'] : null,
            $tasks
        )));

        return array_map(function (array $task) use ($dependenciesByLesson): array {
            $task['id'] = (int) $task['id'];
            $task['phase_id'] = (int) $task['phase_id'];
            $task['lesson_id'] = ! empty($task['lesson_id']) ? (int) $task['lesson_id'] : null;
            $task['assignment_id'] = ! empty($task['assignment_id']) ? (int) $task['assignment_id'] : null;
            $task['is_required'] = (bool) ($task['is_required'] ?? true);
            $task['allow_skip'] = (bool) ($task['allow_skip'] ?? false);
            $task['task_number'] = (int) $task['task_number'];
            $task['week_number'] = (int) $task['week_number'];
            $task['prerequisite_lesson_ids'] = $task['lesson_id'] !== null ? ($dependenciesByLesson[$task['lesson_id']] ?? []) : [];

            return $task;
        }, $tasks);
    }

    private function getLessonDependencies(array $lessonIds): array
    {
        $this->ensureLessonDependencySchema();
        $lessonIds = array_values(array_unique(array_map('intval', $lessonIds)));
        if ($lessonIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($lessonIds), '?'));
        $statement = $this->db()->prepare(
            "SELECT lesson_id, prerequisite_lesson_id
             FROM lesson_dependencies
             WHERE lesson_id IN ({$placeholders})
             ORDER BY id ASC"
        );
        $statement->execute($lessonIds);

        $dependencies = [];
        foreach ($statement->fetchAll() as $row) {
            $dependencies[(int) $row['lesson_id']][] = (int) $row['prerequisite_lesson_id'];
        }

        return $dependencies;
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
}
