<?php

class AuthMiddleware
{
    private static ?array $user = null;
    private static ?string $token = null;

    public function handle(): bool
    {
        $token = $this->bearerToken();

        if ($token === null) {
            $this->unauthorized('Bạn cần đăng nhập để thực hiện chức năng này.', 401);
            return false;
        }

        $payload = Jwt::verify($token);

        if ($payload === null || empty($payload['user_id'])) {
            $this->unauthorized('Token không hợp lệ hoặc đã hết hạn.', 403);
            return false;
        }

        $userModel = new User();
        $user = $userModel->getUserWithRole((int) $payload['user_id']);

        if ($user === null || $user['status'] !== 'active') {
            $this->unauthorized('Token không hợp lệ hoặc đã hết hạn.', 403);
            return false;
        }

        $user['role'] = strtolower((string) $user['role']);
        self::$user = $user;
        self::$token = $token;

        $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
        $basePath = base_url_path();
        if ($basePath !== '' && strncmp($path, $basePath, strlen($basePath)) === 0) {
            $path = substr($path, strlen($basePath)) ?: '/';
        }
        $allowedDuringPasswordChange = [
            '/api/me',
            '/api/change-password',
            '/api/logout',
        ];
        if ((bool) ($user['must_change_password'] ?? false) && ! in_array($path, $allowedDuringPasswordChange, true)) {
            $this->unauthorized('Bạn phải đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.', 403, [
                'code' => 'PASSWORD_CHANGE_REQUIRED',
            ]);
            return false;
        }

        return true;
    }

    public static function user(): ?array
    {
        return self::$user;
    }

    public static function token(): ?string
    {
        return self::$token;
    }

    private function bearerToken(): ?string
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authorization = $headers['Authorization']
            ?? $headers['authorization']
            ?? $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? null;

        if (! is_string($authorization) || ! preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
            return null;
        }

        return trim($matches[1]);
    }

    private function unauthorized(string $message, int $statusCode, array $extra = []): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array_merge([
            'success' => false,
            'message' => $message,
        ], $extra), JSON_UNESCAPED_UNICODE);
    }
}
