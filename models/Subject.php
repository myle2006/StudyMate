<?php

class Subject extends Model
{
    public function getAll(array $user, array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = min(100, max(1, (int) ($filters['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        $params = [];
        $where = [];

        if (! $this->isAdmin($user)) {
            $where[] = 'user_id = :user_id';
            $params['user_id'] = (int) $user['id'];
        }

        if (! empty($filters['keyword'])) {
            $where[] = '(name LIKE :keyword OR code LIKE :keyword)';
            $params['keyword'] = '%' . trim((string) $filters['keyword']) . '%';
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['active', 'archived'], true)) {
            $where[] = 'status = :status';
            $params['status'] = $filters['status'];
        }

        $whereSql = $where === [] ? '' : ' WHERE ' . implode(' AND ', $where);

        $countStatement = $this->db()->prepare('SELECT COUNT(*) FROM subjects' . $whereSql);
        $countStatement->execute($params);
        $total = (int) $countStatement->fetchColumn();

        $sql = 'SELECT id, user_id, name, code, description, color, icon, status, created_at, updated_at'
            . ' FROM subjects'
            . $whereSql
            . ' ORDER BY created_at DESC, id DESC'
            . ' LIMIT :limit OFFSET :offset';

        $statement = $this->db()->prepare($sql);
        foreach ($params as $key => $value) {
            $statement->bindValue(':' . $key, $value);
        }
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->bindValue(':offset', $offset, PDO::PARAM_INT);
        $statement->execute();

        return [
            'data' => $statement->fetchAll(),
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ];
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, user_id, name, code, description, color, icon, status, created_at, updated_at
             FROM subjects
             WHERE id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $subject = $statement->fetch();

        return $subject ?: null;
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO subjects (user_id, name, code, description, color, icon, status)
             VALUES (:user_id, :name, :code, :description, :color, :icon, :status)'
        );
        $statement->execute([
            'user_id' => (int) $data['user_id'],
            'name' => $data['name'],
            'code' => $data['code'] ?: null,
            'description' => $data['description'] ?: null,
            'color' => $data['color'] ?: null,
            'icon' => $data['icon'] ?: null,
            'status' => $data['status'] ?: 'active',
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE subjects
             SET name = :name,
                 code = :code,
                 description = :description,
                 color = :color,
                 icon = :icon,
                 status = :status
             WHERE id = :id'
        );

        return $statement->execute([
            'id' => $id,
            'name' => $data['name'],
            'code' => $data['code'] ?: null,
            'description' => $data['description'] ?: null,
            'color' => $data['color'] ?: null,
            'icon' => $data['icon'] ?: null,
            'status' => $data['status'] ?: 'active',
        ]);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db()->prepare('DELETE FROM subjects WHERE id = :id');

        return $statement->execute(['id' => $id]);
    }

    public function archive(int $id): bool
    {
        $statement = $this->db()->prepare('UPDATE subjects SET status = :status WHERE id = :id');

        return $statement->execute([
            'id' => $id,
            'status' => 'archived',
        ]);
    }

    public function isOwner(int $subjectId, int $userId): bool
    {
        $statement = $this->db()->prepare(
            'SELECT COUNT(*) FROM subjects WHERE id = :subject_id AND user_id = :user_id'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'user_id' => $userId,
        ]);

        return (int) $statement->fetchColumn() > 0;
    }

    public function isCodeExists(?string $code, int $userId, ?int $excludeId = null): bool
    {
        $code = trim((string) $code);
        if ($code === '') {
            return false;
        }

        $params = [
            'code' => strtolower($code),
            'user_id' => $userId,
        ];
        $sql = 'SELECT COUNT(*) FROM subjects WHERE LOWER(code) = :code AND user_id = :user_id';

        if ($excludeId !== null) {
            $sql .= ' AND id <> :exclude_id';
            $params['exclude_id'] = $excludeId;
        }

        $statement = $this->db()->prepare($sql);
        $statement->execute($params);

        return (int) $statement->fetchColumn() > 0;
    }

    public function hasRelatedData(int $subjectId): bool
    {
        foreach (['lessons', 'tasks', 'notes', 'quizzes'] as $table) {
            if (! $this->tableHasColumn($table, 'subject_id')) {
                continue;
            }

            $statement = $this->db()->prepare("SELECT COUNT(*) FROM {$table} WHERE subject_id = :subject_id");
            $statement->execute(['subject_id' => $subjectId]);

            if ((int) $statement->fetchColumn() > 0) {
                return true;
            }
        }

        return false;
    }

    private function tableHasColumn(string $table, string $column): bool
    {
        try {
            $statement = $this->db()->prepare("SHOW COLUMNS FROM {$table} LIKE :column_name");
            $statement->execute(['column_name' => $column]);

            return (bool) $statement->fetch();
        } catch (PDOException) {
            return false;
        }
    }

    private function isAdmin(array $user): bool
    {
        return strtolower((string) ($user['role'] ?? '')) === 'admin';
    }
}
