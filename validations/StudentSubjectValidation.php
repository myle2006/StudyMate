<?php

class StudentSubjectValidation
{
    public static function validateSubjectId(string|int $subjectId): array
    {
        if (! self::isPositiveInteger($subjectId)) {
            return ['subject_id' => 'Môn học không hợp lệ.'];
        }

        return [];
    }

    public static function validateAssign(array $data): array
    {
        $errors = [];

        if (! self::isPositiveInteger($data['student_id'] ?? null)) {
            $errors['student_id'] = 'Vui lòng chọn sinh viên hợp lệ.';
        }

        return $errors;
    }

    public static function validateStudentId(string|int $studentId): array
    {
        if (! self::isPositiveInteger($studentId)) {
            return ['student_id' => 'Sinh viên không hợp lệ.'];
        }

        return [];
    }

    private static function isPositiveInteger(mixed $value): bool
    {
        return is_scalar($value) && ctype_digit((string) $value) && (int) $value > 0;
    }
}
