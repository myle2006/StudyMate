<?php

class Lesson extends Model
{
    public function getAllAdmin(array $filters = []): array
    {
        $params = [];
        $where = ['l.deleted_at IS NULL', 's.deleted_at IS NULL'];

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(l.title LIKE :keyword OR l.content LIKE :keyword OR s.subject_name LIKE :keyword OR s.subject_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'l.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        if (! empty($filters['status']) && in_array($filters['status'], ['draft', 'published'], true)) {
            $where[] = 'l.status = :status';
            $params['status'] = $filters['status'];
        }

        $statement = $this->db()->prepare($this->baseSelect() . '
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY l.created_at DESC, l.id DESC');
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findAdmin(int $id): ?array
    {
        $statement = $this->db()->prepare($this->baseSelect() . '
             WHERE l.id = :id
               AND l.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1');
        $statement->execute(['id' => $id]);
        $lesson = $statement->fetch();

        return $lesson ?: null;
    }

    public function getForStudent(int $studentId, array $filters = []): array
    {
        $params = [
            'student_id_progress' => $studentId,
            'student_id_subject' => $studentId,
            'assignment_status' => 'active',
            'published_status' => 'published',
        ];
        $where = [
            'ss.student_id = :student_id_subject',
            'ss.status = :assignment_status',
            'l.status = :published_status',
            'l.deleted_at IS NULL',
            's.deleted_at IS NULL',
        ];

        if (! empty($filters['subject_id']) && ctype_digit((string) $filters['subject_id'])) {
            $where[] = 'l.subject_id = :subject_id';
            $params['subject_id'] = (int) $filters['subject_id'];
        }

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $where[] = '(l.title LIKE :keyword OR l.content LIKE :keyword OR s.subject_name LIKE :keyword OR s.subject_code LIKE :keyword)';
            $params['keyword'] = '%' . $keyword . '%';
        }

        $statement = $this->db()->prepare($this->studentSelect() . '
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY l.created_at DESC, l.id DESC');
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findForStudent(int $id, int $studentId): ?array
    {
        $statement = $this->db()->prepare($this->studentSelect() . '
             WHERE l.id = :id
               AND ss.student_id = :student_id_subject
               AND ss.status = :assignment_status
               AND l.status = :published_status
               AND l.deleted_at IS NULL
               AND s.deleted_at IS NULL
             LIMIT 1');
        $statement->execute([
            'id' => $id,
            'student_id_progress' => $studentId,
            'student_id_subject' => $studentId,
            'assignment_status' => 'active',
            'published_status' => 'published',
        ]);
        $lesson = $statement->fetch();

        return $lesson ?: null;
    }

    public function create(array $data): int
    {
        $statement = $this->db()->prepare(
            'INSERT INTO lessons
                (subject_id, title, content, video_url, external_url, material_path, duration_minutes, status, created_by)
             VALUES
                (:subject_id, :title, :content, :video_url, :external_url, :material_path, :duration_minutes, :status, :created_by)'
        );
        $statement->execute($this->params($data));

        return (int) $this->db()->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $params = $this->params($data);
        unset($params['created_by']);
        $params['id'] = $id;

        $statement = $this->db()->prepare(
            'UPDATE lessons
             SET subject_id = :subject_id,
                 title = :title,
                 content = :content,
                 video_url = :video_url,
                 external_url = :external_url,
                 material_path = :material_path,
                 duration_minutes = :duration_minutes,
                 status = :status
             WHERE id = :id AND deleted_at IS NULL'
        );

        return $statement->execute($params);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db()->prepare(
            'UPDATE lessons
             SET deleted_at = NOW()
             WHERE id = :id AND deleted_at IS NULL'
        );
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    public function markCompleted(int $lessonId, int $studentId): void
    {
        $statement = $this->db()->prepare(
            'INSERT INTO lesson_progress (lesson_id, student_id, status, completed_at)
             VALUES (:lesson_id, :student_id, :status, NOW())
             ON DUPLICATE KEY UPDATE status = VALUES(status), completed_at = VALUES(completed_at), updated_at = NOW()'
        );
        $statement->execute([
            'lesson_id' => $lessonId,
            'student_id' => $studentId,
            'status' => 'completed',
        ]);
    }

    public function subjectExists(int $subjectId): bool
    {
        $statement = $this->db()->prepare('SELECT COUNT(*) FROM subjects WHERE id = :id AND deleted_at IS NULL');
        $statement->execute(['id' => $subjectId]);

        return (int) $statement->fetchColumn() > 0;
    }

    private function baseSelect(): string
    {
        return 'SELECT l.id, l.subject_id, l.title, l.content, l.video_url, l.external_url,
                    l.material_path, l.duration_minutes, l.status, l.created_by, l.created_at, l.updated_at,
                    s.subject_code, s.subject_name, s.color,
                    creator.full_name AS created_by_name,
                    (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.lesson_id = l.id AND lp.status = \'completed\') AS completed_count
             FROM lessons l
             INNER JOIN subjects s ON s.id = l.subject_id
             INNER JOIN users creator ON creator.id = l.created_by';
    }

    private function studentSelect(): string
    {
        return 'SELECT l.id, l.subject_id, l.title, l.content, l.video_url, l.external_url,
                    l.material_path, l.duration_minutes, l.status, l.created_at, l.updated_at,
                    s.subject_code, s.subject_name, s.color,
                    COALESCE(lp.status, \'not_started\') AS progress_status,
                    lp.completed_at
             FROM lessons l
             INNER JOIN subjects s ON s.id = l.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = :student_id_progress';
    }

    private function params(array $data): array
    {
        return [
            'subject_id' => (int) $data['subject_id'],
            'title' => trim((string) $data['title']),
            'content' => self::nullableText($data['content'] ?? null),
            'video_url' => self::nullableText($data['video_url'] ?? null),
            'external_url' => self::nullableText($data['external_url'] ?? null),
            'material_path' => self::nullableText($data['material_path'] ?? null),
            'duration_minutes' => self::nullableInt($data['duration_minutes'] ?? null),
            'status' => in_array(($data['status'] ?? 'draft'), ['draft', 'published'], true) ? $data['status'] : 'draft',
            'created_by' => (int) ($data['created_by'] ?? 0),
        ];
    }

    private static function nullableText(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));

        return $value !== '' ? $value : null;
    }

    private static function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? max(0, (int) $value) : null;
    }
}
