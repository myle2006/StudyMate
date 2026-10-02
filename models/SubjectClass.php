<?php

class SubjectClass extends Model
{
    public function getForSubject(int $subjectId, bool $activeOnly = true): array
    {
        $where = ['sc.subject_id = :subject_id', 'sc.deleted_at IS NULL'];
        $params = ['subject_id' => $subjectId];

        if ($activeOnly) {
            $where[] = 'sc.status = :status';
            $params['status'] = 'active';
        }

        $statement = $this->db()->prepare(
            'SELECT sc.id, sc.subject_id, sc.class_code, sc.class_name, sc.status, sc.created_by, sc.created_at, sc.updated_at,
                    (
                        SELECT COUNT(*)
                        FROM student_subjects ss
                        WHERE ss.class_id = sc.id AND ss.status = :student_assignment_status
                    ) AS active_students_count,
                    (
                        SELECT COUNT(*)
                        FROM assignments a
                        WHERE a.class_id = sc.id AND a.deleted_at IS NULL AND a.status = :open_assignment_status
                    ) AS open_assignments_count
             FROM subject_classes sc
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY sc.class_code ASC, sc.id ASC'
        );
        $params['student_assignment_status'] = 'active';
        $params['open_assignment_status'] = 'open';
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, subject_id, class_code, class_name, status, created_by, created_at, updated_at
             FROM subject_classes
             WHERE id = :id AND deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $class = $statement->fetch();

        return $class ?: null;
    }

    public function findDefaultForSubject(int $subjectId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, subject_id, class_code, class_name, status, created_by, created_at, updated_at
             FROM subject_classes
             WHERE subject_id = :subject_id
               AND class_code = :class_code
               AND deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'class_code' => 'DEFAULT',
        ]);
        $class = $statement->fetch();

        return $class ?: null;
    }

    public function ensureDefaultForSubject(int $subjectId, ?int $createdBy = null): int
    {
        $existing = $this->findDefaultForSubject($subjectId);
        if ($existing !== null) {
            return (int) $existing['id'];
        }

        $statement = $this->db()->prepare(
            'INSERT INTO subject_classes (subject_id, class_code, class_name, status, created_by)
             SELECT id, :class_code, CONCAT(subject_code, " - Lớp mặc định"), :status, :created_by
             FROM subjects
             WHERE id = :subject_id AND deleted_at IS NULL'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'class_code' => 'DEFAULT',
            'status' => 'active',
            'created_by' => $createdBy,
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function create(int $subjectId, string $classCode, string $className, ?int $createdBy = null): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO subject_classes (subject_id, class_code, class_name, status, created_by)
             VALUES (:subject_id, :class_code, :class_name, :status, :created_by)'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'class_code' => $classCode,
            'class_name' => $className !== '' ? $className : null,
            'status' => 'active',
            'created_by' => $createdBy,
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function codeExists(int $subjectId, string $classCode): bool
    {
        $statement = $this->db()->prepare(
            'SELECT COUNT(*)
             FROM subject_classes
             WHERE subject_id = :subject_id
               AND LOWER(class_code) = :class_code
               AND deleted_at IS NULL'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'class_code' => strtolower(trim($classCode)),
        ]);

        return (int) $statement->fetchColumn() > 0;
    }

    public function belongsToSubject(int $classId, int $subjectId): bool
    {
        $statement = $this->db()->prepare(
            'SELECT COUNT(*)
             FROM subject_classes
             WHERE id = :id
               AND subject_id = :subject_id
               AND status = :status
               AND deleted_at IS NULL'
        );
        $statement->execute([
            'id' => $classId,
            'subject_id' => $subjectId,
            'status' => 'active',
        ]);

        return (int) $statement->fetchColumn() > 0;
    }
}
