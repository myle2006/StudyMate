<?php

class StudentDashboardController extends Controller
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function index(): void
    {
        $studentId = $this->currentUserId();

        $todaySchedules = $this->todaySchedules($studentId);
        $upcomingSchedules = $this->upcomingSchedules($studentId);
        $upcomingAssignments = $this->upcomingAssignments($studentId);
        $assignmentOverview = $this->assignmentOverview($studentId);
        $roadmapProgress = $this->roadmapProgress($studentId);

        $this->json([
            'success' => true,
            'message' => 'Lấy dữ liệu dashboard sinh viên thành công.',
            'data' => [
                'summary' => [
                    'assigned_subject_count' => $this->assignedSubjectCount($studentId),
                    'today_schedule_count' => count($todaySchedules),
                    'upcoming_schedule_count' => $this->upcomingScheduleCount($studentId),
                    'upcoming_assignment_count' => count($upcomingAssignments),
                    'missing_submission_count' => $assignmentOverview['missing_count'],
                    'submitted_assignment_count' => $assignmentOverview['submitted_count'],
                    'active_roadmap_count' => $roadmapProgress['active_roadmap_count'],
                    'roadmap_progress_percent' => $roadmapProgress['overall_percent'],
                ],
                'today_schedules' => $todaySchedules,
                'upcoming_schedules' => $upcomingSchedules,
                'upcoming_assignments' => $upcomingAssignments,
                'assignment_overview' => $assignmentOverview,
                'latest_grade' => $this->latestGrade($studentId),
                'roadmap_progress' => $roadmapProgress,
                'generated_at' => date(DATE_ATOM),
            ],
        ]);
    }

    private function assignedSubjectCount(int $studentId): int
    {
        $statement = $this->db->prepare(
            'SELECT COUNT(*)
             FROM student_subjects ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.student_id = :student_id
               AND ss.status = :status
               AND s.deleted_at IS NULL'
        );
        $statement->execute([
            'student_id' => $studentId,
            'status' => 'active',
        ]);

        return (int) $statement->fetchColumn();
    }

    private function todaySchedules(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT ss.id, ss.user_id, ss.subject_id, ss.title, ss.description, ss.study_date,
                    TIME_FORMAT(ss.start_time, "%H:%i") AS start_time,
                    TIME_FORMAT(ss.end_time, "%H:%i") AS end_time,
                    ss.location, ss.schedule_type, ss.status, ss.roadmap_id, ss.roadmap_item_id,
                    s.subject_code, s.subject_name, s.color
             FROM study_schedules ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.user_id = :student_id
               AND ss.study_date = CURDATE()
               AND ss.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY ss.start_time ASC, ss.id ASC'
        );
        $statement->execute(['student_id' => $studentId]);

        return $statement->fetchAll();
    }

    private function upcomingSchedules(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT ss.id, ss.user_id, ss.subject_id, ss.title, ss.description, ss.study_date,
                    TIME_FORMAT(ss.start_time, "%H:%i") AS start_time,
                    TIME_FORMAT(ss.end_time, "%H:%i") AS end_time,
                    ss.location, ss.schedule_type, ss.status, ss.roadmap_id, ss.roadmap_item_id,
                    s.subject_code, s.subject_name, s.color
             FROM study_schedules ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.user_id = :student_id
               AND ss.study_date > CURDATE()
               AND ss.study_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)
               AND ss.status = :status
               AND ss.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY ss.study_date ASC, ss.start_time ASC, ss.id ASC
             LIMIT 5'
        );
        $statement->execute([
            'student_id' => $studentId,
            'status' => 'upcoming',
        ]);

        return $statement->fetchAll();
    }

    private function upcomingScheduleCount(int $studentId): int
    {
        $statement = $this->db->prepare(
            'SELECT COUNT(*)
             FROM study_schedules
             WHERE user_id = :student_id
               AND study_date > CURDATE()
               AND study_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)
               AND status = :status
               AND deleted_at IS NULL'
        );
        $statement->execute([
            'student_id' => $studentId,
            'status' => 'upcoming',
        ]);

        return (int) $statement->fetchColumn();
    }

    private function upcomingAssignments(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT a.id, a.subject_id, a.title, a.description, a.deadline, a.status,
                    s.subject_code, s.subject_name, s.color,
                    sub.id AS submission_id,
                    COALESCE(sub.status, :not_submitted_status) AS submission_status,
                    sub.submitted_at, sub.score, sub.feedback
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN assignment_submissions sub
                    ON sub.assignment_id = a.id AND sub.student_id = :student_id_submission
             WHERE ss.student_id = :student_id_subject
               AND ss.status = :student_subject_status
               AND a.status = :assignment_status
               AND a.deadline >= NOW()
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY a.deadline ASC, a.id ASC
             LIMIT 6'
        );
        $statement->execute([
            'student_id_submission' => $studentId,
            'student_id_subject' => $studentId,
            'student_subject_status' => 'active',
            'assignment_status' => 'open',
            'not_submitted_status' => 'not_submitted',
        ]);

        return $statement->fetchAll();
    }

    private function assignmentOverview(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT
                SUM(CASE WHEN sub.id IS NULL AND a.status = \'open\' THEN 1 ELSE 0 END) AS missing_count,
                SUM(CASE WHEN sub.id IS NULL AND a.status = \'open\' AND a.deadline < NOW() THEN 1 ELSE 0 END) AS overdue_missing_count,
                COUNT(DISTINCT sub.id) AS submitted_count
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN assignment_submissions sub
                    ON sub.assignment_id = a.id AND sub.student_id = :student_id_submission
             WHERE ss.student_id = :student_id_subject
               AND ss.status = :student_subject_status
               AND a.status <> :draft_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL'
        );
        $statement->execute([
            'student_id_submission' => $studentId,
            'student_id_subject' => $studentId,
            'student_subject_status' => 'active',
            'draft_status' => 'draft',
        ]);
        $row = $statement->fetch() ?: [];

        return [
            'missing_count' => (int) ($row['missing_count'] ?? 0),
            'overdue_missing_count' => (int) ($row['overdue_missing_count'] ?? 0),
            'submitted_count' => (int) ($row['submitted_count'] ?? 0),
        ];
    }

    private function latestGrade(int $studentId): ?array
    {
        $statement = $this->db->prepare(
            'SELECT sub.id, sub.assignment_id, sub.score, sub.feedback, sub.status,
                    sub.submitted_at, sub.graded_at,
                    grader.full_name AS graded_by_name,
                    a.title AS assignment_title, a.deadline,
                    s.id AS subject_id, s.subject_code, s.subject_name, s.color
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN users grader ON grader.id = sub.graded_by
             WHERE sub.student_id = :student_id_submission
               AND ss.student_id = :student_id_subject
               AND ss.status = :student_subject_status
               AND (sub.score IS NOT NULL OR sub.feedback IS NOT NULL)
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY sub.graded_at DESC, sub.updated_at DESC, sub.id DESC
             LIMIT 1'
        );
        $statement->execute([
            'student_id_submission' => $studentId,
            'student_id_subject' => $studentId,
            'student_subject_status' => 'active',
        ]);
        $grade = $statement->fetch();

        return $grade ?: null;
    }

    private function roadmapProgress(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT r.id, r.title, r.goal, r.status, r.progress_percent,
                    r.start_date, r.end_date,
                    s.subject_code, s.subject_name, s.color,
                    COUNT(i.id) AS total_items,
                    SUM(CASE WHEN i.status = \'completed\' THEN 1 ELSE 0 END) AS completed_items,
                    SUM(CASE WHEN i.status IN (\'not_started\', \'in_progress\', \'rescheduled\') THEN 1 ELSE 0 END) AS pending_items
             FROM learning_roadmaps r
             INNER JOIN subjects s ON s.id = r.subject_id
             LEFT JOIN learning_roadmap_items i ON i.roadmap_id = r.id
             WHERE r.user_id = :student_id
               AND r.deleted_at IS NULL
               AND s.deleted_at IS NULL
             GROUP BY r.id, r.title, r.goal, r.status, r.progress_percent, r.start_date, r.end_date,
                      s.subject_code, s.subject_name, s.color
             ORDER BY FIELD(r.status, \'active\', \'draft\', \'paused\', \'completed\'), r.updated_at DESC, r.id DESC'
        );
        $statement->execute(['student_id' => $studentId]);
        $roadmaps = array_map([$this, 'formatRoadmapProgress'], $statement->fetchAll());

        $totalItems = array_sum(array_column($roadmaps, 'total_items'));
        $completedItems = array_sum(array_column($roadmaps, 'completed_items'));
        $overallPercent = $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0.0;

        return [
            'overall_percent' => $overallPercent,
            'active_roadmap_count' => count(array_filter($roadmaps, static fn (array $roadmap): bool => $roadmap['status'] === 'active')),
            'total_roadmap_count' => count($roadmaps),
            'total_items' => $totalItems,
            'completed_items' => $completedItems,
            'roadmaps' => array_slice($roadmaps, 0, 4),
        ];
    }

    private function formatRoadmapProgress(array $row): array
    {
        $total = (int) ($row['total_items'] ?? 0);
        $completed = (int) ($row['completed_items'] ?? 0);

        return [
            ...$row,
            'progress_percent' => $total > 0 ? round(($completed / $total) * 100, 2) : (float) ($row['progress_percent'] ?? 0),
            'total_items' => $total,
            'completed_items' => $completed,
            'pending_items' => (int) ($row['pending_items'] ?? 0),
        ];
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }
}
