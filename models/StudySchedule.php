<?php

class StudySchedule extends Model
{
    public function getAllForUser(int $userId, array $filters = []): array
    {
        $params = ['user_id' => $userId];
        $where = ['ss.user_id = :user_id', 'ss.deleted_at IS NULL'];
        [$startDate, $endDate] = $this->dateRange($filters);

        if ($startDate !== null && $endDate !== null) {
            $where[] = 'ss.study_date BETWEEN :start_date AND :end_date';
            $params['start_date'] = $startDate;
            $params['end_date'] = $endDate;
        }

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'ss.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['upcoming', 'completed', 'cancelled'], true)) {
            $where[] = 'ss.status = :status';
            $params['status'] = $filters['status'];
        }

        if (! empty($filters['schedule_type']) && in_array($filters['schedule_type'], ['class', 'self_study', 'review', 'assignment', 'exam'], true)) {
            $where[] = 'ss.schedule_type = :schedule_type';
            $params['schedule_type'] = $filters['schedule_type'];
        }

        $statement = $this->db()->prepare(
            'SELECT ss.id, ss.user_id, ss.subject_id, ss.title, ss.description, ss.study_date,
                    TIME_FORMAT(ss.start_time, "%H:%i") AS start_time,
                    TIME_FORMAT(ss.end_time, "%H:%i") AS end_time,
                    ss.location, ss.schedule_type, ss.status, ss.roadmap_id, ss.roadmap_item_id,
                    ss.reminder_minutes_before, ss.created_at, ss.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image, s.credits
             FROM study_schedules ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY ss.study_date ASC, ss.start_time ASC, ss.id ASC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findForUser(int $id, int $userId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT ss.id, ss.user_id, ss.subject_id, ss.title, ss.description, ss.study_date,
                    TIME_FORMAT(ss.start_time, "%H:%i") AS start_time,
                    TIME_FORMAT(ss.end_time, "%H:%i") AS end_time,
                    ss.location, ss.schedule_type, ss.status, ss.roadmap_id, ss.roadmap_item_id,
                    ss.reminder_minutes_before, ss.created_at, ss.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image, s.credits
             FROM study_schedules ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.id = :id AND ss.user_id = :user_id AND ss.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
        ]);
        $schedule = $statement->fetch();

        return $schedule ?: null;
    }

    public function subjectExists(int $subjectId): bool
    {
        $statement = $this->db()->prepare('SELECT COUNT(*) FROM subjects WHERE id = :id AND deleted_at IS NULL');
        $statement->execute(['id' => $subjectId]);

        return (int) $statement->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO study_schedules
                (user_id, subject_id, title, description, study_date, start_time, end_time, location,
                 schedule_type, status, roadmap_id, roadmap_item_id, reminder_minutes_before)
             VALUES
                (:user_id, :subject_id, :title, :description, :study_date, :start_time, :end_time, :location,
                 :schedule_type, :status, :roadmap_id, :roadmap_item_id, :reminder_minutes_before)'
        );
        $statement->execute([
            'user_id' => (int) $data['user_id'],
            'subject_id' => (int) $data['subject_id'],
            'title' => $data['title'],
            'description' => $data['description'] !== '' ? $data['description'] : null,
            'study_date' => $data['study_date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'location' => $data['location'] !== '' ? $data['location'] : null,
            'schedule_type' => $data['schedule_type'] ?: 'self_study',
            'status' => $data['status'] ?: 'upcoming',
            'roadmap_id' => ! empty($data['roadmap_id']) ? (int) $data['roadmap_id'] : null,
            'roadmap_item_id' => ! empty($data['roadmap_item_id']) ? (int) $data['roadmap_item_id'] : null,
            'reminder_minutes_before' => isset($data['reminder_minutes_before']) && $data['reminder_minutes_before'] !== ''
                ? max(0, (int) $data['reminder_minutes_before'])
                : null,
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, int $userId, array $data): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE study_schedules
             SET subject_id = :subject_id,
                 title = :title,
                 description = :description,
                 study_date = :study_date,
                 start_time = :start_time,
                 end_time = :end_time,
                 location = :location,
                 schedule_type = :schedule_type,
                 status = :status,
                 roadmap_id = :roadmap_id,
                 roadmap_item_id = :roadmap_item_id,
                 reminder_minutes_before = :reminder_minutes_before
             WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL'
        );

        return $statement->execute([
            'id' => $id,
            'user_id' => $userId,
            'subject_id' => (int) $data['subject_id'],
            'title' => $data['title'],
            'description' => $data['description'] !== '' ? $data['description'] : null,
            'study_date' => $data['study_date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'location' => $data['location'] !== '' ? $data['location'] : null,
            'schedule_type' => $data['schedule_type'] ?: 'self_study',
            'status' => $data['status'] ?: 'upcoming',
            'roadmap_id' => ! empty($data['roadmap_id']) ? (int) $data['roadmap_id'] : null,
            'roadmap_item_id' => ! empty($data['roadmap_item_id']) ? (int) $data['roadmap_item_id'] : null,
            'reminder_minutes_before' => isset($data['reminder_minutes_before']) && $data['reminder_minutes_before'] !== ''
                ? max(0, (int) $data['reminder_minutes_before'])
                : null,
        ]);
    }

    public function deleteForUser(int $id, int $userId): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE study_schedules
             SET deleted_at = NOW()
             WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL'
        );

        return $statement->execute([
            'id' => $id,
            'user_id' => $userId,
        ]);
    }

    public function deleteRoadmapSchedules(int $roadmapId, int $userId): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE study_schedules
             SET deleted_at = NOW()
             WHERE roadmap_id = :roadmap_id
               AND user_id = :user_id
               AND deleted_at IS NULL'
        );

        return $statement->execute([
            'roadmap_id' => $roadmapId,
            'user_id' => $userId,
        ]);
    }

    public function hasTimeConflict(
        int $userId,
        string $studyDate,
        string $startTime,
        string $endTime,
        ?int $excludeId = null,
        ?int $excludeRoadmapId = null
    ): bool
    {
        $params = [
            'user_id' => $userId,
            'study_date' => $studyDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
        $sql = 'SELECT COUNT(*)
                FROM study_schedules
                WHERE user_id = :user_id
                  AND study_date = :study_date
                  AND deleted_at IS NULL
                  AND :start_time < end_time
                  AND :end_time > start_time';

        if ($excludeId !== null) {
            $sql .= ' AND id <> :exclude_id';
            $params['exclude_id'] = $excludeId;
        }

        if ($excludeRoadmapId !== null) {
            $sql .= ' AND (roadmap_id IS NULL OR roadmap_id <> :exclude_roadmap_id)';
            $params['exclude_roadmap_id'] = $excludeRoadmapId;
        }

        $statement = $this->db()->prepare($sql);
        $statement->execute($params);

        return (int) $statement->fetchColumn() > 0;
    }

    public function suggestAvailableSlots(
        int $userId,
        string $studyDate,
        int $durationMinutes,
        string $preferredStartTime = '08:00',
        ?int $excludeId = null,
        ?int $excludeRoadmapId = null,
        int $limit = 3
    ): array {
        $durationMinutes = max(15, $durationMinutes);
        $startMinute = $this->timeToMinutes($preferredStartTime);
        $startMinute = min(max(6 * 60, $startMinute), 21 * 60);
        $candidates = [];

        for ($minute = $startMinute; $minute + $durationMinutes <= 22 * 60; $minute += 30) {
            $startTime = $this->minutesToTime($minute);
            $endTime = $this->minutesToTime($minute + $durationMinutes);
            if (! $this->hasTimeConflict($userId, $studyDate, $startTime, $endTime, $excludeId, $excludeRoadmapId)) {
                $candidates[] = [
                    'study_date' => $studyDate,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'duration_minutes' => $durationMinutes,
                ];
            }

            if (count($candidates) >= $limit) {
                break;
            }
        }

        return $candidates;
    }

    private function dateRange(array $filters): array
    {
        $view = (string) ($filters['view'] ?? '');
        $dateValue = (string) ($filters['date'] ?? '');

        if ($view === '' && $dateValue === '') {
            return [null, null];
        }

        $date = DateTime::createFromFormat('Y-m-d', $dateValue ?: date('Y-m-d'));
        if ($date === false) {
            $date = new DateTime();
        }

        if ($view === 'day') {
            return [$date->format('Y-m-d'), $date->format('Y-m-d')];
        }

        if ($view === 'week') {
            $start = clone $date;
            $start->modify('monday this week');
            $end = clone $start;
            $end->modify('+6 days');

            return [$start->format('Y-m-d'), $end->format('Y-m-d')];
        }

        if ($view === 'month') {
            return [$date->format('Y-m-01'), $date->format('Y-m-t')];
        }

        return [$date->format('Y-m-d'), $date->format('Y-m-d')];
    }

    private function timeToMinutes(string $value): int
    {
        [$hour, $minute] = array_map('intval', array_slice(explode(':', $value), 0, 2));

        return ($hour * 60) + $minute;
    }

    private function minutesToTime(int $minutes): string
    {
        $minutes = max(0, min(23 * 60 + 59, $minutes));

        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }
}
