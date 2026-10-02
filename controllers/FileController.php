<?php

class FileController extends Controller
{
    private const CATEGORIES = ['assignments', 'submissions', 'lessons'];

    public function download(string $category, string $filename): void
    {
        $category = strtolower(trim($category));
        $filename = basename($filename);

        if (! in_array($category, self::CATEGORIES, true) || $filename === '' || ! $this->canAccess($category, $filename)) {
            $this->notFound();
            return;
        }

        $path = $this->resolvePath($category, $filename);
        if ($path === null) {
            $this->notFound();
            return;
        }

        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        $contentType = function_exists('mime_content_type') ? mime_content_type($path) : null;
        header('Content-Type: ' . ($contentType ?: 'application/octet-stream'));
        header('Content-Disposition: attachment; filename="' . str_replace('"', '', $filename) . '"');
        header('Content-Length: ' . filesize($path));
        header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');
        readfile($path);
    }

    private function canAccess(string $category, string $filename): bool
    {
        $user = $this->currentUser();
        $role = strtolower((string) ($user['role'] ?? ''));
        $userId = (int) ($user['id'] ?? 0);

        if ($role === 'admin') {
            return $this->fileExistsInDatabase($category, $filename);
        }

        if ($role !== 'student' || $userId <= 0) {
            return false;
        }

        return match ($category) {
            'assignments' => $this->studentCanAccessAssignmentFile($userId, $filename),
            'submissions' => $this->studentCanAccessSubmissionFile($userId, $filename),
            'lessons' => $this->studentCanAccessLessonFile($userId, $filename),
            default => false,
        };
    }

    private function fileExistsInDatabase(string $category, string $filename): bool
    {
        $db = Database::connection();
        [$table, $column] = $this->tableAndColumn($category);
        $statement = $db->prepare("SELECT COUNT(*) FROM {$table} WHERE {$column} LIKE :suffix");
        $statement->execute(['suffix' => '%/' . $filename]);

        return (int) $statement->fetchColumn() > 0;
    }

    private function studentCanAccessAssignmentFile(int $studentId, string $filename): bool
    {
        $statement = Database::connection()->prepare(
            'SELECT COUNT(*)
             FROM assignments a
             INNER JOIN subjects s ON s.id = a.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id AND ss.class_id = a.class_id
             WHERE ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND a.attachment_path LIKE :suffix
               AND a.status <> :draft_status
               AND a.deleted_at IS NULL
               AND s.deleted_at IS NULL'
        );
        $statement->execute([
            'student_id' => $studentId,
            'student_subject_status' => 'active',
            'suffix' => '%/' . $filename,
            'draft_status' => 'draft',
        ]);

        return (int) $statement->fetchColumn() > 0;
    }

    private function studentCanAccessSubmissionFile(int $studentId, string $filename): bool
    {
        $statement = Database::connection()->prepare(
            'SELECT COUNT(*)
             FROM assignment_submissions
             WHERE student_id = :student_id
               AND file_path LIKE :suffix'
        );
        $statement->execute([
            'student_id' => $studentId,
            'suffix' => '%/' . $filename,
        ]);

        return (int) $statement->fetchColumn() > 0;
    }

    private function studentCanAccessLessonFile(int $studentId, string $filename): bool
    {
        $statement = Database::connection()->prepare(
            'SELECT COUNT(*)
             FROM lessons l
             INNER JOIN subjects s ON s.id = l.subject_id
             INNER JOIN student_subjects ss ON ss.subject_id = s.id
             WHERE ss.student_id = :student_id
               AND ss.status = :student_subject_status
               AND l.material_path LIKE :suffix
               AND l.status = :published_status
               AND l.deleted_at IS NULL
               AND s.deleted_at IS NULL'
        );
        $statement->execute([
            'student_id' => $studentId,
            'student_subject_status' => 'active',
            'suffix' => '%/' . $filename,
            'published_status' => 'published',
        ]);

        return (int) $statement->fetchColumn() > 0;
    }

    private function tableAndColumn(string $category): array
    {
        return match ($category) {
            'assignments' => ['assignments', 'attachment_path'],
            'submissions' => ['assignment_submissions', 'file_path'],
            'lessons' => ['lessons', 'material_path'],
        };
    }

    private function resolvePath(string $category, string $filename): ?string
    {
        $candidates = [
            BASE_PATH . '/storage/uploads/' . $category . '/' . $filename,
            BASE_PATH . '/public/uploads/' . $category . '/' . $filename,
        ];

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_readable($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function notFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy file hoặc bạn không có quyền tải file này.',
            'errors' => [],
        ], 404);
    }
}
