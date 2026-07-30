<?php

class NotificationService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function listForUser(array $user, array $filters = []): array
    {
        $userId = (int) ($user['id'] ?? 0);
        $notifications = $this->generatedNotifications($user);
        $readKeys = $this->readKeys($userId);

        $notifications = array_map(static function (array $notification) use ($readKeys): array {
            $notification['read'] = array_key_exists((string) $notification['key'], $readKeys);
            $notification['read_at'] = $readKeys[$notification['key']] ?? null;

            return $notification;
        }, $notifications);

        if (($filters['status'] ?? '') === 'unread') {
            $notifications = array_values(array_filter($notifications, static fn (array $item): bool => ! $item['read']));
        }

        usort($notifications, static function (array $left, array $right): int {
            return strcmp((string) ($right['occurred_at'] ?? ''), (string) ($left['occurred_at'] ?? ''));
        });

        return $notifications;
    }

    public function unreadCount(array $user): int
    {
        return count(array_filter($this->listForUser($user), static fn (array $item): bool => ! $item['read']));
    }

    public function markRead(int $userId, string $notificationKey): void
    {
        $statement = $this->db->prepare(
            'INSERT INTO notification_reads (user_id, notification_key, read_at)
             VALUES (:user_id, :notification_key, NOW())
             ON DUPLICATE KEY UPDATE read_at = VALUES(read_at)'
        );
        $statement->execute([
            'user_id' => $userId,
            'notification_key' => $notificationKey,
        ]);
    }

    public function markAllRead(array $user): int
    {
        $count = 0;
        foreach ($this->generatedNotifications($user) as $notification) {
            $this->markRead((int) $user['id'], (string) $notification['key']);
            $count++;
        }

        return $count;
    }

    private function generatedNotifications(array $user): array
    {
        $role = strtolower((string) ($user['role'] ?? ''));

        if ($role === 'admin') {
            return $this->adminNotifications();
        }

        return $this->studentNotifications((int) ($user['id'] ?? 0));
    }

    private function studentNotifications(int $studentId): array
    {
        return array_merge(
            $this->studentAssignmentDueNotifications($studentId),
            $this->studentScheduleTodayNotifications($studentId),
            $this->studentRoadmapOverdueNotifications($studentId)
        );
    }

    private function studentAssignmentDueNotifications(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT a.id, a.title, a.deadline, s.subject_code, s.subject_name
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = :student_id_submission
             WHERE ss.student_id = :student_id_subject
               AND ss.status = :student_subject_status
               AND a.status = :assignment_status
               AND a.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
               AND sub.id IS NULL
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY a.deadline ASC'
        );
        $statement->execute([
            'student_id_submission' => $studentId,
            'student_id_subject' => $studentId,
            'student_subject_status' => 'active',
            'assignment_status' => 'open',
        ]);

        return array_map(static function (array $row): array {
            $deadline = strtotime((string) $row['deadline']);
            $hoursLeft = $deadline > 0 ? ($deadline - time()) / 3600 : 99;

            return [
                'key' => 'assignment_due:' . $row['id'],
                'type' => 'assignment_due',
                'tone' => $hoursLeft <= 24 ? 'rose' : 'amber',
                'title' => 'Bài tập sắp đến hạn',
                'message' => $row['subject_code'] . ' - ' . $row['title'],
                'meta' => 'Hạn nộp: ' . $row['deadline'],
                'link' => '/student/assignments/' . $row['id'],
                'occurred_at' => $row['deadline'],
            ];
        }, $statement->fetchAll());
    }

    private function studentScheduleTodayNotifications(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT ss.id, ss.title, ss.study_date, TIME_FORMAT(ss.start_time, "%H:%i") AS start_time,
                    TIME_FORMAT(ss.end_time, "%H:%i") AS end_time, s.subject_code, s.subject_name
             FROM study_schedules ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.user_id = :student_id
               AND ss.study_date = CURDATE()
               AND ss.status = :status
               AND ss.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY ss.start_time ASC'
        );
        $statement->execute([
            'student_id' => $studentId,
            'status' => 'upcoming',
        ]);

        return array_map(static fn (array $row): array => [
            'key' => 'schedule_today:' . $row['id'] . ':' . $row['study_date'],
            'type' => 'schedule_today',
            'tone' => 'blue',
            'title' => 'Lịch học hôm nay',
            'message' => $row['subject_code'] . ' - ' . $row['title'],
            'meta' => $row['start_time'] . ' - ' . $row['end_time'],
            'link' => '/student/schedules/' . $row['id'],
            'occurred_at' => $row['study_date'] . ' ' . $row['start_time'] . ':00',
        ], $statement->fetchAll());
    }

    private function studentRoadmapOverdueNotifications(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT r.id, r.title, r.progress_percent, s.subject_code, s.subject_name,
                    MIN(i.planned_date) AS overdue_date,
                    COUNT(i.id) AS overdue_item_count
             FROM learning_roadmaps r
             INNER JOIN subjects s ON s.id = r.subject_id
             INNER JOIN learning_roadmap_items i ON i.roadmap_id = r.id
             WHERE r.user_id = :student_id
               AND r.status = :status
               AND r.deleted_at IS NULL
               AND s.deleted_at IS NULL
               AND i.planned_date < CURDATE()
               AND i.status IN (\'not_started\', \'in_progress\', \'rescheduled\', \'not_completed\')
             GROUP BY r.id, r.title, r.progress_percent, s.subject_code, s.subject_name
             ORDER BY overdue_date ASC'
        );
        $statement->execute([
            'student_id' => $studentId,
            'status' => 'active',
        ]);

        return array_map(static fn (array $row): array => [
            'key' => 'roadmap_overdue:' . $row['id'],
            'type' => 'roadmap_overdue',
            'tone' => 'rose',
            'title' => 'Lộ trình bị trễ tiến độ',
            'message' => $row['subject_code'] . ' - ' . $row['title'],
            'meta' => $row['overdue_item_count'] . ' nhiệm vụ quá hạn, tiến độ ' . round((float) $row['progress_percent']) . '%',
            'link' => '/student/roadmaps/' . $row['id'],
            'occurred_at' => $row['overdue_date'] . ' 00:00:00',
        ], $statement->fetchAll());
    }

    private function adminNotifications(): array
    {
        $statement = $this->db->prepare(
            'SELECT a.id, a.title, a.deadline, s.subject_code, s.subject_name,
                    COUNT(DISTINCT ss.student_id) AS assigned_count,
                    COUNT(DISTINCT sub.id) AS submitted_count
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id AND ss.status = :student_subject_status
             LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = ss.student_id
             WHERE a.status = :assignment_status
               AND a.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             GROUP BY a.id, a.title, a.deadline, s.subject_code, s.subject_name
             ORDER BY a.deadline ASC'
        );
        $statement->execute([
            'student_subject_status' => 'active',
            'assignment_status' => 'open',
        ]);

        return array_map(static function (array $row): array {
            $missing = max(0, (int) $row['assigned_count'] - (int) $row['submitted_count']);

            return [
                'key' => 'admin_assignment_due:' . $row['id'],
                'type' => 'admin_assignment_due',
                'tone' => $missing > 0 ? 'amber' : 'green',
                'title' => 'Deadline bài tập sắp tới',
                'message' => $row['subject_code'] . ' - ' . $row['title'],
                'meta' => $missing . ' sinh viên chưa nộp, hạn: ' . $row['deadline'],
                'link' => '/admin/assignments/' . $row['id'],
                'occurred_at' => $row['deadline'],
            ];
        }, $statement->fetchAll());
    }

    private function readKeys(int $userId): array
    {
        $statement = $this->db->prepare(
            'SELECT notification_key, read_at
             FROM notification_reads
             WHERE user_id = :user_id'
        );
        $statement->execute(['user_id' => $userId]);

        $keys = [];
        foreach ($statement->fetchAll() as $row) {
            $keys[(string) $row['notification_key']] = $row['read_at'];
        }

        return $keys;
    }
}
