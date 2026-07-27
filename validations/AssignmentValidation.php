<?php

class AssignmentValidation
{
    private const STATUSES = ['open', 'closed', 'draft'];
    private const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'zip', 'rar', 'png', 'jpg', 'jpeg'];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024;

    public static function validate(array $data, ?array $file = null): array
    {
        $errors = [];
        $subjectId = trim((string) ($data['subject_id'] ?? ''));
        $title = trim((string) ($data['title'] ?? ''));
        $deadline = trim((string) ($data['deadline'] ?? ''));
        $status = trim((string) ($data['status'] ?? 'draft'));

        if ($subjectId === '') {
            $errors['subject_id'] = 'Môn học là bắt buộc.';
        } elseif (! ctype_digit($subjectId) || (int) $subjectId <= 0) {
            $errors['subject_id'] = 'Môn học không hợp lệ.';
        }

        if ($title === '') {
            $errors['title'] = 'Tiêu đề bài tập là bắt buộc.';
        } elseif (self::textLength($title) > 255) {
            $errors['title'] = 'Tiêu đề bài tập không được vượt quá 255 ký tự.';
        }

        if ($deadline === '') {
            $errors['deadline'] = 'Deadline là bắt buộc.';
        } elseif (self::parseDateTime($deadline) === null) {
            $errors['deadline'] = 'Deadline không đúng định dạng.';
        } elseif ($status === 'open' && self::parseDateTime($deadline) <= new DateTimeImmutable()) {
            $errors['deadline'] = 'Deadline phải lớn hơn thời gian hiện tại khi trạng thái là open.';
        }

        if (! in_array($status, self::STATUSES, true)) {
            $errors['status'] = 'Trạng thái chỉ được là open, closed hoặc draft.';
        }

        if ($file !== null) {
            $fileErrors = self::validateAttachment($file);
            $errors = array_merge($errors, $fileErrors);
        }

        return $errors;
    }

    public static function validateAttachment(array $file): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error === UPLOAD_ERR_NO_FILE) {
            return [];
        }

        if ($error !== UPLOAD_ERR_OK) {
            return ['attachment' => 'Không thể tải file đính kèm.'];
        }

        if ((int) ($file['size'] ?? 0) > self::MAX_FILE_SIZE) {
            return ['attachment' => 'File đính kèm không được vượt quá 10MB.'];
        }

        $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            return ['attachment' => 'File đính kèm chỉ hỗ trợ pdf, doc, docx, zip, rar, png, jpg hoặc jpeg.'];
        }

        return [];
    }

    public static function normalizeDeadline(string $deadline): string
    {
        $date = self::parseDateTime($deadline);

        return $date ? $date->format('Y-m-d H:i:s') : $deadline;
    }

    private static function parseDateTime(string $value): ?DateTimeImmutable
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $formats = ['Y-m-d\TH:i', 'Y-m-d\TH:i:s', 'Y-m-d H:i', 'Y-m-d H:i:s'];
        foreach ($formats as $format) {
            $date = DateTimeImmutable::createFromFormat($format, $value);
            if ($date instanceof DateTimeImmutable) {
                return $date;
            }
        }

        try {
            return new DateTimeImmutable($value);
        } catch (Exception) {
            return null;
        }
    }

    private static function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
