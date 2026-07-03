<?php

class Role extends Model
{
    public function findByName(string $name): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, name, description, created_at, updated_at
             FROM roles
             WHERE name = :name
             LIMIT 1'
        );
        $statement->execute(['name' => strtolower(trim($name))]);
        $role = $statement->fetch();

        return $role ?: null;
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT id, name, description, created_at, updated_at
             FROM roles
             WHERE id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $role = $statement->fetch();

        return $role ?: null;
    }

    public function getAll(): array
    {
        $statement = $this->db()->query(
            'SELECT id, name, description, created_at, updated_at
             FROM roles
             ORDER BY id ASC'
        );

        return $statement->fetchAll();
    }
}
