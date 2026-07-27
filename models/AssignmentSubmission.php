<?php

class AssignmentSubmission extends Model
{
    public function getForAssignmentAdmin(int $assignmentId, array $filters = []): array
    {
        $params = [
            'assignment_id' => $assignmentId,
            'student_subject_status' => 'active',
        ];
        $where = ['a.id = :assignment_id'];

        $status = trim((string) ($filters['status'] ?? ''));
        if (in_array($status, ['not_submitted', 'submitted', 'late', 'graded'], true)) {
            if ($status === 'not_submitted') {
                $where[] = 'sub.id IS NULL';
            } else {
                $where[] = 'sub.status = :submission_status';
                $params['submission_status'] = $status;
            }
        }

        $statement = $this->db()->prepare(
            'SELECT u.id AS student_id, u.full_name, u.email, u.student_code,
                    sub.id AS submission_id, sub.content, sub.file_path, sub.submitted_at,
                    COALESCE(sub.status, \'not_submitted\') AS submission_status,
                    sub.score, sub.feedback, sub.graded_by, sub.graded_at,
                    a.id AS assignment_id, a.title AS assignment_title, a.deadline,
                    a.status AS assignment_status,
                    s.id AS subject_id, s.subject_code, s.subject_name
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss
                    ON ss.subject_id = s.id AND ss.status = :student_subject_status
             INNER JOIN users u ON u.id = ss.student_id
             LEFT JOIN assignment_submissions sub
                    ON sub.assignment_id = a.id AND sub.student_id = u.id
             WHERE ' . implode(' AND ', $where) . '
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY u.full_name ASC, u.id ASC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findForAdmin(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT sub.id, sub.assignment_id, sub.student_id, sub.content, sub.file_path,
                    sub.submitted_at, sub.status, sub.score, sub.feedback, sub.graded_by,
                    sub.graded_at, sub.created_at, sub.updated_at,
                    u.full_name, u.email, u.student_code,
                    grader.full_name AS graded_by_name,
                    a.title AS assignment_title, a.description AS assignment_description,
                    a.deadline, a.status AS assignment_status,
                    s.id AS subject_id, s.subject_code, s.subject_name
             FROM assignment_submissions sub
             INNER JOIN users u ON u.id = sub.student_id
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             LEFT JOIN users grader ON grader.id = sub.graded_by
             WHERE sub.id = :id
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $submission = $statement->fetch();

        return $submission ?: null;
    }

    public function getAllForStudent(int $studentId): array
    {
        $statement = $this->db()->prepare(
            'SELECT sub.id, sub.assignment_id, sub.student_id, sub.content, sub.file_path,
                    sub.submitted_at, sub.status, sub.score, sub.feedback, sub.graded_by,
                    sub.graded_at, sub.created_at, sub.updated_at,
                    a.title AS assignment_title, a.deadline, a.status AS assignment_status,
                    s.id AS subject_id, s.subject_code, s.subject_name
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             WHERE sub.student_id = :student_id
               AND ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY sub.submitted_at DESC, sub.id DESC'
        );
        $statement->execute([
            'student_id' => $studentId,
            'student_subject_status' => 'active',
        ]);

        return $statement->fetchAll();
    }

    public function getGradesForStudent(int $studentId): array
    {
        $statement = $this->db()->prepare(
            'SELECT sub.id, sub.assignment_id, sub.student_id, sub.content, sub.file_path,
                    sub.submitted_at, sub.status, sub.score, sub.feedback, sub.graded_by,
                    sub.graded_at, sub.created_at, sub.updated_at,
                    grader.full_name AS graded_by_name,
                    a.title AS assignment_title, a.deadline, a.status AS assignment_status,
                    s.id AS subject_id, s.subject_code, s.subject_name
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN users grader ON grader.id = sub.graded_by
             WHERE sub.student_id = :student_id
               AND ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             ORDER BY sub.graded_at DESC, sub.submitted_at DESC, sub.id DESC'
        );
        $statement->execute([
            'student_id' => $studentId,
            'student_subject_status' => 'active',
        ]);

        return $statement->fetchAll();
    }

    public function findGradeForStudent(int $id, int $studentId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT sub.id, sub.assignment_id, sub.student_id, sub.content, sub.file_path,
                    sub.submitted_at, sub.status, sub.score, sub.feedback, sub.graded_by,
                    sub.graded_at, sub.created_at, sub.updated_at,
                    grader.full_name AS graded_by_name,
                    a.title AS assignment_title, a.description AS assignment_description,
                    a.deadline, a.status AS assignment_status,
                    s.id AS subject_id, s.subject_code, s.subject_name
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN users grader ON grader.id = sub.graded_by
             WHERE sub.id = :id
               AND sub.student_id = :student_id
               AND ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'student_id' => $studentId,
            'student_subject_status' => 'active',
        ]);
        $submission = $statement->fetch();

        return $submission ?: null;
    }

    public function findForStudent(int $id, int $studentId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT sub.id, sub.assignment_id, sub.student_id, sub.content, sub.file_path,
                    sub.submitted_at, sub.status, sub.score, sub.feedback, sub.graded_by,
                    sub.graded_at, sub.created_at, sub.updated_at,
                    a.title AS assignment_title, a.description AS assignment_description,
                    a.deadline, a.status AS assignment_status,
                    s.id AS subject_id, s.subject_code, s.subject_name
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             WHERE sub.id = :id
               AND sub.student_id = :student_id
               AND ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'student_id' => $studentId,
            'student_subject_status' => 'active',
        ]);
        $submission = $statement->fetch();

        return $submission ?: null;
    }

    public function findByAssignmentForStudent(int $assignmentId, int $studentId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT sub.id, sub.assignment_id, sub.student_id, sub.content, sub.file_path,
                    sub.submitted_at, sub.status, sub.score, sub.feedback, sub.graded_by,
                    sub.graded_at, sub.created_at, sub.updated_at,
                    a.title AS assignment_title, a.deadline, a.status AS assignment_status,
                    s.id AS subject_id, s.subject_code, s.subject_name
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.id = sub.assignment_id
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             WHERE sub.assignment_id = :assignment_id
               AND sub.student_id = :student_id
               AND ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
            'student_subject_status' => 'active',
        ]);
        $submission = $statement->fetch();

        return $submission ?: null;
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO assignment_submissions
                (assignment_id, student_id, content, file_path, submitted_at, status)
             VALUES
                (:assignment_id, :student_id, :content, :file_path, NOW(), :status)'
        );
        $statement->execute([
            'assignment_id' => (int) $data['assignment_id'],
            'student_id' => (int) $data['student_id'],
            'content' => $data['content'] !== '' ? $data['content'] : null,
            'file_path' => $data['file_path'] ?: null,
            'status' => $data['status'],
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, int $studentId, array $data): bool
    {
        $fields = [
            'content = :content',
            'submitted_at = NOW()',
            'status = :status',
        ];
        $params = [
            'id' => $id,
            'student_id' => $studentId,
            'content' => $data['content'] !== '' ? $data['content'] : null,
            'status' => $data['status'],
        ];

        if (array_key_exists('file_path', $data)) {
            $fields[] = 'file_path = :file_path';
            $params['file_path'] = $data['file_path'] ?: null;
        }

        $statement = $this->db()->prepare(
            'UPDATE assignment_submissions
             SET ' . implode(', ', $fields) . '
             WHERE id = :id AND student_id = :student_id'
        );

        return $statement->execute($params);
    }

    public function grade(int $id, float $score, string $feedback, int $gradedBy): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE assignment_submissions
             SET score = :score,
                 feedback = :feedback,
                 graded_by = :graded_by,
                 graded_at = NOW(),
                 status = :status
             WHERE id = :id'
        );

        return $statement->execute([
            'id' => $id,
            'score' => $score,
            'feedback' => $feedback !== '' ? $feedback : null,
            'graded_by' => $gradedBy,
            'status' => 'graded',
        ]);
    }
}
