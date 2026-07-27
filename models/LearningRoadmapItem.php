<?php

class LearningRoadmapItem extends Model
{
    public function getForRoadmap(int $roadmapId): array
    {
        $statement = $this->db()->prepare(
            'SELECT id, roadmap_id, week_number, order_number, title, description,
                    expected_result, suggested_task, planned_date,
                    TIME_FORMAT(start_time, "%H:%i") AS start_time,
                    duration_minutes, priority, status, completion_percent,
                    learned_content, unfinished_content, note, self_assessment,
                    actual_study_minutes, schedule_id, rescheduled_from_date,
                    TIME_FORMAT(rescheduled_from_time, "%H:%i") AS rescheduled_from_time,
                    created_at, updated_at
             FROM learning_roadmap_items
             WHERE roadmap_id = :roadmap_id
             ORDER BY planned_date ASC, start_time ASC, week_number ASC, order_number ASC, id ASC'
        );
        $statement->execute(['roadmap_id' => $roadmapId]);

        return $statement->fetchAll();
    }

    public function findForStudent(int $id, int $userId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT i.id, i.roadmap_id, i.week_number, i.order_number, i.title,
                    i.description, i.expected_result, i.suggested_task, i.planned_date,
                    TIME_FORMAT(i.start_time, "%H:%i") AS start_time,
                    i.duration_minutes, i.priority, i.status, i.completion_percent,
                    i.learned_content, i.unfinished_content, i.note, i.self_assessment,
                    i.actual_study_minutes, i.schedule_id, i.rescheduled_from_date,
                    TIME_FORMAT(i.rescheduled_from_time, "%H:%i") AS rescheduled_from_time,
                    r.subject_id, r.reminder_minutes_before, i.created_at, i.updated_at
             FROM learning_roadmap_items i
             INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
             WHERE i.id = :id
               AND r.user_id = :user_id
               AND r.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
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
                (roadmap_id, week_number, order_number, title, description,
                 expected_result, suggested_task, planned_date, start_time,
                 duration_minutes, priority, status, completion_percent,
                 learned_content, unfinished_content, note, self_assessment,
                 actual_study_minutes)
             VALUES
                (:roadmap_id, :week_number, :order_number, :title, :description,
                 :expected_result, :suggested_task, :planned_date, :start_time,
                 :duration_minutes, :priority, :status, :completion_percent,
                 :learned_content, :unfinished_content, :note, :self_assessment,
                 :actual_study_minutes)'
        );

        $createdItems = [];
        foreach ($items as $index => $item) {
            $statement->execute([
                'roadmap_id' => $roadmapId,
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
}
