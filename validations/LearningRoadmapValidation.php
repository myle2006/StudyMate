<?php

class LearningRoadmapValidation
{
    private const LEVELS = ['beginner', 'intermediate', 'advanced'];
    private const ROADMAP_STATUSES = ['draft', 'active', 'completed', 'paused'];
    private const ITEM_STATUSES = ['not_started', 'in_progress', 'completed', 'not_completed', 'rescheduled'];
    private const ITEM_PRIORITIES = ['low', 'medium', 'high'];

    public static function validateGenerate(array $data): array
    {
        return self::validateBase($data, false);
    }

    public static function validateSave(array $data, bool $requireItems = true): array
    {
        $errors = self::validateBase($data, $requireItems);

        $title = trim((string) ($data['title'] ?? ''));
        if ($title === '') {
            $errors['title'] = 'Tên lộ trình là bắt buộc.';
        } elseif (self::textLength($title) > 255) {
            $errors['title'] = 'Tên lộ trình không được vượt quá 255 ký tự.';
        }

        $status = trim((string) ($data['status'] ?? 'draft'));
        if (! in_array($status, self::ROADMAP_STATUSES, true)) {
            $errors['status'] = 'Trạng thái lộ trình không hợp lệ.';
        }

        if (($requireItems || isset($data['items'])) && ! isset($errors['items'])) {
            $itemErrors = self::validateItems($data['items'] ?? []);
            if ($itemErrors !== []) {
                $errors['items'] = $itemErrors;
            }
        }

        return $errors;
    }

    public static function validateItemStatus(array $data): array
    {
        $status = trim((string) ($data['status'] ?? ''));

        if (! in_array($status, self::ITEM_STATUSES, true)) {
            return ['status' => 'Trạng thái bước học không hợp lệ.'];
        }

        return [];
    }

    public static function normalizeDate(string $value): string
    {
        $date = self::parseDate($value);

        return $date ? $date->format('Y-m-d') : $value;
    }

    public static function normalizeItems(array $items): array
    {
        return array_values(array_map(static function (array $item, int $index): array {
            return [
                'week_number' => max(1, (int) ($item['week_number'] ?? 1)),
                'order_number' => max(1, (int) ($item['order_number'] ?? $index + 1)),
                'title' => trim((string) ($item['title'] ?? '')),
                'description' => trim((string) ($item['description'] ?? '')),
                'expected_result' => trim((string) ($item['expected_result'] ?? '')),
                'suggested_task' => trim((string) ($item['suggested_task'] ?? '')),
                'planned_date' => trim((string) ($item['planned_date'] ?? '')),
                'start_time' => self::normalizeTime((string) ($item['start_time'] ?? '')),
                'duration_minutes' => max(15, (int) ($item['duration_minutes'] ?? 60)),
                'priority' => in_array(($item['priority'] ?? 'medium'), self::ITEM_PRIORITIES, true)
                    ? $item['priority']
                    : 'medium',
                'status' => in_array(($item['status'] ?? 'not_started'), self::ITEM_STATUSES, true)
                    ? $item['status']
                    : 'not_started',
                'completion_percent' => min(100, max(0, (float) ($item['completion_percent'] ?? 0))),
                'learned_content' => trim((string) ($item['learned_content'] ?? '')),
                'unfinished_content' => trim((string) ($item['unfinished_content'] ?? '')),
                'note' => trim((string) ($item['note'] ?? '')),
                'self_assessment' => self::nullableInt($item['self_assessment'] ?? null),
                'actual_study_minutes' => self::nullableInt($item['actual_study_minutes'] ?? null),
            ];
        }, $items, array_keys($items)));
    }

    private static function validateBase(array $data, bool $requireItems): array
    {
        $errors = [];
        $subjectId = trim((string) ($data['subject_id'] ?? ''));
        $learningGoalId = trim((string) ($data['learning_goal_id'] ?? ''));
        $goal = trim((string) ($data['goal'] ?? ''));
        $currentLevel = trim((string) ($data['current_level'] ?? ''));
        $studyTime = trim((string) ($data['study_time_per_day'] ?? ''));
        $weekdays = self::normalizeWeekdays($data['available_weekdays'] ?? []);
        $preferredStartTime = self::normalizeTime((string) ($data['preferred_start_time'] ?? ''));
        $sessionDuration = trim((string) ($data['session_duration_minutes'] ?? ''));
        $maxDaily = trim((string) ($data['max_daily_minutes'] ?? ''));
        $maxWeekly = trim((string) ($data['max_weekly_minutes'] ?? ''));
        $reminder = trim((string) ($data['reminder_minutes_before'] ?? '15'));
        $startDate = trim((string) ($data['start_date'] ?? ''));
        $endDate = trim((string) ($data['end_date'] ?? ''));

        if ($subjectId === '') {
            $errors['subject_id'] = 'Môn học là bắt buộc.';
        } elseif (! ctype_digit($subjectId) || (int) $subjectId <= 0) {
            $errors['subject_id'] = 'Môn học không hợp lệ.';
        }

        if ($learningGoalId !== '' && (! ctype_digit($learningGoalId) || (int) $learningGoalId <= 0)) {
            $errors['learning_goal_id'] = 'Mục tiêu học tập không hợp lệ.';
        }

        if ($goal === '') {
            $errors['goal'] = 'Mục tiêu học tập là bắt buộc.';
        }

        if (! in_array($currentLevel, self::LEVELS, true)) {
            $errors['current_level'] = 'Trình độ hiện tại không hợp lệ.';
        }

        if ($studyTime === '') {
            $errors['study_time_per_day'] = 'Thời gian học mỗi ngày là bắt buộc.';
        } elseif (! is_numeric($studyTime) || (float) $studyTime <= 0) {
            $errors['study_time_per_day'] = 'Thời gian học mỗi ngày phải là số lớn hơn 0.';
        }

        if ($weekdays === []) {
            $errors['available_weekdays'] = 'Vui lòng chọn ít nhất một ngày có thể học trong tuần.';
        }

        if ($preferredStartTime === '') {
            $errors['preferred_start_time'] = 'Khung giờ bắt đầu học là bắt buộc.';
        }

        if ($sessionDuration === '' || ! ctype_digit($sessionDuration) || (int) $sessionDuration < 15) {
            $errors['session_duration_minutes'] = 'Thời lượng mỗi buổi phải từ 15 phút trở lên.';
        }

        if ($maxDaily !== '' && (! ctype_digit($maxDaily) || (int) $maxDaily < 15)) {
            $errors['max_daily_minutes'] = 'Tổng thời gian học mỗi ngày phải từ 15 phút trở lên.';
        }

        if ($maxWeekly !== '' && (! ctype_digit($maxWeekly) || (int) $maxWeekly < 15)) {
            $errors['max_weekly_minutes'] = 'Tổng thời gian học mỗi tuần phải từ 15 phút trở lên.';
        }

        if ($reminder !== '' && (! ctype_digit($reminder) || (int) $reminder < 0)) {
            $errors['reminder_minutes_before'] = 'Thời gian nhắc lịch không hợp lệ.';
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

        if ($requireItems && (! isset($data['items']) || ! is_array($data['items']) || count($data['items']) === 0)) {
            $errors['items'] = 'Lộ trình cần có ít nhất một bước học.';
        }

        return $errors;
    }

    private static function validateItems(array $items): array
    {
        $errors = [];

        foreach ($items as $index => $item) {
            if (! is_array($item)) {
                $errors[$index] = 'Bước học không hợp lệ.';
                continue;
            }

            $itemErrors = [];
            if ((int) ($item['week_number'] ?? 0) <= 0) {
                $itemErrors['week_number'] = 'Tuần học phải lớn hơn 0.';
            }

            if (trim((string) ($item['title'] ?? '')) === '') {
                $itemErrors['title'] = 'Tên bước học là bắt buộc.';
            }

            $status = trim((string) ($item['status'] ?? 'not_started'));
            if (! in_array($status, self::ITEM_STATUSES, true)) {
                $itemErrors['status'] = 'Trạng thái bước học không hợp lệ.';
            }

            $plannedDate = trim((string) ($item['planned_date'] ?? ''));
            if ($plannedDate === '') {
                $itemErrors['planned_date'] = 'Ngày học là bắt buộc.';
            } elseif (self::parseDate($plannedDate) === null) {
                $itemErrors['planned_date'] = 'Ngày dự kiến không đúng định dạng.';
            }

            $startTime = trim((string) ($item['start_time'] ?? ''));
            if ($startTime === '') {
                $itemErrors['start_time'] = 'Giờ bắt đầu là bắt buộc.';
            } elseif (self::normalizeTime($startTime) === '') {
                $itemErrors['start_time'] = 'Giờ bắt đầu không đúng định dạng.';
            }

            if ((int) ($item['duration_minutes'] ?? 0) < 15) {
                $itemErrors['duration_minutes'] = 'Thời lượng dự kiến phải từ 15 phút trở lên.';
            }

            $priority = trim((string) ($item['priority'] ?? 'medium'));
            if (! in_array($priority, self::ITEM_PRIORITIES, true)) {
                $itemErrors['priority'] = 'Mức độ ưu tiên không hợp lệ.';
            }

            if ($itemErrors !== []) {
                $errors[$index] = $itemErrors;
            }
        }

        return $errors;
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

    public static function normalizeWeekdays(mixed $value): array
    {
        if (is_string($value)) {
            $value = preg_split('/[\s,]+/', $value) ?: [];
        }

        if (! is_array($value)) {
            return [];
        }

        $days = array_map('intval', $value);
        $days = array_values(array_unique(array_filter($days, static fn (int $day): bool => $day >= 1 && $day <= 7)));
        sort($days);

        return $days;
    }

    public static function normalizeTime(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        if (! preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $value)) {
            return '';
        }

        $date = DateTimeImmutable::createFromFormat(strlen($value) <= 5 ? 'H:i' : 'H:i:s', $value);

        return $date ? $date->format('H:i') : '';
    }

    private static function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private static function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
