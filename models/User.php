<?php

class User extends Model
{
    public function findByLogin(string $login): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT u.id, u.role_id, u.full_name, u.email, u.password, u.avatar, u.phone,
                    u.student_code, u.status, u.must_change_password, u.last_login_at, u.created_at, u.updated_at,
                    r.name AS role
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id
             WHERE LOWER(u.email) = :login OR LOWER(u.student_code) = :login
             LIMIT 1'
        );
        $statement->execute(['login' => strtolower(trim($login))]);
        $user = $statement->fetch();

        return $user ?: null;
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, role_id, full_name, email, avatar, phone, student_code,
                    status, must_change_password, last_login_at, created_at, updated_at
             FROM users
             WHERE id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $user = $statement->fetch();

        return $user ?: null;
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
            'student_code' => $data['student_code'] ?: null,
            'status' => $data['status'] ?? 'active',
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function updateLastLogin(int $id): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE users SET last_login_at = NOW() WHERE id = :id'
        );

        return $statement->execute(['id' => $id]);
    }

    public function updatePasswordHash(int $id, string $passwordHash): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE users SET password = :password, updated_at = NOW() WHERE id = :id'
        );

        return $statement->execute([
            'id' => $id,
            'password' => $passwordHash,
        ]);
    }

    public function changePassword(int $id, string $password): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE users
             SET password = :password, must_change_password = 0, updated_at = NOW()
             WHERE id = :id'
        );

        return $statement->execute([
            'id' => $id,
            'password' => password_hash($password, PASSWORD_DEFAULT),
        ]);
    }

    public function getUserWithRole(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT u.id, u.role_id, u.full_name, u.email, u.avatar, u.phone,
                    u.student_code, u.status, u.must_change_password, u.last_login_at, u.created_at, u.updated_at,
                    r.name AS role
             FROM users u
             INNER JOIN roles r ON r.id = u.role_id
             WHERE u.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $user = $statement->fetch();

        return $user ?: null;
    }

    public function isEmailExists(string $email): bool
    {
        $statement = $this->db()->prepare(
            'SELECT COUNT(*) FROM users WHERE LOWER(email) = :email'
        );
        $statement->execute(['email' => strtolower(trim($email))]);

        return (int) $statement->fetchColumn() > 0;
    }
}
