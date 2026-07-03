<?php

class Student extends Model
{
    public function getAll(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = min(100, max(1, (int) ($filters['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        $params = [];
        $where = ['r.name = :role_name'];
        $params['role_name'] = 'student';

        if (! empty($filters['keyword'])) {
            $where[] = '(u.full_name LIKE :keyword OR u.email LIKE :keyword OR u.student_code LIKE :keyword OR u.phone LIKE :keyword)';
            $params['keyword'] = '%' . trim((string) $filters['keyword']) . '%';
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['active', 'inactive', 'locked'], true)) {
            $where[] = 'u.status = :status';
            $params['status'] = $filters['status'];
        }

        $whereSql = ' WHERE ' . implode(' AND ', $where);

        $countStatement = $this->db()->prepare(
            'SELECT COUNT(*)
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id'
             . $whereSql
        );
        $countStatement->execute($params);
        $total = (int) $countStatement->fetchColumn();

        $statement = $this->db()->prepare(
            'SELECT u.id, u.full_name, u.email, u.avatar, u.phone, u.student_code,
                    u.status, u.last_login_at, u.created_at, u.updated_at
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id'
             . $whereSql .
            ' ORDER BY u.created_at DESC, u.id DESC
              LIMIT :limit OFFSET :offset'
        );

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
            'SELECT u.id, u.full_name, u.email, u.avatar, u.phone, u.student_code,
                    u.status, u.last_login_at, u.created_at, u.updated_at,
                    r.name AS role
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id
             WHERE u.id = :id AND r.name = :role_name
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'role_name' => 'student',
        ]);
        $student = $statement->fetch();

        return $student ?: null;
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO users (role_id, full_name, email, password, phone, student_code, status)
             VALUES (:role_id, :full_name, :email, :password, :phone, :student_code, :status)'
        );
        $statement->execute([
            'role_id' => (int) $data['role_id'],
            'full_name' => $data['full_name'],
            'email' => strtolower(trim($data['email'])),
            'password' => $data['password'],
            'phone' => $data['phone'] ?: null,
            'student_code' => $data['student_code'],
            'status' => $data['status'] ?: 'active',
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE users
             SET full_name = :full_name,
                 email = :email,
                 phone = :phone,
                 student_code = :student_code,
                 status = :status
             WHERE id = :id'
        );

        return $statement->execute([
            'id' => $id,
            'full_name' => $data['full_name'],
            'email' => strtolower(trim($data['email'])),
            'phone' => $data['phone'] ?: null,
            'student_code' => $data['student_code'],
            'status' => $data['status'],
        ]);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db()->prepare('DELETE FROM users WHERE id = :id');

        return $statement->execute(['id' => $id]);
    }

    public function disable(int $id): bool
    {
        return $this->updateStatus($id, 'inactive');
    }

    public function enable(int $id): bool
    {
        return $this->updateStatus($id, 'active');
    }

    public function lock(int $id): bool
    {
        return $this->updateStatus($id, 'locked');
    }

    public function resetPassword(int $id, string $newPassword): bool
    {
        $statement = $this->db()->prepare('UPDATE users SET password = :password WHERE id = :id');

        return $statement->execute([
            'id' => $id,
            'password' => password_hash($newPassword, PASSWORD_DEFAULT),
        ]);
    }

    public function isEmailExists(string $email, ?int $excludeId = null): bool
    {
        $params = ['email' => strtolower(trim($email))];
        $sql = 'SELECT COUNT(*) FROM users WHERE LOWER(email) = :email';

        if ($excludeId !== null) {
            $sql .= ' AND id <> :exclude_id';
            $params['exclude_id'] = $excludeId;
        }

        $statement = $this->db()->prepare($sql);
        $statement->execute($params);

        return (int) $statement->fetchColumn() > 0;
    }

    public function isStudentCodeExists(string $studentCode, ?int $excludeId = null): bool
    {
        $params = ['student_code' => strtolower(trim($studentCode))];
        $sql = 'SELECT COUNT(*) FROM users WHERE LOWER(student_code) = :student_code';

        if ($excludeId !== null) {
            $sql .= ' AND id <> :exclude_id';
            $params['exclude_id'] = $excludeId;
        }

        $statement = $this->db()->prepare($sql);
        $statement->execute($params);

        return (int) $statement->fetchColumn() > 0;
    }

    public function hasRelatedData(int $studentId): bool
    {
        $relations = [
            'subjects' => ['user_id'],
            'study_plans' => ['user_id', 'student_id'],
            'tasks' => ['user_id', 'student_id'],
            'notes' => ['user_id', 'student_id'],
            'quiz_attempts' => ['user_id', 'student_id'],
            'ai_conversations' => ['user_id', 'student_id'],
            'progress' => ['user_id', 'student_id'],
            'notifications' => ['user_id', 'student_id'],
        ];

        foreach ($relations as $table => $columns) {
            foreach ($columns as $column) {
                if (! $this->tableHasColumn($table, $column)) {
                    continue;
                }

                $statement = $this->db()->prepare("SELECT COUNT(*) FROM {$table} WHERE {$column} = :student_id");
                $statement->execute(['student_id' => $studentId]);

                if ((int) $statement->fetchColumn() > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    private function updateStatus(int $id, string $status): bool
    {
        $statement = $this->db()->prepare('UPDATE users SET status = :status WHERE id = :id');

        return $statement->execute([
            'id' => $id,
            'status' => $status,
        ]);
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
}
