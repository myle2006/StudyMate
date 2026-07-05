<?php

class SubjectValidation
{
    private const STATUSES = ['studying', 'paused', 'completed'];
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    private const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

    public static function validateCreate(array $data, ?array $file = null): array
    {
        $errors = self::validateBase($data, true);

        if ($file !== null) {
            $errors = array_merge($errors, self::validateImage($file));
        }

        return $errors;
    }

    public static function validateUpdate(array $data, ?array $file = null): array
    {
        $errors = self::validateBase($data, false);

        if (array_key_exists('subject_code', $data) && trim((string) $data['subject_code']) !== '') {
            $errors['subject_code'] = 'Không được chỉnh sửa mã môn học.';
        }

        if ($file !== null) {
            $errors = array_merge($errors, self::validateImage($file));
        }

        return $errors;
    }

    private static function validateBase(array $data, bool $requireCode): array
    {
        $errors = [];
        $name = trim((string) ($data['subject_name'] ?? ''));
        $code = trim((string) ($data['subject_code'] ?? ''));
        $credits = trim((string) ($data['credits'] ?? '3'));
        $status = trim((string) ($data['status'] ?? ''));
        $color = trim((string) ($data['color'] ?? ''));

        if ($name === '') {
            $errors['subject_name'] = 'Tên môn học là bắt buộc.';
        } elseif (self::textLength($name) > 255) {
            $errors['subject_name'] = 'Tên môn học không được vượt quá 255 ký tự.';
        }

        if ($requireCode && $code === '') {
            $errors['subject_code'] = 'Mã môn học là bắt buộc.';
        } elseif ($code !== '') {
            if (self::textLength($code) > 50) {
                $errors['subject_code'] = 'Mã môn học không được vượt quá 50 ký tự.';
            } elseif (! preg_match('/^[A-Za-z0-9_-]+$/', $code)) {
                $errors['subject_code'] = 'Mã môn học chỉ được chứa chữ, số, dấu gạch ngang hoặc gạch dưới.';
            }
        }

        if ($credits === '') {
            $errors['credits'] = 'Số tín chỉ là bắt buộc.';
        } elseif (! ctype_digit($credits)) {
            $errors['credits'] = 'Số tín chỉ phải là số nguyên.';
        } elseif ((int) $credits < 1 || (int) $credits > 30) {
            $errors['credits'] = 'Số tín chỉ phải nằm trong khoảng từ 1 đến 30.';
        }

        if ($status === '') {
            $errors['status'] = 'Trạng thái môn học là bắt buộc.';
        } elseif (! in_array($status, self::STATUSES, true)) {
            $errors['status'] = 'Trạng thái môn học không hợp lệ.';
        }

        if ($color !== '' && ! preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', $color)) {
            $errors['color'] = 'Màu đại diện không đúng định dạng mã màu hex.';
        }

        return $errors;
    }

    public static function validateImage(array $file): array
    {
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error === UPLOAD_ERR_NO_FILE) {
            return [];
        }

        if ($error !== UPLOAD_ERR_OK) {
            return ['image' => 'Không thể tải ảnh môn học.'];
        }

        if ((int) ($file['size'] ?? 0) > self::MAX_IMAGE_SIZE) {
            return ['image' => 'Ảnh môn học không được vượt quá 2MB.'];
        }

        $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        if (! in_array($extension, self::IMAGE_EXTENSIONS, true)) {
            return ['image' => 'Ảnh môn học chỉ hỗ trợ jpg, jpeg, png, webp hoặc gif.'];
        }

        $imageInfo = @getimagesize((string) ($file['tmp_name'] ?? ''));
        if ($imageInfo === false || ! in_array((string) ($imageInfo['mime'] ?? ''), self::IMAGE_MIME_TYPES, true)) {
            return ['image' => 'File tải lên phải là hình ảnh hợp lệ.'];
        }

        return [];
    }

    private static function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
