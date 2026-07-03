<?php

class StudentController extends Controller
{
    private Student $student;
    private Role $role;

    public function __construct()
    {
        $this->student = new Student();
        $this->role = new Role();
    }

    public function index(): void
    {
        $result = $this->student->getAll([
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? '')),
            'page' => (int) ($_GET['page'] ?? 1),
            'limit' => (int) ($_GET['limit'] ?? 10),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách sinh viên thành công.',
            'data' => $result['data'],
            'pagination' => $result['pagination'],
        ]);
    }

    public function show(string|int $id): void
    {
        $student = $this->findStudentOrFail((int) $id);
        if ($student === null) {
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết sinh viên thành công.',
            'data' => $student,
        ]);
    }

    public function store(): void
    {
        $data = $this->normalizeStudentData($this->input(), true);
        $errors = $this->validateStudent($data, true);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($this->student->isEmailExists($data['email'])) {
            $this->validationFailed(['email' => 'Email này đã tồn tại trong hệ thống.']);
            return;
        }

        if ($this->student->isStudentCodeExists($data['student_code'])) {
            $this->validationFailed(['student_code' => 'Mã sinh viên đã tồn tại trong hệ thống.']);
            return;
        }

        $studentRole = $this->role->findByName('student');
        if ($studentRole === null) {
            $this->json([
                'success' => false,
                'message' => 'Vai trò sinh viên chưa được cấu hình.',
            ], 500);
            return;
        }

        $password = $data['password'] !== '' ? $data['password'] : $data['student_code'];
        $studentId = $this->student->create([
            'role_id' => (int) $studentRole['id'],
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'phone' => $data['phone'],
            'student_code' => $data['student_code'],
            'status' => $data['status'],
        ]);

        $this->json([
            'success' => true,
            'message' => 'Thêm sinh viên thành công.',
            'data' => $this->compactStudent($this->student->findById($studentId)),
        ], 201);
    }

    public function update(string|int $id): void
    {
        $studentId = (int) $id;
        $student = $this->findStudentOrFail($studentId);
        if ($student === null) {
            return;
        }

        $data = $this->normalizeStudentData($this->input(), false);
        $errors = $this->validateStudent($data, false);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($this->student->isEmailExists($data['email'], $studentId)) {
            $this->validationFailed(['email' => 'Email này đã tồn tại trong hệ thống.']);
            return;
        }

        if ($this->student->isStudentCodeExists($data['student_code'], $studentId)) {
            $this->validationFailed(['student_code' => 'Mã sinh viên đã tồn tại trong hệ thống.']);
            return;
        }

        $this->student->update($studentId, $data);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật thông tin sinh viên thành công.',
            'data' => $this->compactStudent($this->student->findById($studentId)),
        ]);
    }

    public function destroy(string|int $id): void
    {
        $studentId = (int) $id;
        $student = $this->findStudentOrFail($studentId);
        if ($student === null) {
            return;
        }

        if ($this->student->hasRelatedData($studentId)) {
            $this->student->disable($studentId);
            $this->json([
                'success' => true,
                'message' => 'Sinh viên đã có dữ liệu học tập nên tài khoản được chuyển sang trạng thái vô hiệu hóa.',
            ]);
            return;
        }

        $this->student->delete($studentId);

        $this->json([
            'success' => true,
            'message' => 'Xóa sinh viên thành công.',
        ]);
    }

    public function disable(string|int $id): void
    {
        if ($this->findStudentOrFail((int) $id) === null) {
            return;
        }

        $this->student->disable((int) $id);
        $this->json([
            'success' => true,
            'message' => 'Tài khoản sinh viên đã được vô hiệu hóa.',
        ]);
    }

    public function enable(string|int $id): void
    {
        if ($this->findStudentOrFail((int) $id) === null) {
            return;
        }

        $this->student->enable((int) $id);
        $this->json([
            'success' => true,
            'message' => 'Tài khoản sinh viên đã được kích hoạt.',
        ]);
    }

    public function lock(string|int $id): void
    {
        if ($this->findStudentOrFail((int) $id) === null) {
            return;
        }

        $this->student->lock((int) $id);
        $this->json([
            'success' => true,
            'message' => 'Tài khoản sinh viên đã bị khóa.',
        ]);
    }

    public function resetPassword(string|int $id): void
    {
        $studentId = (int) $id;
        $student = $this->findStudentOrFail($studentId);
        if ($student === null) {
            return;
        }

        $input = $this->input();
        $newPassword = (string) ($input['new_password'] ?? '');

        if ($newPassword !== '' && strlen($newPassword) < 6) {
            $this->validationFailed(['new_password' => 'Mật khẩu mới phải có ít nhất 6 ký tự.']);
            return;
        }

        $password = $newPassword !== '' ? $newPassword : (string) $student['student_code'];
        if ($password === '') {
            $this->validationFailed(['new_password' => 'Sinh viên chưa có mã sinh viên để dùng làm mật khẩu mặc định.']);
            return;
        }

        $this->student->resetPassword($studentId, $password);

        $this->json([
            'success' => true,
            'message' => 'Reset mật khẩu sinh viên thành công.',
        ]);
    }

    public function import(): void
    {
        $file = $_FILES['file'] ?? null;

        if (! is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $this->validationFailed(['file' => 'Vui lòng chọn file import.']);
            return;
        }

        if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
            $this->validationFailed(['file' => 'File import không được vượt quá 5MB.']);
            return;
        }

        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        if (! in_array($extension, ['csv', 'xls', 'xlsx'], true)) {
            $this->validationFailed(['file' => 'File import chỉ hỗ trợ CSV, XLS hoặc XLSX.']);
            return;
        }

        $uploadDir = BASE_PATH . '/public/uploads/imports';
        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $storedPath = $uploadDir . '/students_' . date('YmdHis') . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
        if (! move_uploaded_file($file['tmp_name'], $storedPath)) {
            $this->validationFailed(['file' => 'Không thể lưu file import.']);
            return;
        }

        try {
            $service = new ImportStudentService();
            $result = $service->import($storedPath, $extension);
        } catch (RuntimeException $exception) {
            @unlink($storedPath);
            $this->validationFailed(['file' => $exception->getMessage()]);
            return;
        }

        @unlink($storedPath);

        $this->json([
            'success' => true,
            'message' => 'Import danh sách sinh viên hoàn tất.',
            'summary' => $result['summary'],
            'errors' => $result['errors'],
        ]);
    }

    public function downloadTemplate(): void
    {
        $fileName = 'students_import_template.csv';
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');

        $output = fopen('php://output', 'wb');
        fputcsv($output, ['full_name', 'email', 'phone', 'student_code', 'password', 'status']);
        fputcsv($output, ['Tran Thi My Le', 'student@example.com', '0336655409', '24211TT3192', '24211TT3192', 'active']);
        fclose($output);
    }

    private function normalizeStudentData(array $input, bool $isCreate): array
    {
        return [
            'full_name' => trim((string) ($input['full_name'] ?? '')),
            'email' => strtolower(trim((string) ($input['email'] ?? ''))),
            'password' => $isCreate ? (string) ($input['password'] ?? '') : '',
            'phone' => trim((string) ($input['phone'] ?? '')),
            'student_code' => trim((string) ($input['student_code'] ?? '')),
            'status' => trim((string) ($input['status'] ?? 'active')),
        ];
    }

    private function validateStudent(array $data, bool $isCreate): array
    {
        $errors = [];
        $nameLength = $this->textLength($data['full_name']);

        if ($data['full_name'] === '') {
            $errors['full_name'] = 'Họ tên là bắt buộc.';
        } elseif ($nameLength < 3) {
            $errors['full_name'] = 'Họ tên phải có ít nhất 3 ký tự.';
        } elseif ($nameLength > 150) {
            $errors['full_name'] = 'Họ tên không được vượt quá 150 ký tự.';
        }

        if ($data['email'] === '') {
            $errors['email'] = 'Email là bắt buộc.';
        } elseif (! filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Email không đúng định dạng.';
        }

        if ($data['phone'] !== '' && ! preg_match('/^(0|\+84)?[0-9]{8,11}$/', $data['phone'])) {
            $errors['phone'] = 'Số điện thoại không hợp lệ.';
        }

        if ($data['student_code'] === '') {
            $errors['student_code'] = 'Mã sinh viên là bắt buộc.';
        } elseif ($this->textLength($data['student_code']) > 50) {
            $errors['student_code'] = 'Mã sinh viên không được vượt quá 50 ký tự.';
        }

        if ($isCreate && $data['password'] !== '' && strlen($data['password']) < 6) {
            $errors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        if (! in_array($data['status'], ['active', 'inactive', 'locked'], true)) {
            $errors['status'] = 'Trạng thái chỉ được là active, inactive hoặc locked.';
        }

        return $errors;
    }

    private function findStudentOrFail(int $id): ?array
    {
        $student = $this->student->findById($id);

        if ($student === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy sinh viên.',
            ], 404);
            return null;
        }

        return $student;
    }

    private function compactStudent(?array $student): array
    {
        if ($student === null) {
            return [];
        }

        return [
            'id' => (int) $student['id'],
            'full_name' => $student['full_name'],
            'email' => $student['email'],
            'phone' => $student['phone'],
            'student_code' => $student['student_code'],
            'status' => $student['status'],
        ];
    }

    private function validationFailed(array $errors): void
    {
        $this->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $errors,
        ], 422);
    }

    private function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
