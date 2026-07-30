<?php

class LessonValidation
{
    private const STATUSES = ['draft', 'published'];
    private const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'rar', 'png', 'jpg', 'jpeg'];
    private const MAX_FILE_SIZE = 20 * 1024 * 1024;

    public static function validate(array $data, ?array $file = null): array
    {
        $errors = [];

        if (! ctype_digit((string) ($data['subject_id'] ?? '')) || (int) $data['subject_id'] <= 0) {
            $errors['subject_id'] = 'Môn học không hợp lệ.';
        }

        $title = trim((string) ($data['title'] ?? ''));
        if ($title === '') {
            $errors['title'] = 'Tiêu đề bài học là bắt buộc.';
        } elseif (self::textLength($title) > 255) {
            $errors['title'] = 'Tiêu đề bài học không được vượt quá 255 ký tự.';
        }

        if (! in_array((string) ($data['status'] ?? ''), self::STATUSES, true)) {
            $errors['status'] = 'Trạng thái bài học không hợp lệ.';
        }

        foreach (['video_url', 'external_url'] as $field) {
            $url = trim((string) ($data[$field] ?? ''));
            if ($url !== '' && (! filter_var($url, FILTER_VALIDATE_URL) || self::textLength($url) > 500)) {
                $errors[$field] = 'Đường dẫn không hợp lệ.';
            }
        }

        $duration = trim((string) ($data['duration_minutes'] ?? ''));
        if ($duration !== '' && (! ctype_digit($duration) || (int) $duration < 0 || (int) $duration > 10000)) {
            $errors['duration_minutes'] = 'Thời lượng bài học không hợp lệ.';
        }

        if ($file !== null) {
            $errors = array_merge($errors, self::validateFile($file));
        }

        return $errors;
    }

    public static function validateFile(array $file): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error === UPLOAD_ERR_NO_FILE) {
            return [];
        }

        if ($error !== UPLOAD_ERR_OK) {
            return ['material' => 'Không thể tải tài liệu bài học.'];
        }

        if ((int) ($file['size'] ?? 0) > self::MAX_FILE_SIZE) {
            return ['material' => 'Tài liệu không được vượt quá 20MB.'];
        }

        $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            return ['material' => 'Tài liệu chỉ hỗ trợ pdf, doc, docx, ppt, pptx, xls, xlsx, zip, rar, png, jpg hoặc jpeg.'];
        }

        return [];
    }

    private static function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
