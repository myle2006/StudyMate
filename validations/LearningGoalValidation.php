<?php

class LearningGoalValidation
{
    private const LEVELS = ['beginner', 'intermediate', 'advanced'];
    private const STATUSES = ['active', 'completed', 'paused', 'cancelled'];

    public static function validate(array $data): array
    {
        $errors = [];

        $subjectId = trim((string) ($data['subject_id'] ?? ''));
        $title = trim((string) ($data['title'] ?? ''));
        $description = trim((string) ($data['goal_description'] ?? ''));
        $currentLevel = trim((string) ($data['current_level'] ?? ''));
        $studyTime = trim((string) ($data['study_time_per_day'] ?? ''));
        $startDate = trim((string) ($data['start_date'] ?? ''));
        $endDate = trim((string) ($data['end_date'] ?? ''));
        $status = trim((string) ($data['status'] ?? 'active'));

        if ($subjectId === '') {
            $errors['subject_id'] = 'Môn học là bắt buộc.';
        } elseif (! ctype_digit($subjectId) || (int) $subjectId <= 0) {
            $errors['subject_id'] = 'Môn học không hợp lệ.';
        }

        if ($title === '') {
            $errors['title'] = 'Tiêu đề mục tiêu là bắt buộc.';
        } elseif (self::textLength($title) > 255) {
            $errors['title'] = 'Tiêu đề mục tiêu không được vượt quá 255 ký tự.';
        }

        if ($description === '') {
            $errors['goal_description'] = 'Mô tả mục tiêu là bắt buộc.';
        }

        if (! in_array($currentLevel, self::LEVELS, true)) {
            $errors['current_level'] = 'Trình độ hiện tại không hợp lệ.';
        }

        if ($studyTime === '') {
            $errors['study_time_per_day'] = 'Thời gian học mỗi ngày là bắt buộc.';
        } elseif (! is_numeric($studyTime) || (float) $studyTime <= 0) {
            $errors['study_time_per_day'] = 'Thời gian học mỗi ngày phải là số lớn hơn 0.';
        }

        $parsedStart = self::parseDate($startDate);
        $parsedEnd = self::parseDate($endDate);

        if ($startDate === '') {
            $errors['start_date'] = 'Ngày bắt đầu là bắt buộc.';
        } elseif ($parsedStart === null) {
            $errors['start_date'] = 'Ngày bắt đầu không đúng định dạng.';
        }

        if ($endDate === '') {
            $errors['end_date'] = 'Ngày kết thúc là bắt buộc.';
        } elseif ($parsedEnd === null) {
            $errors['end_date'] = 'Ngày kết thúc không đúng định dạng.';
        }

        if ($parsedStart !== null && $parsedEnd !== null && $parsedStart > $parsedEnd) {
            $errors['end_date'] = 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.';
        }

        if (! in_array($status, self::STATUSES, true)) {
            $errors['status'] = 'Trạng thái mục tiêu không hợp lệ.';
        }

        return $errors;
    }

    public static function normalizeDate(string $value): string
    {
        $date = self::parseDate($value);

        return $date ? $date->format('Y-m-d') : $value;
    }

    private static function parseDate(string $value): ?DateTimeImmutable
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $date = DateTimeImmutable::createFromFormat('Y-m-d', $value);
        if ($date instanceof DateTimeImmutable) {
            return $date;
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
