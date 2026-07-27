<?php

class Assignment extends Model
{
    public function getAll(array $filters = []): array
    {
        $params = [];
        $where = ['a.deleted_at IS NULL', 's.deleted_at IS NULL'];

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(a.title LIKE :keyword OR s.subject_name LIKE :keyword OR s.subject_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'a.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['open', 'closed', 'draft'], true)) {
            $where[] = 'a.status = :status';
            $params['status'] = $filters['status'];
        }

        $statement = $this->db()->prepare(
            'SELECT a.id, a.subject_id, a.title, a.description, a.deadline, a.attachment_path,
                    a.status, a.created_by, a.created_at, a.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image,
                    u.full_name AS created_by_name
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN users u ON u.id = a.created_by
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY a.deadline ASC, a.created_at DESC, a.id DESC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT a.id, a.subject_id, a.title, a.description, a.deadline, a.attachment_path,
                    a.status, a.created_by, a.created_at, a.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image,
                    u.full_name AS created_by_name
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN users u ON u.id = a.created_by
             WHERE a.id = :id
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $assignment = $statement->fetch();

        return $assignment ?: null;
    }

    public function getForStudent(int $studentId, array $filters = []): array
    {
        $params = [
            'student_id' => $studentId,
            'assignment_status' => 'active',
            'draft_status' => 'draft',
        ];
        $where = [
            'ss.student_id = :student_id',
            'ss.status = :assignment_status',
            'a.deleted_at IS NULL',
            's.deleted_at IS NULL',
            'a.status <> :draft_status',
        ];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'a.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['open', 'closed'], true)) {
            $where[] = 'a.status = :status';
            $params['status'] = $filters['status'];
        }

        $deadline = (string) ($filters['deadline'] ?? '');
        if ($deadline === 'overdue') {
            $where[] = 'a.deadline < NOW() AND a.status = :open_status_for_deadline';
            $params['open_status_for_deadline'] = 'open';
        } elseif ($deadline === 'near') {
            $where[] = 'a.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)';
        } elseif ($deadline === 'today') {
            $where[] = 'DATE(a.deadline) = CURDATE()';
        } elseif ($deadline === 'upcoming') {
            $where[] = 'a.deadline >= NOW()';
        }

        $statement = $this->db()->prepare(
            'SELECT a.id, a.subject_id, a.title, a.description, a.deadline, a.attachment_path,
                    a.status, a.created_at, a.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image,
                    sub.id AS submission_id,
                    COALESCE(sub.status, \'not_submitted\') AS submission_status,
                    sub.submitted_at,
                    sub.file_path AS submission_file_path
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN assignment_submissions sub
                    ON sub.assignment_id = a.id AND sub.student_id = :student_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY a.deadline ASC, a.id DESC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findForStudent(int $id, int $studentId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT a.id, a.subject_id, a.title, a.description, a.deadline, a.attachment_path,
                    a.status, a.created_at, a.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image,
                    sub.id AS submission_id,
                    COALESCE(sub.status, \'not_submitted\') AS submission_status,
                    sub.submitted_at,
                    sub.content AS submission_content,
                    sub.file_path AS submission_file_path,
                    sub.score,
                    sub.feedback
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN assignment_submissions sub
                    ON sub.assignment_id = a.id AND sub.student_id = :student_id
             WHERE a.id = :id
               AND ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND a.status <> :draft_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'student_id' => $studentId,
            'student_subject_status' => 'active',
            'draft_status' => 'draft',
        ]);
        $assignment = $statement->fetch();

        return $assignment ?: null;
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO assignments
                (subject_id, title, description, deadline, attachment_path, status, created_by)
             VALUES
                (:subject_id, :title, :description, :deadline, :attachment_path, :status, :created_by)'
        );
        $statement->execute([
            'subject_id' => (int) $data['subject_id'],
            'title' => $data['title'],
            'description' => $data['description'] !== '' ? $data['description'] : null,
            'deadline' => $data['deadline'],
            'attachment_path' => $data['attachment_path'] ?: null,
            'status' => $data['status'] ?: 'draft',
            'created_by' => (int) $data['created_by'],
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [
            'subject_id = :subject_id',
            'title = :title',
            'description = :description',
            'deadline = :deadline',
            'status = :status',
        ];
        $params = [
            'id' => $id,
            'subject_id' => (int) $data['subject_id'],
            'title' => $data['title'],
            'description' => $data['description'] !== '' ? $data['description'] : null,
            'deadline' => $data['deadline'],
            'status' => $data['status'] ?: 'draft',
        ];

        if (array_key_exists('attachment_path', $data)) {
            $fields[] = 'attachment_path = :attachment_path';
            $params['attachment_path'] = $data['attachment_path'] ?: null;
        }

        $statement = $this->db()->prepare(
            'UPDATE assignments
             SET ' . implode(', ', $fields) . '
             WHERE id = :id AND deleted_at IS NULL'
        );

        return $statement->execute($params);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE assignments
             SET deleted_at = NOW()
             WHERE id = :id AND deleted_at IS NULL'
        );

        return $statement->execute(['id' => $id]);
    }

    public function subjectExists(int $subjectId): bool
    {
        $statement = $this->db()->prepare('SELECT COUNT(*) FROM subjects WHERE id = :id AND deleted_at IS NULL');
        $statement->execute(['id' => $subjectId]);

        return (int) $statement->fetchColumn() > 0;
    }
}
