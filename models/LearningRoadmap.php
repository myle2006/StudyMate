<?php

class LearningRoadmap extends Model
{
    public function getForStudent(int $userId, array $filters = []): array
    {
        $params = ['user_id' => $userId];
        $where = [
            'r.user_id = :user_id',
            'r.deleted_at IS NULL',
            's.deleted_at IS NULL',
        ];

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(r.title LIKE :keyword OR r.goal LIKE :keyword OR s.subject_name LIKE :keyword OR s.subject_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if (in_array($status, ['draft', 'active', 'completed', 'paused'], true)) {
            $where[] = 'r.status = :status';
            $params['status'] = $status;
        }

        $statement = $this->db()->prepare(
            'SELECT r.id, r.user_id, r.subject_id, r.learning_goal_id, r.title, r.overview,
                    r.goal, r.current_level, r.study_time_per_day, r.available_weekdays,
                    TIME_FORMAT(r.preferred_start_time, "%H:%i") AS preferred_start_time,
                    r.session_duration_minutes, r.max_daily_minutes, r.max_weekly_minutes,
                    r.reminder_minutes_before, r.start_date, r.end_date,
                    r.generated_by_ai, r.status, r.progress_percent, r.created_at, r.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image,
                    lg.title AS learning_goal_title,
                    (SELECT COUNT(*) FROM learning_roadmap_items i WHERE i.roadmap_id = r.id) AS item_count,
                    (SELECT COUNT(*) FROM learning_roadmap_items i WHERE i.roadmap_id = r.id AND i.status = \'completed\') AS completed_item_count
             FROM learning_roadmaps r
             INNER JOIN subjects s ON s.id = r.subject_id
             LEFT JOIN learning_goals lg ON lg.id = r.learning_goal_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY r.created_at DESC, r.id DESC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findForStudent(int $id, int $userId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT r.id, r.user_id, r.subject_id, r.learning_goal_id, r.title, r.overview,
                    r.goal, r.current_level, r.study_time_per_day, r.available_weekdays,
                    TIME_FORMAT(r.preferred_start_time, "%H:%i") AS preferred_start_time,
                    r.session_duration_minutes, r.max_daily_minutes, r.max_weekly_minutes,
                    r.reminder_minutes_before, r.start_date, r.end_date,
                    r.generated_by_ai, r.ai_prompt, r.ai_raw_response, r.status,
                    r.progress_percent, r.created_at, r.updated_at,
                    s.subject_code, s.subject_name, s.description AS subject_description,
                    s.color, s.image,
                    lg.title AS learning_goal_title
             FROM learning_roadmaps r
             INNER JOIN subjects s ON s.id = r.subject_id
             LEFT JOIN learning_goals lg ON lg.id = r.learning_goal_id
             WHERE r.id = :id
               AND r.user_id = :user_id
               AND r.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
        ]);
        $roadmap = $statement->fetch();

        return $roadmap ?: null;
    }

    public function createWithItems(array $data, array $items): int
    {
        $db = $this->db();
        $db->beginTransaction();

        try {
            $statement = $db->prepare(
                'INSERT INTO learning_roadmaps
                    (user_id, subject_id, learning_goal_id, title, overview, goal,
                     current_level, study_time_per_day, available_weekdays,
                     preferred_start_time, session_duration_minutes, max_daily_minutes,
                     max_weekly_minutes, reminder_minutes_before, start_date, end_date,
                     generated_by_ai, ai_prompt, ai_raw_response, status, progress_percent)
                 VALUES
                    (:user_id, :subject_id, :learning_goal_id, :title, :overview, :goal,
                     :current_level, :study_time_per_day, :available_weekdays,
                     :preferred_start_time, :session_duration_minutes, :max_daily_minutes,
                     :max_weekly_minutes, :reminder_minutes_before, :start_date, :end_date,
                     :generated_by_ai, :ai_prompt, :ai_raw_response, :status, :progress_percent)'
            );
            $statement->execute($this->roadmapParams($data));
            $roadmapId = (int) $db->lastInsertId();

            $createdItems = (new LearningRoadmapItem())->createMany($roadmapId, $items);
            $this->createSchedulesForItems(['id' => $roadmapId, ...$data], $createdItems);
            $this->recalculateProgress($roadmapId);

            $db->commit();

            return $roadmapId;
        } catch (Throwable $exception) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $exception;
        }
    }

    public function updateWithItems(int $id, int $userId, array $data, ?array $items = null): bool
    {
        $db = $this->db();
        $db->beginTransaction();

        try {
            $params = $this->roadmapParams($data);
            $params['id'] = $id;
            $params['user_id_for_where'] = $userId;

            $statement = $db->prepare(
                'UPDATE learning_roadmaps
                 SET subject_id = :subject_id,
                     learning_goal_id = :learning_goal_id,
                     title = :title,
                     overview = :overview,
                     goal = :goal,
                     current_level = :current_level,
                     study_time_per_day = :study_time_per_day,
                     available_weekdays = :available_weekdays,
                     preferred_start_time = :preferred_start_time,
                     session_duration_minutes = :session_duration_minutes,
                     max_daily_minutes = :max_daily_minutes,
                     max_weekly_minutes = :max_weekly_minutes,
                     reminder_minutes_before = :reminder_minutes_before,
                     start_date = :start_date,
                     end_date = :end_date,
                     generated_by_ai = :generated_by_ai,
                     ai_prompt = :ai_prompt,
                     ai_raw_response = :ai_raw_response,
                     status = :status
                 WHERE id = :id
                   AND user_id = :user_id_for_where
                   AND deleted_at IS NULL'
            );
            $statement->execute($params);

            if (is_array($items)) {
                (new StudySchedule())->deleteRoadmapSchedules($id, $userId);
                (new LearningRoadmapItem())->replaceForRoadmap($id, $items);
                $createdItems = (new LearningRoadmapItem())->getForRoadmap($id);
                $this->createSchedulesForItems(['id' => $id, ...$data], $createdItems);
            }

            $this->recalculateProgress($id);
            $db->commit();

            return true;
        } catch (Throwable $exception) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $exception;
        }
    }

    public function delete(int $id, int $userId): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE learning_roadmaps
             SET deleted_at = NOW()
             WHERE id = :id
               AND user_id = :user_id
               AND deleted_at IS NULL'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
        ]);

        return $statement->rowCount() > 0;
    }

    public function recalculateProgress(int $roadmapId): float
    {
        $summary = $this->getProgressSummary($roadmapId);
        $progress = (float) $summary['progress_percent'];

        $update = $this->db()->prepare(
            'UPDATE learning_roadmaps
             SET progress_percent = :progress_percent
             WHERE id = :roadmap_id'
        );
        $update->execute([
            'roadmap_id' => $roadmapId,
            'progress_percent' => $progress,
        ]);

        return $progress;
    }

    public function getProgressSummary(int $roadmapId): array
    {
        $statement = $this->db()->prepare(
            'SELECT COUNT(*) AS total_items,
                    SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) AS completed_items,
                    SUM(CASE WHEN status = \'not_completed\' THEN 1 ELSE 0 END) AS not_completed_items,
                    SUM(CASE WHEN status = \'rescheduled\' THEN 1 ELSE 0 END) AS rescheduled_items,
                    SUM(CASE WHEN status IN (\'not_started\', \'in_progress\') THEN 1 ELSE 0 END) AS pending_items,
                    COALESCE(SUM(duration_minutes), 0) AS planned_minutes,
                    COALESCE(SUM(actual_study_minutes), 0) AS actual_study_minutes,
                    COALESCE(SUM(CASE WHEN status <> \'completed\' THEN duration_minutes ELSE 0 END), 0) AS remaining_minutes,
                    COALESCE(AVG(CASE WHEN self_assessment IS NOT NULL THEN self_assessment END), 0) AS average_self_assessment
             FROM learning_roadmap_items
             WHERE roadmap_id = :roadmap_id'
        );
        $statement->execute(['roadmap_id' => $roadmapId]);
        $counts = $statement->fetch() ?: ['total_items' => 0, 'completed_items' => 0];
        $total = (int) ($counts['total_items'] ?? 0);
        $completed = (int) ($counts['completed_items'] ?? 0);
        $plannedMinutes = (int) ($counts['planned_minutes'] ?? 0);
        $progress = $total > 0 ? round(($completed / $total) * 100, 2) : 0.0;

        return [
            'roadmap_id' => $roadmapId,
            'total_items' => $total,
            'completed_items' => $completed,
            'not_completed_items' => (int) ($counts['not_completed_items'] ?? 0),
            'rescheduled_items' => (int) ($counts['rescheduled_items'] ?? 0),
            'pending_items' => (int) ($counts['pending_items'] ?? 0),
            'progress_percent' => $progress,
            'planned_minutes' => $plannedMinutes,
            'actual_study_minutes' => (int) ($counts['actual_study_minutes'] ?? 0),
            'remaining_minutes' => (int) ($counts['remaining_minutes'] ?? 0),
            'goal_achievement_percent' => $progress,
            'average_self_assessment' => round((float) ($counts['average_self_assessment'] ?? 0), 2),
            'daily' => $this->getProgressByDate($roadmapId),
            'weekly' => $this->getProgressByWeek($roadmapId),
            'is_completed' => $total > 0 && $completed === $total,
        ];
    }

    public function findScheduleConflicts(int $userId, array $roadmapData, array $items): array
    {
        $schedule = new StudySchedule();
        $conflicts = [];
        $plannedIntervals = [];
        $preferredStart = (string) ($roadmapData['preferred_start_time'] ?? '08:00');
        $excludeRoadmapId = ! empty($roadmapData['id']) ? (int) $roadmapData['id'] : null;

        foreach ($items as $index => $item) {
            $date = trim((string) ($item['planned_date'] ?? ''));
            $startTime = trim((string) ($item['start_time'] ?? ''));
            $duration = max(15, (int) ($item['duration_minutes'] ?? $roadmapData['session_duration_minutes'] ?? 60));

            if ($date === '' || $startTime === '') {
                continue;
            }

            $endTime = $this->addMinutesToTime($startTime, $duration);
            $key = $date;
            $internalConflict = false;
            foreach ($plannedIntervals[$key] ?? [] as $interval) {
                if ($startTime < $interval['end_time'] && $endTime > $interval['start_time']) {
                    $internalConflict = true;
                    break;
                }
            }

            if ($internalConflict || $schedule->hasTimeConflict($userId, $date, $startTime, $endTime, null, $excludeRoadmapId)) {
                $conflicts[] = [
                    'index' => $index,
                    'title' => trim((string) ($item['title'] ?? 'Nhiệm vụ học')),
                    'planned_date' => $date,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'reason' => $internalConflict ? 'Trùng với nhiệm vụ khác trong lộ trình.' : 'Trùng với lịch học đã có.',
                    'suggestions' => $schedule->suggestAvailableSlots($userId, $date, $duration, $preferredStart, null, $excludeRoadmapId),
                ];
            }

            $plannedIntervals[$key][] = [
                'start_time' => $startTime,
                'end_time' => $endTime,
            ];
        }

        return $conflicts;
    }

    public function findAssignedSubject(int $subjectId, int $userId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT s.id, s.subject_code, s.subject_name, s.description, s.credits, s.status, s.color, s.image
             FROM student_subjects ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.subject_id = :subject_id
               AND ss.student_id = :user_id
               AND ss.status = :assignment_status
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'user_id' => $userId,
            'assignment_status' => 'active',
        ]);
        $subject = $statement->fetch();

        return $subject ?: null;
    }

    private function roadmapParams(array $data): array
    {
        return [
            'user_id' => (int) $data['user_id'],
            'subject_id' => (int) $data['subject_id'],
            'learning_goal_id' => ! empty($data['learning_goal_id']) ? (int) $data['learning_goal_id'] : null,
            'title' => trim((string) $data['title']),
            'overview' => self::nullableText($data['overview'] ?? null),
            'goal' => trim((string) $data['goal']),
            'current_level' => trim((string) $data['current_level']),
            'study_time_per_day' => (float) $data['study_time_per_day'],
            'available_weekdays' => implode(',', LearningRoadmapValidation::normalizeWeekdays($data['available_weekdays'] ?? [])),
            'preferred_start_time' => self::nullableText($data['preferred_start_time'] ?? null),
            'session_duration_minutes' => max(15, (int) ($data['session_duration_minutes'] ?? 60)),
            'max_daily_minutes' => self::nullableInt($data['max_daily_minutes'] ?? null),
            'max_weekly_minutes' => self::nullableInt($data['max_weekly_minutes'] ?? null),
            'reminder_minutes_before' => max(0, (int) ($data['reminder_minutes_before'] ?? 15)),
            'start_date' => trim((string) $data['start_date']),
            'end_date' => trim((string) $data['end_date']),
            'generated_by_ai' => ! empty($data['generated_by_ai']) ? 1 : 0,
            'ai_prompt' => self::nullableText($data['ai_prompt'] ?? null),
            'ai_raw_response' => self::nullableText($data['ai_raw_response'] ?? null),
            'status' => trim((string) ($data['status'] ?? 'draft')),
            'progress_percent' => (float) ($data['progress_percent'] ?? 0),
        ];
    }

    private function createSchedulesForItems(array $roadmapData, array $items): void
    {
        $schedule = new StudySchedule();
        $itemModel = new LearningRoadmapItem();
        $roadmapId = (int) ($roadmapData['id'] ?? 0);
        $userId = (int) ($roadmapData['user_id'] ?? 0);
        $subjectId = (int) ($roadmapData['subject_id'] ?? 0);

        if ($roadmapId <= 0 || $userId <= 0 || $subjectId <= 0) {
            return;
        }

        foreach ($items as $item) {
            $plannedDate = trim((string) ($item['planned_date'] ?? ''));
            $startTime = trim((string) ($item['start_time'] ?? ''));
            $duration = max(15, (int) ($item['duration_minutes'] ?? $roadmapData['session_duration_minutes'] ?? 60));
            if ($plannedDate === '' || $startTime === '') {
                continue;
            }

            $scheduleId = $schedule->create([
                'user_id' => $userId,
                'subject_id' => $subjectId,
                'title' => trim((string) ($item['title'] ?? 'Nhiệm vụ học trong lộ trình')),
                'description' => trim((string) ($item['description'] ?? '')),
                'study_date' => $plannedDate,
                'start_time' => $startTime,
                'end_time' => $this->addMinutesToTime($startTime, $duration),
                'location' => '',
                'schedule_type' => 'self_study',
                'status' => 'upcoming',
                'roadmap_id' => $roadmapId,
                'roadmap_item_id' => (int) ($item['id'] ?? 0),
                'reminder_minutes_before' => (int) ($roadmapData['reminder_minutes_before'] ?? 15),
            ]);

            if (! empty($item['id'])) {
                $itemModel->updateScheduleId((int) $item['id'], $scheduleId);
            }
        }
    }

    private function getProgressByDate(int $roadmapId): array
    {
        $statement = $this->db()->prepare(
            'SELECT planned_date,
                    COUNT(*) AS total_items,
                    SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) AS completed_items,
                    SUM(CASE WHEN status = \'not_completed\' THEN 1 ELSE 0 END) AS not_completed_items,
                    COALESCE(SUM(duration_minutes), 0) AS planned_minutes,
                    COALESCE(SUM(actual_study_minutes), 0) AS actual_study_minutes
             FROM learning_roadmap_items
             WHERE roadmap_id = :roadmap_id
               AND planned_date IS NOT NULL
             GROUP BY planned_date
             ORDER BY planned_date ASC'
        );
        $statement->execute(['roadmap_id' => $roadmapId]);

        return array_map([$this, 'formatProgressBucket'], $statement->fetchAll());
    }

    private function getProgressByWeek(int $roadmapId): array
    {
        $statement = $this->db()->prepare(
            'SELECT YEARWEEK(planned_date, 1) AS week_key,
                    MIN(planned_date) AS week_start,
                    MAX(planned_date) AS week_end,
                    COUNT(*) AS total_items,
                    SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) AS completed_items,
                    SUM(CASE WHEN status = \'not_completed\' THEN 1 ELSE 0 END) AS not_completed_items,
                    COALESCE(SUM(duration_minutes), 0) AS planned_minutes,
                    COALESCE(SUM(actual_study_minutes), 0) AS actual_study_minutes
             FROM learning_roadmap_items
             WHERE roadmap_id = :roadmap_id
               AND planned_date IS NOT NULL
             GROUP BY YEARWEEK(planned_date, 1)
             ORDER BY week_start ASC'
        );
        $statement->execute(['roadmap_id' => $roadmapId]);

        return array_map([$this, 'formatProgressBucket'], $statement->fetchAll());
    }

    private function formatProgressBucket(array $row): array
    {
        $total = (int) ($row['total_items'] ?? 0);
        $completed = (int) ($row['completed_items'] ?? 0);
        $row['total_items'] = $total;
        $row['completed_items'] = $completed;
        $row['not_completed_items'] = (int) ($row['not_completed_items'] ?? 0);
        $row['planned_minutes'] = (int) ($row['planned_minutes'] ?? 0);
        $row['actual_study_minutes'] = (int) ($row['actual_study_minutes'] ?? 0);
        $row['progress_percent'] = $total > 0 ? round(($completed / $total) * 100, 2) : 0.0;

        return $row;
    }

    private function addMinutesToTime(string $time, int $minutes): string
    {
        [$hour, $minute] = array_map('intval', array_slice(explode(':', $time), 0, 2));
        $total = ($hour * 60) + $minute + max(0, $minutes);

        return sprintf('%02d:%02d', intdiv($total, 60), $total % 60);
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
