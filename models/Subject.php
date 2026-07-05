<?php

class Subject extends Model
{
    public function getAll(array $filters = []): array
    {
        $params = [];
        $where = ['deleted_at IS NULL'];

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(subject_name LIKE :keyword OR subject_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if (in_array($status, ['studying', 'paused', 'completed'], true)) {
            $where[] = 'status = :status';
            $params['status'] = $status;
        }

        $whereSql = ' WHERE ' . implode(' AND ', $where);
        $sql = 'SELECT id, subject_code, subject_name, description, credits, status, color, image, created_by, created_at, updated_at
                FROM subjects'
            . $whereSql
            . ' ORDER BY created_at DESC, id DESC';

        $statement = $this->db()->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function getById(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, subject_code, subject_name, description, credits, status, color, image, created_by, created_at, updated_at
             FROM subjects
             WHERE id = :id AND deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $subject = $statement->fetch();

        return $subject ?: null;
    }

    public function findById(int $id): ?array
    {
        return $this->getById($id);
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO subjects (subject_code, subject_name, description, credits, status, color, image, created_by)
             VALUES (:subject_code, :subject_name, :description, :credits, :status, :color, :image, :created_by)'
        );
        $statement->execute([
            'subject_code' => $data['subject_code'],
            'subject_name' => $data['subject_name'],
            'description' => $data['description'] !== '' ? $data['description'] : null,
            'credits' => (int) ($data['credits'] ?? 3),
            'status' => $data['status'] ?: 'studying',
            'color' => $data['color'] ?: '#2563EB',
            'image' => $data['image'] ?: null,
            'created_by' => $data['created_by'] ?: null,
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [
            'subject_name = :subject_name',
            'description = :description',
            'credits = :credits',
            'status = :status',
            'color = :color',
        ];
        $params = [
            'id' => $id,
            'subject_name' => $data['subject_name'],
            'description' => $data['description'] !== '' ? $data['description'] : null,
            'credits' => (int) ($data['credits'] ?? 3),
            'status' => $data['status'] ?: 'studying',
            'color' => $data['color'] ?: '#2563EB',
        ];

        if (array_key_exists('image', $data)) {
            $fields[] = 'image = :image';
            $params['image'] = $data['image'] ?: null;
        }

        $statement = $this->db()->prepare(
            'UPDATE subjects SET ' . implode(', ', $fields) . ' WHERE id = :id AND deleted_at IS NULL'
        );

        return $statement->execute($params);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE subjects SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL'
        );

        return $statement->execute(['id' => $id]);
    }

    public function existsByCode(string $subjectCode, ?int $excludeId = null): bool
    {
        $params = ['subject_code' => strtolower(trim($subjectCode))];
        $sql = 'SELECT COUNT(*) FROM subjects WHERE LOWER(subject_code) = :subject_code AND deleted_at IS NULL';

        if ($excludeId !== null) {
            $sql .= ' AND id <> :exclude_id';
            $params['exclude_id'] = $excludeId;
        }

        $statement = $this->db()->prepare($sql);
        $statement->execute($params);

        return (int) $statement->fetchColumn() > 0;
    }
}
