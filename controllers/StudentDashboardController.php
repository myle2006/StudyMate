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
        $learningGoalOverview = $this->learningGoalOverview($studentId);

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
                    'active_learning_goal_count' => $learningGoalOverview['active_count'],
                    'near_deadline_learning_goal_count' => $learningGoalOverview['near_deadline_count'],
                    'learning_goal_progress_percent' => $learningGoalOverview['average_progress_percent'],
                ],
                'today_schedules' => $todaySchedules,
                'upcoming_schedules' => $upcomingSchedules,
                'upcoming_assignments' => $upcomingAssignments,
                'assignment_overview' => $assignmentOverview,
                'latest_grade' => $this->latestGrade($studentId),
                'roadmap_progress' => $roadmapProgress,
                'learning_goal_overview' => $learningGoalOverview,
                'next_learning_step' => $this->nextLearningStep($studentId),
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
                    s.subject_code, s.subject_name, s.color,
                    r.learning_goal_id,
                    lg.title AS learning_goal_title
             FROM study_schedules ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             LEFT JOIN learning_roadmap_items ri ON ri.id = ss.roadmap_item_id
             LEFT JOIN learning_roadmaps r
                    ON r.id = COALESCE(ss.roadmap_id, ri.roadmap_id)
                   AND r.user_id = ss.user_id
                   AND r.deleted_at IS NULL
             LEFT JOIN learning_goals lg ON lg.id = r.learning_goal_id AND lg.deleted_at IS NULL
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
                    s.subject_code, s.subject_name, s.color,
                    r.learning_goal_id,
                    lg.title AS learning_goal_title
             FROM study_schedules ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             LEFT JOIN learning_roadmap_items ri ON ri.id = ss.roadmap_item_id
             LEFT JOIN learning_roadmaps r
                    ON r.id = COALESCE(ss.roadmap_id, ri.roadmap_id)
                   AND r.user_id = ss.user_id
                   AND r.deleted_at IS NULL
             LEFT JOIN learning_goals lg ON lg.id = r.learning_goal_id AND lg.deleted_at IS NULL
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
             INNER JOIN student_subjects ss ON ss.subject_id = s.id AND ss.class_id = a.class_id
             LEFT JOIN assignment_submissions sub
                    ON sub.assignment_id = a.id AND sub.student_id = :student_id_submission
             WHERE ss.student_id = :student_id_subject
               AND ss.status = :student_subject_status
               AND a.status = :assignment_status
               AND a.deadline >= NOW()
               AND sub.id IS NULL
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
             INNER JOIN student_subjects ss ON ss.subject_id = s.id AND ss.class_id = a.class_id
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
             INNER JOIN student_subjects ss ON ss.subject_id = s.id AND ss.class_id = a.class_id
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

    private function learningGoalOverview(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT lg.id, lg.title, lg.goal_description, lg.status, lg.start_date, lg.end_date,
                    s.subject_code, s.subject_name, s.color,
                    stats.roadmap_count,
                    stats.active_roadmap_count,
                    stats.primary_roadmap_id,
                    stats.primary_roadmap_title,
                    stats.average_progress_percent
             FROM learning_goals lg
             INNER JOIN subjects s ON s.id = lg.subject_id
             LEFT JOIN (
                SELECT learning_goal_id,
                       COUNT(*) AS roadmap_count,
                       SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) AS active_roadmap_count,
                       SUBSTRING_INDEX(GROUP_CONCAT(id ORDER BY FIELD(status, "active", "draft", "paused", "completed"), updated_at DESC SEPARATOR ","), ",", 1) AS primary_roadmap_id,
                       SUBSTRING_INDEX(GROUP_CONCAT(title ORDER BY FIELD(status, "active", "draft", "paused", "completed"), updated_at DESC SEPARATOR "||"), "||", 1) AS primary_roadmap_title,
                       AVG(progress_percent) AS average_progress_percent
                FROM learning_roadmaps
                WHERE user_id = :student_id_stats
                  AND deleted_at IS NULL
                  AND learning_goal_id IS NOT NULL
                GROUP BY learning_goal_id
             ) stats ON stats.learning_goal_id = lg.id
             WHERE lg.user_id = :student_id
               AND lg.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY FIELD(lg.status, "active", "paused", "completed", "cancelled"),
                      lg.end_date IS NULL ASC,
                      lg.end_date ASC,
                      lg.updated_at DESC'
        );
        $statement->execute([
            'student_id_stats' => $studentId,
            'student_id' => $studentId,
        ]);

        $goals = array_map(static function (array $goal): array {
            return [
                ...$goal,
                'roadmap_count' => (int) ($goal['roadmap_count'] ?? 0),
                'active_roadmap_count' => (int) ($goal['active_roadmap_count'] ?? 0),
                'average_progress_percent' => round((float) ($goal['average_progress_percent'] ?? 0), 2),
                'is_overdue' => ($goal['status'] ?? '') === 'active'
                    && ! empty($goal['end_date'])
                    && $goal['end_date'] < date('Y-m-d'),
                'is_near_deadline' => ($goal['status'] ?? '') === 'active'
                    && ! empty($goal['end_date'])
                    && $goal['end_date'] >= date('Y-m-d')
                    && $goal['end_date'] <= date('Y-m-d', strtotime('+7 days')),
                'has_roadmap' => (int) ($goal['roadmap_count'] ?? 0) > 0,
            ];
        }, $statement->fetchAll());

        $activeGoals = array_values(array_filter($goals, static fn (array $goal): bool => ($goal['status'] ?? '') === 'active'));
        $totalProgress = array_sum(array_map(static fn (array $goal): float => (float) $goal['average_progress_percent'], $activeGoals));

        return [
            'active_count' => count($activeGoals),
            'near_deadline_count' => count(array_filter($activeGoals, static fn (array $goal): bool => (bool) $goal['is_near_deadline'])),
            'overdue_count' => count(array_filter($activeGoals, static fn (array $goal): bool => (bool) $goal['is_overdue'])),
            'without_roadmap_count' => count(array_filter($activeGoals, static fn (array $goal): bool => ! (bool) $goal['has_roadmap'])),
            'average_progress_percent' => count($activeGoals) > 0 ? round($totalProgress / count($activeGoals), 2) : 0.0,
            'goals' => array_slice($goals, 0, 8),
        ];
    }

    private function nextLearningStep(int $studentId): ?array
    {
        $statement = $this->db->prepare(
            'SELECT r.id, r.title, r.status, r.progress_percent,
                    s.subject_code, s.subject_name, s.color
             FROM learning_roadmaps r
             INNER JOIN subjects s ON s.id = r.subject_id
             WHERE r.user_id = :student_id
               AND r.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY
               FIELD(r.status, "active", "draft", "paused", "completed"),
               r.updated_at DESC,
               r.id DESC'
        );
        $statement->execute(['student_id' => $studentId]);

        $itemModel = new LearningRoadmapItem();
        foreach ($statement->fetchAll() as $roadmap) {
            $items = $itemModel->getForRoadmap((int) $roadmap['id'], $studentId);
            $step = $this->pickNextUnlockedItem($items);
            if ($step !== null) {
                return [
                    ...$step,
                    'roadmap_title' => $roadmap['title'],
                    'roadmap_status' => $roadmap['status'],
                    'progress_percent' => $roadmap['progress_percent'],
                    'subject_code' => $roadmap['subject_code'],
                    'subject_name' => $roadmap['subject_name'],
                    'color' => $roadmap['color'],
                ];
            }
        }

        return null;
    }

    private function pickNextUnlockedItem(array $items): ?array
    {
        $itemsById = [];
        foreach ($items as $item) {
            $itemsById[(int) $item['id']] = $item;
        }

        $candidates = [
            static fn (array $item): bool => ($item['status'] ?? '') === 'in_progress',
            static fn (array $item): bool => ! empty($item['assignment_id']) && ($item['assignment_submission_status'] ?? '') !== 'graded',
            static fn (array $item): bool => true,
        ];

        foreach ($candidates as $matches) {
            foreach ($items as $index => $item) {
                if (($item['status'] ?? '') === 'completed' || ! $matches($item)) {
                    continue;
                }
                if ($this->itemIsUnlocked($items, $itemsById, $index)) {
                    return $item;
                }
            }
        }

        return null;
    }

    private function itemIsUnlocked(array $items, array $itemsById, int $index): bool
    {
        foreach (array_slice($items, 0, $index) as $previousItem) {
            $isRequired = (int) ($previousItem['is_required'] ?? 1) === 1;
            $allowSkip = (int) ($previousItem['allow_skip'] ?? 0) === 1;
            if ($isRequired && ! $allowSkip && ! $this->itemIsEffectivelyCompleted($previousItem)) {
                return false;
            }
        }

        foreach (($items[$index]['prerequisite_item_ids'] ?? []) as $prerequisiteItemId) {
            $prerequisite = $itemsById[(int) $prerequisiteItemId] ?? null;
            if ($prerequisite !== null && ! $this->itemIsEffectivelyCompleted($prerequisite)) {
                return false;
            }
        }

        return true;
    }

    private function itemIsEffectivelyCompleted(array $item): bool
    {
        if (($item['status'] ?? '') !== 'completed') {
            return false;
        }

        if (! empty($item['assignment_id'])) {
            $score = $item['assignment_score'] ?? null;
            return $score !== null && (float) $score >= 7.0;
        }

        return true;
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }
}
