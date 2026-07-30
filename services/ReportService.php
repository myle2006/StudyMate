<?php

class ReportService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function students(array $filters): array
    {
        $params = ['role_name' => 'student'];
        $where = ['r.name = :role_name'];
        $joins = ['INNER JOIN roles r ON r.id = u.role_id'];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $joins[] = 'INNER JOIN student_subjects ss_filter ON ss_filter.student_id = u.id AND ss_filter.status = :filter_subject_status';
            $where[] = 'ss_filter.subject_id = :subject_id';
            $params['filter_subject_status'] = 'active';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['student_id']) && ctype_digit((string) $filters['student_id'])) {
            $where[] = 'u.id = :student_id';
            $params['student_id'] = (int) $filters['student_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['active', 'inactive', 'locked'], true)) {
            $where[] = 'u.status = :status';
            $params['status'] = $filters['status'];
        }

        $this->applyDateRange($filters, $where, $params, 'u.created_at');

        $statement = $this->db->prepare(
            'SELECT u.id, u.full_name, u.email, u.phone, u.student_code, u.status,
                    u.last_login_at, u.created_at, u.updated_at,
                    COUNT(DISTINCT ss.subject_id) AS assigned_subject_count
             FROM users u
             ' . implode(' ', $joins) . '
             LEFT JOIN student_subjects ss ON ss.student_id = u.id AND ss.status = :active_subject_status
             WHERE ' . implode(' AND ', $where) . '
             GROUP BY u.id, u.full_name, u.email, u.phone, u.student_code, u.status, u.last_login_at, u.created_at, u.updated_at
             ORDER BY u.created_at DESC, u.id DESC'
        );
        $params['active_subject_status'] = 'active';
        $statement->execute($params);

        return [
            'filename' => $this->filename('students'),
            'headers' => ['ID', 'Họ tên', 'Email', 'Số điện thoại', 'Mã sinh viên', 'Trạng thái', 'Số môn được gán', 'Đăng nhập gần nhất', 'Ngày tạo', 'Ngày cập nhật'],
            'rows' => array_map(static fn (array $row): array => [
                $row['id'],
                $row['full_name'],
                $row['email'],
                $row['phone'],
                $row['student_code'],
                $row['status'],
                $row['assigned_subject_count'],
                $row['last_login_at'],
                $row['created_at'],
                $row['updated_at'],
            ], $statement->fetchAll()),
        ];
    }

    public function subjects(array $filters): array
    {
        $params = ['active_assignment_status' => 'active'];
        $where = ['s.deleted_at IS NULL'];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 's.id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['studying', 'paused', 'completed'], true)) {
            $where[] = 's.status = :status';
            $params['status'] = $filters['status'];
        }

        $this->applyDateRange($filters, $where, $params, 's.created_at');

        $statement = $this->db->prepare(
            'SELECT s.id, s.subject_code, s.subject_name, s.description, s.credits,
                    s.status, s.color, s.created_at, s.updated_at,
                    creator.full_name AS created_by_name,
                    COUNT(DISTINCT ss.student_id) AS student_count
             FROM subjects s
             LEFT JOIN users creator ON creator.id = s.created_by
             LEFT JOIN student_subjects ss ON ss.subject_id = s.id AND ss.status = :active_assignment_status
             WHERE ' . implode(' AND ', $where) . '
             GROUP BY s.id, s.subject_code, s.subject_name, s.description, s.credits, s.status, s.color, s.created_at, s.updated_at, creator.full_name
             ORDER BY s.created_at DESC, s.id DESC'
        );
        $statement->execute($params);

        return [
            'filename' => $this->filename('subjects'),
            'headers' => ['ID', 'Mã môn', 'Tên môn', 'Mô tả', 'Tín chỉ', 'Trạng thái', 'Màu', 'Người tạo', 'Số sinh viên', 'Ngày tạo', 'Ngày cập nhật'],
            'rows' => array_map(static fn (array $row): array => [
                $row['id'],
                $row['subject_code'],
                $row['subject_name'],
                $row['description'],
                $row['credits'],
                $row['status'],
                $row['color'],
                $row['created_by_name'],
                $row['student_count'],
                $row['created_at'],
                $row['updated_at'],
            ], $statement->fetchAll()),
        ];
    }

    public function studentSubjects(array $filters): array
    {
        $params = [];
        $where = ['s.deleted_at IS NULL'];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'ss.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['student_id']) && ctype_digit((string) $filters['student_id'])) {
            $where[] = 'ss.student_id = :student_id';
            $params['student_id'] = (int) $filters['student_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['active', 'removed'], true)) {
            $where[] = 'ss.status = :status';
            $params['status'] = $filters['status'];
        }

        $this->applyDateRange($filters, $where, $params, 'ss.assigned_at');

        $statement = $this->db->prepare(
            'SELECT ss.id, ss.student_id, u.full_name, u.email, u.student_code,
                    ss.subject_id, s.subject_code, s.subject_name,
                    ss.status, assigner.full_name AS assigned_by_name,
                    ss.assigned_at, ss.removed_at
             FROM student_subjects ss
             INNER JOIN users u ON u.id = ss.student_id
             INNER JOIN subjects s ON s.id = ss.subject_id
             LEFT JOIN users assigner ON assigner.id = ss.assigned_by
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY s.subject_name ASC, u.full_name ASC'
        );
        $statement->execute($params);

        return [
            'filename' => $this->filename('student_subjects'),
            'headers' => ['ID', 'ID sinh viên', 'Họ tên', 'Email', 'Mã sinh viên', 'ID môn', 'Mã môn', 'Tên môn', 'Trạng thái gán', 'Người gán', 'Ngày gán', 'Ngày gỡ'],
            'rows' => array_map(static fn (array $row): array => [
                $row['id'],
                $row['student_id'],
                $row['full_name'],
                $row['email'],
                $row['student_code'],
                $row['subject_id'],
                $row['subject_code'],
                $row['subject_name'],
                $row['status'],
                $row['assigned_by_name'],
                $row['assigned_at'],
                $row['removed_at'],
            ], $statement->fetchAll()),
        ];
    }

    public function assignments(array $filters): array
    {
        $params = [];
        $where = ['a.deleted_at IS NULL', 's.deleted_at IS NULL'];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'a.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['open', 'closed', 'draft'], true)) {
            $where[] = 'a.status = :status';
            $params['status'] = $filters['status'];
        }

        $this->applyDateRange($filters, $where, $params, 'a.deadline');

        $statement = $this->db->prepare(
            'SELECT a.id, a.subject_id, s.subject_code, s.subject_name,
                    a.title, a.description, a.deadline, a.status,
                    creator.full_name AS created_by_name,
                    COUNT(DISTINCT ss.student_id) AS assigned_student_count,
                    COUNT(DISTINCT sub.id) AS submission_count,
                    a.created_at, a.updated_at
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             LEFT JOIN users creator ON creator.id = a.created_by
             LEFT JOIN student_subjects ss ON ss.subject_id = s.id AND ss.status = :active_assignment_status
             LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id
             WHERE ' . implode(' AND ', $where) . '
             GROUP BY a.id, a.subject_id, s.subject_code, s.subject_name, a.title, a.description, a.deadline, a.status, creator.full_name, a.created_at, a.updated_at
             ORDER BY a.deadline ASC, a.id DESC'
        );
        $params['active_assignment_status'] = 'active';
        $statement->execute($params);

        return [
            'filename' => $this->filename('assignments'),
            'headers' => ['ID', 'ID môn', 'Mã môn', 'Tên môn', 'Tiêu đề', 'Mô tả', 'Deadline', 'Trạng thái', 'Người tạo', 'Số sinh viên được giao', 'Số bài nộp', 'Ngày tạo', 'Ngày cập nhật'],
            'rows' => array_map(static fn (array $row): array => [
                $row['id'],
                $row['subject_id'],
                $row['subject_code'],
                $row['subject_name'],
                $row['title'],
                $row['description'],
                $row['deadline'],
                $row['status'],
                $row['created_by_name'],
                $row['assigned_student_count'],
                $row['submission_count'],
                $row['created_at'],
                $row['updated_at'],
            ], $statement->fetchAll()),
        ];
    }

    public function submissions(array $filters): array
    {
        $params = [];
        $where = ['a.deleted_at IS NULL', 's.deleted_at IS NULL'];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'a.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['student_id']) && ctype_digit((string) $filters['student_id'])) {
            $where[] = 'sub.student_id = :student_id';
            $params['student_id'] = (int) $filters['student_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['submitted', 'late', 'graded'], true)) {
            $where[] = 'sub.status = :status';
            $params['status'] = $filters['status'];
        }

        $this->applyDateRange($filters, $where, $params, 'sub.submitted_at');

        $statement = $this->db->prepare(
            'SELECT sub.id, sub.assignment_id, a.title AS assignment_title,
                    sub.student_id, u.full_name, u.email, u.student_code,
                    s.id AS subject_id, s.subject_code, s.subject_name,
                    sub.content, sub.file_path, sub.status, sub.submitted_at,
                    sub.score, sub.feedback, grader.full_name AS graded_by_name, sub.graded_at
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN users u ON u.id = sub.student_id
             LEFT JOIN users grader ON grader.id = sub.graded_by
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY sub.submitted_at DESC, sub.id DESC'
        );
        $statement->execute($params);

        return [
            'filename' => $this->filename('submissions'),
            'headers' => ['ID bài nộp', 'ID bài tập', 'Tên bài tập', 'ID sinh viên', 'Họ tên', 'Email', 'Mã sinh viên', 'ID môn', 'Mã môn', 'Tên môn', 'Nội dung', 'File', 'Trạng thái', 'Ngày nộp', 'Điểm', 'Feedback', 'Người chấm', 'Ngày chấm'],
            'rows' => array_map(static fn (array $row): array => [
                $row['id'],
                $row['assignment_id'],
                $row['assignment_title'],
                $row['student_id'],
                $row['full_name'],
                $row['email'],
                $row['student_code'],
                $row['subject_id'],
                $row['subject_code'],
                $row['subject_name'],
                $row['content'],
                $row['file_path'],
                $row['status'],
                $row['submitted_at'],
                $row['score'],
                $row['feedback'],
                $row['graded_by_name'],
                $row['graded_at'],
            ], $statement->fetchAll()),
        ];
    }

    public function grades(array $filters): array
    {
        $params = ['graded_status' => 'graded'];
        $where = [
            'sub.status = :graded_status',
            'a.deleted_at IS NULL',
            's.deleted_at IS NULL',
        ];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'a.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['student_id']) && ctype_digit((string) $filters['student_id'])) {
            $where[] = 'sub.student_id = :student_id';
            $params['student_id'] = (int) $filters['student_id'];
        }

        $this->applyDateRange($filters, $where, $params, 'sub.graded_at');

        $statement = $this->db->prepare(
            'SELECT sub.id, sub.assignment_id, a.title AS assignment_title,
                    sub.student_id, u.full_name, u.email, u.student_code,
                    s.id AS subject_id, s.subject_code, s.subject_name,
                    sub.score, sub.feedback, grader.full_name AS graded_by_name,
                    sub.graded_at, sub.submitted_at
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN users u ON u.id = sub.student_id
             LEFT JOIN users grader ON grader.id = sub.graded_by
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY sub.graded_at DESC, sub.id DESC'
        );
        $statement->execute($params);

        return [
            'filename' => $this->filename('grades_feedback'),
            'headers' => ['ID bài nộp', 'ID bài tập', 'Tên bài tập', 'ID sinh viên', 'Họ tên', 'Email', 'Mã sinh viên', 'ID môn', 'Mã môn', 'Tên môn', 'Điểm', 'Feedback', 'Người chấm', 'Ngày chấm', 'Ngày nộp'],
            'rows' => array_map(static fn (array $row): array => [
                $row['id'],
                $row['assignment_id'],
                $row['assignment_title'],
                $row['student_id'],
                $row['full_name'],
                $row['email'],
                $row['student_code'],
                $row['subject_id'],
                $row['subject_code'],
                $row['subject_name'],
                $row['score'],
                $row['feedback'],
                $row['graded_by_name'],
                $row['graded_at'],
                $row['submitted_at'],
            ], $statement->fetchAll()),
        ];
    }

    public function progress(array $filters): array
    {
        $params = [];
        $where = ['r.deleted_at IS NULL', 's.deleted_at IS NULL'];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'r.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['student_id']) && ctype_digit((string) $filters['student_id'])) {
            $where[] = 'r.user_id = :student_id';
            $params['student_id'] = (int) $filters['student_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['draft', 'active', 'completed', 'paused'], true)) {
            $where[] = 'r.status = :status';
            $params['status'] = $filters['status'];
        }

        $this->applyDateRange($filters, $where, $params, 'r.created_at');

        $statement = $this->db->prepare(
            'SELECT r.id, r.user_id, u.full_name, u.email, u.student_code,
                    r.subject_id, s.subject_code, s.subject_name,
                    r.title, r.goal, r.current_level, r.start_date, r.end_date,
                    r.status, r.progress_percent,
                    COUNT(i.id) AS total_items,
                    SUM(CASE WHEN i.status = \'completed\' THEN 1 ELSE 0 END) AS completed_items,
                    SUM(CASE WHEN i.status IN (\'not_started\', \'in_progress\', \'rescheduled\') THEN 1 ELSE 0 END) AS pending_items,
                    COALESCE(SUM(i.duration_minutes), 0) AS planned_minutes,
                    COALESCE(SUM(i.actual_study_minutes), 0) AS actual_study_minutes,
                    r.created_at, r.updated_at
             FROM learning_roadmaps r
             INNER JOIN users u ON u.id = r.user_id
             INNER JOIN subjects s ON s.id = r.subject_id
             LEFT JOIN learning_roadmap_items i ON i.roadmap_id = r.id
             WHERE ' . implode(' AND ', $where) . '
             GROUP BY r.id, r.user_id, u.full_name, u.email, u.student_code, r.subject_id, s.subject_code, s.subject_name,
                      r.title, r.goal, r.current_level, r.start_date, r.end_date, r.status, r.progress_percent, r.created_at, r.updated_at
             ORDER BY r.updated_at DESC, r.id DESC'
        );
        $statement->execute($params);

        return [
            'filename' => $this->filename('learning_progress'),
            'headers' => ['ID lộ trình', 'ID sinh viên', 'Họ tên', 'Email', 'Mã sinh viên', 'ID môn', 'Mã môn', 'Tên môn', 'Tiêu đề', 'Mục tiêu', 'Trình độ', 'Ngày bắt đầu', 'Ngày kết thúc', 'Trạng thái', 'Tiến độ %', 'Tổng bước', 'Bước hoàn thành', 'Bước còn lại', 'Phút dự kiến', 'Phút thực học', 'Ngày tạo', 'Ngày cập nhật'],
            'rows' => array_map(static fn (array $row): array => [
                $row['id'],
                $row['user_id'],
                $row['full_name'],
                $row['email'],
                $row['student_code'],
                $row['subject_id'],
                $row['subject_code'],
                $row['subject_name'],
                $row['title'],
                $row['goal'],
                $row['current_level'],
                $row['start_date'],
                $row['end_date'],
                $row['status'],
                $row['progress_percent'],
                $row['total_items'],
                $row['completed_items'],
                $row['pending_items'],
                $row['planned_minutes'],
                $row['actual_study_minutes'],
                $row['created_at'],
                $row['updated_at'],
            ], $statement->fetchAll()),
        ];
    }

    private function applyDateRange(array $filters, array &$where, array &$params, string $column): void
    {
        $startDate = trim((string) ($filters['start_date'] ?? ''));
        if ($this->isDate($startDate)) {
            $where[] = "{$column} >= :start_date";
            $params['start_date'] = $startDate . ' 00:00:00';
        }

        $endDate = trim((string) ($filters['end_date'] ?? ''));
        if ($this->isDate($endDate)) {
            $where[] = "{$column} <= :end_date";
            $params['end_date'] = $endDate . ' 23:59:59';
        }
    }

    private function isDate(string $value): bool
    {
        $date = DateTimeImmutable::createFromFormat('Y-m-d', $value);

        return $date !== false && $date->format('Y-m-d') === $value;
    }

    private function filename(string $name): string
    {
        return $name . '_' . date('Ymd_His') . '.csv';
    }
}
