<?php

$router->get('/api/notifications', [NotificationController::class, 'index'], $auth);
$router->get('/api/notifications/unread-count', [NotificationController::class, 'unreadCount'], $auth);
$router->post('/api/notifications/read', [NotificationController::class, 'markRead'], $auth);
$router->post('/api/notifications/read-all', [NotificationController::class, 'markAllRead'], $auth);
