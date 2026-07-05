<?php

if (file_exists(__DIR__ . '/app.local.php')) {
    return array_merge([
        'name' => 'StudyMate AI',
        'timezone' => 'Asia/Bangkok',
        'jwt_secret' => getenv('JWT_SECRET') ?: 'studymate_change_this_secret_key_on_hosting',
        'jwt_ttl' => (int) (getenv('JWT_TTL') ?: 86400),
    ], require __DIR__ . '/app.local.php');
}

return [
    'name' => 'StudyMate AI',
    'timezone' => 'Asia/Bangkok',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'studymate_change_this_secret_key_on_hosting',
    'jwt_ttl' => (int) (getenv('JWT_TTL') ?: 86400),
];
