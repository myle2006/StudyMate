<?php

function app_config(?string $key = null, mixed $default = null): mixed
{
    static $config = null;

    if ($config === null) {
        $config = require BASE_PATH . '/config/app.php';
    }

    return $key === null ? $config : ($config[$key] ?? $default);
}

function allowed_cors_origins(): array
{
    $configured = app_config('allowed_origins', getenv('APP_ALLOWED_ORIGINS') ?: '');
    if (is_string($configured)) {
        $configured = preg_split('/[\s,]+/', $configured) ?: [];
    }

    $origins = is_array($configured) ? $configured : [];
    $origins = array_values(array_filter(array_map('trim', $origins)));

    if ($origins === []) {
        $origins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost',
            'http://127.0.0.1',
        ];
    }

    return $origins;
}

function emit_cors_headers(): void
{
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    $allowedOrigins = allowed_cors_origins();

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}

function base_url_path(): string
{
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));

    return $scriptDir === '/' ? '' : rtrim($scriptDir, '/');
}

function public_url_path(): string
{
    $base = base_url_path();
    $entryFile = realpath($_SERVER['SCRIPT_FILENAME'] ?? '');
    $publicEntry = realpath(BASE_PATH . '/public/index.php');

    if ($entryFile && $publicEntry && $entryFile === $publicEntry) {
        return $base;
    }

    return $base . '/public';
}

function url(string $path = ''): string
{
    $path = '/' . ltrim($path, '/');

    return base_url_path() . ($path === '/' ? '/' : $path);
}

function asset(string $path): string
{
    return public_url_path() . '/assets/' . ltrim($path, '/');
}

function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}
