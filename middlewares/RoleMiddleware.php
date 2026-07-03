<?php

class RoleMiddleware
{
    public function handle(string|array ...$allowedRoles): bool
    {
        $user = AuthMiddleware::user();
        $role = strtolower((string) ($user['role'] ?? ''));
        $roles = $this->normalizeRoles($allowedRoles);

        if ($roles === [] || in_array($role, $roles, true)) {
            return true;
        }

        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Bạn không có quyền truy cập chức năng này.',
        ], JSON_UNESCAPED_UNICODE);

        return false;
    }

    private function normalizeRoles(array $allowedRoles): array
    {
        if (count($allowedRoles) === 1 && is_array($allowedRoles[0])) {
            $allowedRoles = $allowedRoles[0];
        }

        return array_map(
            static fn (string $role): string => strtolower($role),
            array_filter($allowedRoles, 'is_string')
        );
    }
}
