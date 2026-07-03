<?php

class AuthController extends Controller
{
    private User $user;
    private Role $role;

    public function __construct()
    {
        $this->user = new User();
        $this->role = new Role();
    }

    public function register(): void
    {
        $input = $this->input();
        $data = $this->normalizeRegisterData($input);
        $errors = $this->validateRegister($data);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($this->user->isEmailExists($data['email'])) {
            $this->json([
                'success' => false,
                'message' => 'Email đã được sử dụng.',
                'errors' => [
                    'email' => 'Email này đã tồn tại trong hệ thống.',
                ],
            ], 422);
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

        $userId = $this->user->create([
            'role_id' => (int) $studentRole['id'],
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'phone' => $data['phone'],
            'student_code' => $data['student_code'],
            'status' => 'active',
        ]);

        $createdUser = $this->user->getUserWithRole($userId);

        $this->json([
            'success' => true,
            'message' => 'Đăng ký tài khoản thành công.',
            'data' => $this->publicUser($createdUser),
        ], 201);
    }

    public function login(): void
    {
        $data = $this->normalizeLoginData($this->input());
        $errors = $this->validateLogin($data);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $user = $this->user->findByEmail($data['email']);

        if ($user === null || ! password_verify($data['password'], $user['password'])) {
            $this->invalidCredentials();
            return;
        }

        if ($user['status'] === 'locked') {
            $this->json([
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
            ], 403);
            return;
        }

        if ($user['status'] === 'inactive') {
            $this->json([
                'success' => false,
                'message' => 'Tài khoản của bạn đang bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
            ], 403);
            return;
        }

        $roleName = strtolower((string) $user['role']);
        $token = Jwt::generate([
            'user_id' => (int) $user['id'],
            'email' => $user['email'],
            'role' => $roleName,
        ]);

        $this->user->updateLastLogin((int) $user['id']);

        $this->json([
            'success' => true,
            'message' => 'Đăng nhập thành công.',
            'token' => $token,
            'data' => [
                'id' => (int) $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'role' => $roleName,
                'redirect_url' => $this->redirectUrl($roleName),
            ],
        ]);
    }

    public function me(): void
    {
        $user = $this->currentUser();

        $this->json([
            'success' => true,
            'message' => 'Lấy thông tin người dùng thành công.',
            'data' => $this->publicUser($user),
        ]);
    }

    public function logout(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Đăng xuất thành công.',
        ]);
    }

    public function adminDashboard(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Truy cập dashboard admin thành công.',
            'data' => [
                'title' => 'Admin Dashboard',
                'menus' => [
                    'Dashboard',
                    'Quản lý người dùng',
                    'Quản lý môn học',
                    'Quản lý bài học',
                    'Quản lý quiz',
                    'Thống kê',
                ],
            ],
        ]);
    }

    public function studentDashboard(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Truy cập dashboard sinh viên thành công.',
            'data' => [
                'title' => 'Student Dashboard',
                'menus' => [
                    'Trang cá nhân',
                    'Môn học của tôi',
                    'Lộ trình học',
                    'Nhiệm vụ học tập',
                    'Ghi chú',
                    'AI Assistant',
                    'Tiến độ học tập',
                ],
            ],
        ]);
    }

    private function normalizeRegisterData(array $input): array
    {
        return [
            'full_name' => trim((string) ($input['full_name'] ?? '')),
            'email' => strtolower(trim((string) ($input['email'] ?? ''))),
            'password' => (string) ($input['password'] ?? ''),
            'confirm_password' => (string) ($input['confirm_password'] ?? ''),
            'phone' => trim((string) ($input['phone'] ?? '')),
            'student_code' => trim((string) ($input['student_code'] ?? '')),
        ];
    }

    private function normalizeLoginData(array $input): array
    {
        return [
            'email' => strtolower(trim((string) ($input['email'] ?? ''))),
            'password' => (string) ($input['password'] ?? ''),
        ];
    }

    private function validateRegister(array $data): array
    {
        $errors = [];
        $fullNameLength = $this->textLength($data['full_name']);

        if ($data['full_name'] === '') {
            $errors['full_name'] = 'Họ tên là bắt buộc.';
        } elseif ($fullNameLength < 3) {
            $errors['full_name'] = 'Họ tên phải có ít nhất 3 ký tự.';
        } elseif ($fullNameLength > 150) {
            $errors['full_name'] = 'Họ tên không được vượt quá 150 ký tự.';
        }

        if ($data['email'] === '') {
            $errors['email'] = 'Email là bắt buộc.';
        } elseif (! filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Email không đúng định dạng.';
        }

        if ($data['password'] === '') {
            $errors['password'] = 'Mật khẩu là bắt buộc.';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        if ($data['confirm_password'] === '') {
            $errors['confirm_password'] = 'Vui lòng nhập lại mật khẩu.';
        } elseif ($data['confirm_password'] !== $data['password']) {
            $errors['confirm_password'] = 'Mật khẩu nhập lại không khớp.';
        }

        if ($data['phone'] !== '' && ! preg_match('/^(0|\+84)[0-9]{8,10}$/', $data['phone'])) {
            $errors['phone'] = 'Số điện thoại không hợp lệ.';
        }

        if ($data['student_code'] !== '' && $this->textLength($data['student_code']) > 50) {
            $errors['student_code'] = 'Mã sinh viên không được vượt quá 50 ký tự.';
        }

        return $errors;
    }

    private function validateLogin(array $data): array
    {
        $errors = [];

        if ($data['email'] === '') {
            $errors['email'] = 'Email là bắt buộc.';
        } elseif (! filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Email không đúng định dạng.';
        }

        if ($data['password'] === '') {
            $errors['password'] = 'Mật khẩu là bắt buộc.';
        }

        return $errors;
    }

    private function publicUser(?array $user): array
    {
        if ($user === null) {
            return [];
        }

        return [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => strtolower((string) $user['role']),
            'avatar' => $user['avatar'] ?? null,
            'phone' => $user['phone'] ?? null,
            'student_code' => $user['student_code'] ?? null,
            'status' => $user['status'],
        ];
    }

    private function redirectUrl(string $roleName): string
    {
        return $roleName === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    }

    private function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }

    private function validationFailed(array $errors): void
    {
        $this->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $errors,
        ], 422);
    }

    private function invalidCredentials(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Email hoặc mật khẩu không chính xác.',
        ], 401);
    }
}
