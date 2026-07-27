<?php

class LearningGoal extends Model
{
    public function getForStudent(int $userId, array $filters = []): array
    {
        $params = ['user_id' => $userId];
        $where = [
            'lg.user_id = :user_id',
            'lg.deleted_at IS NULL',
            's.deleted_at IS NULL',
        ];

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(lg.title LIKE :keyword OR lg.goal_description LIKE :keyword OR s.subject_name LIKE :keyword OR s.subject_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        $status = trim((string) ($filters['status'] ?? ''));
        if (in_array($status, ['active', 'completed', 'paused', 'cancelled'], true)) {
            $where[] = 'lg.status = :status';
            $params['status'] = $status;
        }

        $statement = $this->db()->prepare(
            'SELECT lg.id, lg.user_id, lg.subject_id, lg.title, lg.goal_description,
                    lg.current_level, lg.study_time_per_day, lg.start_date, lg.end_date,
                    lg.status, lg.created_at, lg.updated_at,
                    s.subject_code, s.subject_name, s.color, s.image
             FROM learning_goals lg
             INNER JOIN subjects s ON s.id = lg.subject_id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY lg.created_at DESC, lg.id DESC'
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findForStudent(int $id, int $userId): ?array
    {
        $statement = $this->db()->prepare(
            'SELECT lg.id, lg.user_id, lg.subject_id, lg.title, lg.goal_description,
                    lg.current_level, lg.study_time_per_day, lg.start_date, lg.end_date,
                    lg.status, lg.created_at, lg.updated_at,
                    s.subject_code, s.subject_name, s.description AS subject_description,
                    s.credits, s.color, s.image
             FROM learning_goals lg
             INNER JOIN subjects s ON s.id = lg.subject_id
             WHERE lg.id = :id
               AND lg.user_id = :user_id
               AND lg.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
        ]);
        $goal = $statement->fetch();

        return $goal ?: null;
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO learning_goals
                (user_id, subject_id, title, goal_description, current_level,
                 study_time_per_day, start_date, end_date, status)
             VALUES
                (:user_id, :subject_id, :title, :goal_description, :current_level,
                 :study_time_per_day, :start_date, :end_date, :status)'
        );
        $statement->execute([
            'user_id' => (int) $data['user_id'],
            'subject_id' => (int) $data['subject_id'],
            'title' => $data['title'],
            'goal_description' => $data['goal_description'],
            'current_level' => $data['current_level'],
            'study_time_per_day' => (float) $data['study_time_per_day'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => $data['status'],
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, int $userId, array $data): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE learning_goals
             SET subject_id = :subject_id,
                 title = :title,
                 goal_description = :goal_description,
                 current_level = :current_level,
                 study_time_per_day = :study_time_per_day,
                 start_date = :start_date,
                 end_date = :end_date,
                 status = :status
             WHERE id = :id
               AND user_id = :user_id
               AND deleted_at IS NULL'
        );

        return $statement->execute([
            'id' => $id,
            'user_id' => $userId,
            'subject_id' => (int) $data['subject_id'],
            'title' => $data['title'],
            'goal_description' => $data['goal_description'],
            'current_level' => $data['current_level'],
            'study_time_per_day' => (float) $data['study_time_per_day'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => $data['status'],
        ]);
    }

    public function delete(int $id, int $userId): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE learning_goals
             SET deleted_at = NOW()
             WHERE id = :id
               AND user_id = :user_id
               AND deleted_at IS NULL'
        );
        $statement->execute([
            'id' => $id,
            'user_id' => $userId,
        ]);

        return $statement->rowCount() > 0;
    }

    public function subjectAssignedToStudent(int $subjectId, int $userId): bool
    {
        $statement = $this->db()->prepare(
            'SELECT COUNT(*)
             FROM student_subjects ss
             INNER JOIN subjects s ON s.id = ss.subject_id
             WHERE ss.subject_id = :subject_id
               AND ss.student_id = :user_id
               AND ss.status = :assignment_status
               AND s.deleted_at IS NULL'
        );
        $statement->execute([
            'subject_id' => $subjectId,
            'user_id' => $userId,
            'assignment_status' => 'active',
        ]);

        return (int) $statement->fetchColumn() > 0;
    }
}
