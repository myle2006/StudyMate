<?php

function app_config(?string $key = null, mixed $default = null): mixed
{
    static $config = null;

    if ($config === null) {
        $config = require BASE_PATH . '/config/app.php';
    }

    return $key === null ? $config : ($config[$key] ?? $default);
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
