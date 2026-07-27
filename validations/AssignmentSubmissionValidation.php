<?php

class AssignmentSubmissionValidation
{
    private const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'zip', 'rar', 'png', 'jpg', 'jpeg'];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024;

    public static function validate(array $data, ?array $file = null, bool $hasExistingFile = false): array
    {
        $errors = [];
        $content = trim((string) ($data['content'] ?? ''));
        $hasNewFile = $file !== null && (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;

        if ($content === '' && ! $hasNewFile && ! $hasExistingFile) {
            $errors['content'] = 'Vui lòng nhập nội dung bài làm hoặc upload file bài nộp.';
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
            return ['file' => 'Không thể tải file bài nộp.'];
        }

        if ((int) ($file['size'] ?? 0) > self::MAX_FILE_SIZE) {
            return ['file' => 'File bài nộp không được vượt quá 10MB.'];
        }

        $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            return ['file' => 'File bài nộp chỉ hỗ trợ pdf, doc, docx, zip, rar, png, jpg hoặc jpeg.'];
        }

        return [];
    }

    public static function validateGrade(array $data): array
    {
        $errors = [];
        $score = trim((string) ($data['score'] ?? ''));
        $feedback = trim((string) ($data['feedback'] ?? ''));

        if ($score === '') {
            $errors['score'] = 'Điểm là bắt buộc.';
        } elseif (! is_numeric($score)) {
            $errors['score'] = 'Điểm phải là số.';
        } elseif ((float) $score < 0 || (float) $score > 10) {
            $errors['score'] = 'Điểm phải nằm trong khoảng từ 0 đến 10.';
        }

        if ($feedback !== '' && self::textLength($feedback) > 5000) {
            $errors['feedback'] = 'Feedback không được vượt quá 5000 ký tự.';
        }

        return $errors;
    }

    private static function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
