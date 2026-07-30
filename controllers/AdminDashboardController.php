<?php

class AdminDashboardController extends Controller
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function index(): void
    {
        $upcomingDeadlines = $this->upcomingDeadlines();

        $this->json([
            'success' => true,
            'message' => 'Lấy dữ liệu dashboard admin thành công.',
            'data' => [
                'summary' => [
                    'student_count' => $this->studentCount(),
                    'subject_count' => $this->subjectCount(),
                    'assignment_count' => $this->assignmentCount(),
                    'submission_count' => $this->submissionCount(),
                    'missing_submission_count' => $this->missingSubmissionCount(),
                    'graded_submission_count' => $this->gradedSubmissionCount(),
                    'upcoming_deadline_count' => $this->upcomingDeadlineCount(),
                ],
                'upcoming_deadlines' => $upcomingDeadlines,
                'recent_students' => $this->recentStudents(),
                'top_subjects' => $this->topSubjects(),
                'recent_activity' => $this->recentActivity(),
                'generated_at' => date(DATE_ATOM),
            ],
        ]);
    }

    private function studentCount(): int
    {
        $statement = $this->db->prepare(
            'SELECT COUNT(*)
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id
             WHERE r.name = :role_name'
        );
        $statement->execute(['role_name' => 'student']);

        return (int) $statement->fetchColumn();
    }

    private function subjectCount(): int
    {
        $statement = $this->db->query('SELECT COUNT(*) FROM subjects WHERE deleted_at IS NULL');

        return (int) $statement->fetchColumn();
    }

    private function assignmentCount(): int
    {
        $statement = $this->db->query('SELECT COUNT(*) FROM assignments WHERE deleted_at IS NULL');

        return (int) $statement->fetchColumn();
    }

    private function submissionCount(): int
    {
        $statement = $this->db->query('SELECT COUNT(*) FROM assignment_submissions');

        return (int) $statement->fetchColumn();
    }

    private function missingSubmissionCount(): int
    {
        $statement = $this->db->prepare(
            'SELECT COUNT(*)
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN assignment_submissions sub
                    ON sub.assignment_id = a.id AND sub.student_id = ss.student_id
             WHERE ss.status = :student_subject_status
               AND a.status = :assignment_status
               AND sub.id IS NULL
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL'
        );
        $statement->execute([
            'student_subject_status' => 'active',
            'assignment_status' => 'open',
        ]);

        return (int) $statement->fetchColumn();
    }

    private function gradedSubmissionCount(): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM assignment_submissions WHERE status = :status');
        $statement->execute(['status' => 'graded']);

        return (int) $statement->fetchColumn();
    }

    private function upcomingDeadlines(): array
    {
        $statement = $this->db->prepare(
            'SELECT a.id, a.subject_id, a.title, a.deadline, a.status,
                    s.subject_code, s.subject_name, s.color,
                    COUNT(DISTINCT ss.student_id) AS assigned_student_count,
                    COUNT(DISTINCT sub.id) AS submitted_count,
                    GREATEST(COUNT(DISTINCT ss.student_id) - COUNT(DISTINCT sub.id), 0) AS missing_count
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id AND ss.status = :student_subject_status
             LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = ss.student_id
             WHERE a.status = :assignment_status
               AND a.deadline >= NOW()
               AND a.deadline <= DATE_ADD(NOW(), INTERVAL 14 DAY)
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             GROUP BY a.id, a.subject_id, a.title, a.deadline, a.status, s.subject_code, s.subject_name, s.color
             ORDER BY a.deadline ASC, a.id ASC
             LIMIT 8'
        );
        $statement->execute([
            'student_subject_status' => 'active',
            'assignment_status' => 'open',
        ]);

        return array_map([$this, 'formatDeadline'], $statement->fetchAll());
    }

    private function upcomingDeadlineCount(): int
    {
        $statement = $this->db->prepare(
            'SELECT COUNT(*)
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             WHERE a.status = :assignment_status
               AND a.deadline >= NOW()
               AND a.deadline <= DATE_ADD(NOW(), INTERVAL 14 DAY)
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL'
        );
        $statement->execute(['assignment_status' => 'open']);

        return (int) $statement->fetchColumn();
    }

    private function formatDeadline(array $row): array
    {
        return [
            ...$row,
            'assigned_student_count' => (int) ($row['assigned_student_count'] ?? 0),
            'submitted_count' => (int) ($row['submitted_count'] ?? 0),
            'missing_count' => (int) ($row['missing_count'] ?? 0),
        ];
    }

    private function recentStudents(): array
    {
        $statement = $this->db->prepare(
            'SELECT u.id, u.full_name, u.email, u.student_code, u.status, u.created_at, u.last_login_at,
                    COUNT(ss.id) AS assigned_subject_count
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id
             LEFT JOIN student_subjects ss ON ss.student_id = u.id AND ss.status = :student_subject_status
             WHERE r.name = :role_name
             GROUP BY u.id, u.full_name, u.email, u.student_code, u.status, u.created_at, u.last_login_at
             ORDER BY u.created_at DESC, u.id DESC
             LIMIT 6'
        );
        $statement->execute([
            'role_name' => 'student',
            'student_subject_status' => 'active',
        ]);

        return array_map(static function (array $row): array {
            return [
                ...$row,
                'assigned_subject_count' => (int) ($row['assigned_subject_count'] ?? 0),
            ];
        }, $statement->fetchAll());
    }

    private function topSubjects(): array
    {
        $statement = $this->db->prepare(
            'SELECT s.id, s.subject_code, s.subject_name, s.color, s.status,
                    COUNT(ss.student_id) AS student_count
             FROM subjects s
             LEFT JOIN student_subjects ss ON ss.subject_id = s.id AND ss.status = :student_subject_status
             WHERE s.deleted_at IS NULL
             GROUP BY s.id, s.subject_code, s.subject_name, s.color, s.status
             ORDER BY student_count DESC, s.subject_name ASC
             LIMIT 5'
        );
        $statement->execute(['student_subject_status' => 'active']);

        return array_map(static function (array $row): array {
            return [
                ...$row,
                'student_count' => (int) ($row['student_count'] ?? 0),
            ];
        }, $statement->fetchAll());
    }

    private function recentActivity(): array
    {
        $statement = $this->db->prepare(
            'SELECT sub.id, sub.status, sub.submitted_at, sub.graded_at, sub.score,
                    u.full_name AS student_name,
                    a.title AS assignment_title,
                    s.subject_code, s.subject_name
             FROM assignment_submissions sub
             INNER JOIN users u ON u.id = sub.student_id
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             WHERE a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY COALESCE(sub.graded_at, sub.submitted_at, sub.updated_at) DESC, sub.id DESC
             LIMIT 6'
        );
        $statement->execute();

        $activities = array_map(static function (array $row): array {
            $isGraded = $row['status'] === 'graded';

            return [
                'type' => $isGraded ? 'grade' : 'submission',
                'title' => $isGraded ? 'Bài nộp đã được chấm' : 'Sinh viên nộp bài',
                'description' => trim(($row['student_name'] ?? 'Sinh viên') . ' · ' . ($row['assignment_title'] ?? 'Bài tập')),
                'meta' => trim(($row['subject_code'] ?? '') . ' · ' . ($row['subject_name'] ?? '')),
                'occurred_at' => $isGraded ? ($row['graded_at'] ?? $row['submitted_at']) : $row['submitted_at'],
                'score' => $row['score'],
            ];
        }, $statement->fetchAll());

        usort($activities, static function (array $left, array $right): int {
            return strcmp((string) ($right['occurred_at'] ?? ''), (string) ($left['occurred_at'] ?? ''));
        });

        return array_slice($activities, 0, 8);
    }
}
