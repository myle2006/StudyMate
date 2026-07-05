<?php

class StudyScheduleValidation
{
    private const TYPES = ['class', 'self_study', 'review', 'assignment', 'exam'];
    private const STATUSES = ['upcoming', 'completed', 'cancelled'];

    public static function validate(array $data): array
    {
        $errors = [];
        $title = trim((string) ($data['title'] ?? ''));
        $subjectId = trim((string) ($data['subject_id'] ?? ''));
        $studyDate = trim((string) ($data['study_date'] ?? ''));
        $startTime = trim((string) ($data['start_time'] ?? ''));
        $endTime = trim((string) ($data['end_time'] ?? ''));
        $scheduleType = trim((string) ($data['schedule_type'] ?? 'self_study'));
        $status = trim((string) ($data['status'] ?? 'upcoming'));
        $location = trim((string) ($data['location'] ?? ''));

        if ($subjectId === '') {
            $errors['subject_id'] = 'Môn học là bắt buộc.';
        } elseif (! ctype_digit($subjectId) || (int) $subjectId <= 0) {
            $errors['subject_id'] = 'Môn học không hợp lệ.';
        }

        if ($title === '') {
            $errors['title'] = 'Tiêu đề lịch học là bắt buộc.';
        } elseif (self::textLength($title) > 255) {
            $errors['title'] = 'Tiêu đề lịch học không được vượt quá 255 ký tự.';
        }

        if ($studyDate === '') {
            $errors['study_date'] = 'Ngày học là bắt buộc.';
        } elseif (! self::isValidDate($studyDate)) {
            $errors['study_date'] = 'Ngày học phải đúng định dạng YYYY-MM-DD.';
        }

        if ($startTime === '') {
            $errors['start_time'] = 'Giờ bắt đầu là bắt buộc.';
        } elseif (! self::isValidTime($startTime)) {
            $errors['start_time'] = 'Giờ bắt đầu phải đúng định dạng HH:mm.';
        }

        if ($endTime === '') {
            $errors['end_time'] = 'Giờ kết thúc là bắt buộc.';
        } elseif (! self::isValidTime($endTime)) {
            $errors['end_time'] = 'Giờ kết thúc phải đúng định dạng HH:mm.';
        }

        if (self::isValidTime($startTime) && self::isValidTime($endTime) && self::timeToMinutes($endTime) <= self::timeToMinutes($startTime)) {
            $errors['end_time'] = 'Giờ kết thúc phải lớn hơn giờ bắt đầu.';
        }

        if ($location !== '' && self::textLength($location) > 255) {
            $errors['location'] = 'Địa điểm hoặc link học không được vượt quá 255 ký tự.';
        }

        if (! in_array($scheduleType, self::TYPES, true)) {
            $errors['schedule_type'] = 'Loại lịch học không hợp lệ.';
        }

        if (! in_array($status, self::STATUSES, true)) {
            $errors['status'] = 'Trạng thái lịch học không hợp lệ.';
        }

        if ($status === 'upcoming' && self::isValidDate($studyDate) && self::isValidTime($startTime)) {
            $scheduledAt = strtotime($studyDate . ' ' . $startTime);
            if ($scheduledAt !== false && $scheduledAt < time()) {
                $errors['study_date'] = 'Không thể tạo lịch sắp diễn ra ở thời điểm quá khứ.';
            }
        }

        return $errors;
    }

    private static function isValidDate(string $value): bool
    {
        $date = DateTime::createFromFormat('Y-m-d', $value);

        return $date !== false && $date->format('Y-m-d') === $value;
    }

    private static function isValidTime(string $value): bool
    {
        if (! preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $value)) {
            return false;
        }

        $time = DateTime::createFromFormat(strlen($value) === 5 ? 'H:i' : 'H:i:s', $value);

        return $time !== false;
    }

    private static function timeToMinutes(string $value): int
    {
        [$hour, $minute] = array_map('intval', array_slice(explode(':', $value), 0, 2));

        return ($hour * 60) + $minute;
    }

    private static function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
