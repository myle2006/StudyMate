<?php

return [
    'name' => 'StudyMate AI',
    'timezone' => 'Asia/Bangkok',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'studymate_change_this_secret_key_on_hosting',
    'jwt_ttl' => (int) (getenv('JWT_TTL') ?: 86400),
];
