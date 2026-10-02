<?php

$defaultJwtSecret = hash('sha256', __DIR__ . '|' . php_uname('n') . '|' . php_uname('m'));

$config = [
    'name' => 'StudyMate AI',
    'timezone' => 'Asia/Bangkok',
    'jwt_secret' => getenv('JWT_SECRET') ?: $defaultJwtSecret,
    'jwt_ttl' => (int) (getenv('JWT_TTL') ?: 86400),
    'debug' => filter_var(getenv('APP_DEBUG') ?: false, FILTER_VALIDATE_BOOLEAN),
    'allowed_origins' => preg_split('/[\s,]+/', getenv('APP_ALLOWED_ORIGINS') ?: '') ?: [],
    'security_warnings' => getenv('JWT_SECRET') ? [] : ['JWT_SECRET is not configured; using a local development secret.'],
];

if (file_exists(__DIR__ . '/app.local.php')) {
    return array_merge($config, require __DIR__ . '/app.local.php');
}

return $config;
