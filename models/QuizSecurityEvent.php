<?php

class QuizSecurityEvent extends Model
{
    private static bool $schemaReady = false;

    public function ensureSchema(): void
    {
        if (self::$schemaReady) {
            return;
        }

        $path = BASE_PATH . '/database/migrations/create_quiz_security_events_table.sql';
        $sql = file_exists($path) ? file_get_contents($path) : false;
        if ($sql !== false) {
            foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
                if ($statement !== '') {
                    $this->db()->exec($statement);
                }
            }
        }

        self::$schemaReady = true;
    }

    public function log(
        int $assignmentId,
        int $studentId,
        string $eventType,
        string $message,
        array $metadata = []
    ): int {
        $this->ensureSchema();

        $statement = $this->db()->prepare(
            'INSERT INTO quiz_security_events
                (assignment_id, student_id, event_type, message, metadata, ip_address, user_agent, created_at)
             VALUES
                (:assignment_id, :student_id, :event_type, :message, :metadata, :ip_address, :user_agent, NOW())'
        );

        $statement->execute([
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
            'event_type' => $eventType,
            'message' => $message,
            'metadata' => $metadata === []
                ? null
                : json_encode($metadata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'ip_address' => $this->clientIp(),
            'user_agent' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255) ?: null,
        ]);

        return (int) $this->db()->lastInsertId();
    }

    public function getForAssignmentStudent(int $assignmentId, int $studentId): array
    {
        $this->ensureSchema();

        $statement = $this->db()->prepare(
            'SELECT id, assignment_id, student_id, event_type, message, metadata,
                    ip_address, user_agent, created_at
             FROM quiz_security_events
             WHERE assignment_id = :assignment_id
               AND student_id = :student_id
             ORDER BY created_at DESC, id DESC'
        );
        $statement->execute([
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
        ]);

        return array_map(static function (array $event): array {
            $metadata = json_decode((string) ($event['metadata'] ?? ''), true);
            $event['metadata'] = is_array($metadata) ? $metadata : [];
            return $event;
        }, $statement->fetchAll());
    }

    private function clientIp(): ?string
    {
        $candidates = [
            $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
            $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
            $_SERVER['REMOTE_ADDR'] ?? '',
        ];

        foreach ($candidates as $candidate) {
            $ip = trim(explode(',', (string) $candidate)[0]);
            if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP) !== false) {
                return $ip;
            }
        }

        return null;
    }
}
