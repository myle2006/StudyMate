<?php

class Model
{
    protected ?PDO $db = null;

    protected function db(): PDO
    {
        if ($this->db === null) {
            $this->db = Database::connection();
        }

        return $this->db;
    }
}
