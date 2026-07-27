<?php

class StudentSubject extends Model
{
    public function getMySubjects(int $studentId, array $filters = []): array
    {
        $params = [
            'student_id' => $studentId,
            'assignment_status' => 'active',
        ];
        $where = [
            'ss.student_id = :student_id',
            'ss.status = :assignment_status',
            's.deleted_at IS NULL',
        ];

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(s.subject_name LIKE :keyword OR s.subject_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if (in_array($status, ['studying', 'paused', 'completed'], true)) {
            $where[] = 's.status = :subject_status';
            $params['subject_status'] = $status;
        }

        $statement = $this->db()->prepare(
            'SELECT s.id, s.subject_code, s.subject_name, s.description, s.credits,
                    s.status, s.color, s.image, s.created_by, s.created_at, s.updated_at,
                    ss.assigned_at, ss.status AS assignment_status
             FROM student_subjects ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY ss.assigned_at DESC, s.subject_name ASC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findMySubject(int $studentId, int $subjectId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT s.id, s.subject_code, s.subject_name, s.description, s.credits,
                    s.status, s.color, s.image, s.created_by, s.created_at, s.updated_at,
                    ss.assigned_at, ss.status AS assignment_status
             FROM student_subjects ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.student_id = :student_id
               AND ss.subject_id = :subject_id
               AND ss.status = :assignment_status
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'student_id' => $studentId,
            'subject_id' => $subjectId,
            'assignment_status' => 'active',
        ]);
        $subject = $statement->fetch();

        return $subject ?: null;
    }

    public function getAssignedStudents(int $subjectId, array $filters = []): array
    {
        $params = ['subject_id' => $subjectId, 'role_name' => 'student'];
        $where = [
            'ss.subject_id = :subject_id',
            'ss.status = :assignment_status',
            'r.name = :role_name',
        ];
        $params['assignment_status'] = 'active';

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(u.full_name LIKE :keyword OR u.email LIKE :keyword OR u.student_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        $statement = $this->db()->prepare(
            'SELECT ss.id, ss.student_id, ss.subject_id, ss.status, ss.assigned_by, ss.assigned_at,
                    ss.removed_at, ss.created_at, ss.updated_at,
                    u.full_name, u.email, u.student_code, u.status AS student_status
             FROM student_subjects ss
             INNER JOIN users u ON u.id = ss.student_id
             INNER JOIN roles r ON r.id = u.role_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY ss.assigned_at DESC, ss.id DESC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function getAvailableStudents(int $subjectId, array $filters = []): array
    {
        $params = ['subject_id' => $subjectId, 'role_name' => 'student'];
        $where = [
            'r.name = :role_name',
            'u.status = :student_status',
            'NOT EXISTS (
                SELECT 1
                FROM student_subjects ss
                WHERE ss.student_id = u.id
                  AND ss.subject_id = :subject_id
                  AND ss.status = :active_assignment_status
            )',
        ];
        $params['student_status'] = 'active';
        $params['active_assignment_status'] = 'active';

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(u.full_name LIKE :keyword OR u.email LIKE :keyword OR u.student_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        $statement = $this->db()->prepare(
            'SELECT u.id, u.full_name, u.email, u.student_code, u.status
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY u.full_name ASC, u.id ASC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function assignStudent(int $subjectId, int $studentId, int $assignedBy): array
    {
        $db = $this->db();
        $db->beginTransaction();

        try {
            $statement = $db->prepare(
                'SELECT id, status
                 FROM student_subjects
                 WHERE student_id = :student_id AND subject_id = :subject_id
                 LIMIT 1
                 FOR UPDATE'
            );
            $statement->execute([
                'student_id' => $studentId,
                'subject_id' => $subjectId,
            ]);
            $existing = $statement->fetch();

            if ($existing && $existing['status'] === 'active') {
                $db->commit();

                return ['assigned' => false, 'reactivated' => false, 'duplicate' => true];
            }

            if ($existing) {
                $update = $db->prepare(
                    'UPDATE student_subjects
                     SET status = :status,
                         assigned_by = :assigned_by,
                         assigned_at = NOW(),
                         removed_at = NULL,
                         updated_at = NOW()
                     WHERE id = :id'
                );
                $update->execute([
                    'id' => (int) $existing['id'],
                    'status' => 'active',
                    'assigned_by' => $assignedBy,
                ]);
                $db->commit();

                return ['assigned' => true, 'reactivated' => true, 'duplicate' => false];
            }

            $insert = $db->prepare(
                'INSERT INTO student_subjects (student_id, subject_id, status, assigned_by, assigned_at)
                 VALUES (:student_id, :subject_id, :status, :assigned_by, NOW())'
            );
            $insert->execute([
                'student_id' => $studentId,
                'subject_id' => $subjectId,
                'status' => 'active',
                'assigned_by' => $assignedBy,
            ]);
            $db->commit();

            return ['assigned' => true, 'reactivated' => false, 'duplicate' => false];
        } catch (Throwable $exception) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $exception;
        }
    }

    public function removeStudent(int $subjectId, int $studentId): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE student_subjects
             SET status = :removed_status,
                 removed_at = NOW(),
                 updated_at = NOW()
             WHERE subject_id = :subject_id
               AND student_id = :student_id
               AND status = :active_status'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'student_id' => $studentId,
            'removed_status' => 'removed',
            'active_status' => 'active',
        ]);

        return $statement->rowCount() > 0;
    }

    public function findActiveAssignment(int $subjectId, int $studentId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, student_id, subject_id, status, assigned_by, assigned_at, removed_at, created_at, updated_at
             FROM student_subjects
             WHERE subject_id = :subject_id
               AND student_id = :student_id
               AND status = :status
             LIMIT 1'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'student_id' => $studentId,
            'status' => 'active',
        ]);
        $assignment = $statement->fetch();

        return $assignment ?: null;
    }

    public function subjectExists(int $subjectId): bool
    {
        $statement = $this->db()->prepare('SELECT COUNT(*) FROM subjects WHERE id = :id AND deleted_at IS NULL');
        $statement->execute(['id' => $subjectId]);

        return (int) $statement->fetchColumn() > 0;
    }

    public function studentExists(int $studentId): bool
    {
        $statement = $this->db()->prepare(
            'SELECT COUNT(*)
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id
             WHERE u.id = :id
               AND r.name = :role_name
               AND u.status = :status'
        );
        $statement->execute([
            'id' => $studentId,
            'role_name' => 'student',
            'status' => 'active',
        ]);

        return (int) $statement->fetchColumn() > 0;
    }
}
