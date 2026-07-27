<?php

$router->get('/api/admin/assignments', [AssignmentController::class, 'index'], $admin);
$router->get('/api/admin/assignments/{id}', [AssignmentController::class, 'show'], $admin);
$router->post('/api/admin/assignments', [AssignmentController::class, 'store'], $admin);
$router->put('/api/admin/assignments/{id}', [AssignmentController::class, 'update'], $admin);
$router->post('/api/admin/assignments/{id}', [AssignmentController::class, 'update'], $admin);
$router->delete('/api/admin/assignments/{id}', [AssignmentController::class, 'destroy'], $admin);

$router->get('/api/student/assignments', [AssignmentController::class, 'studentIndex'], $student);
$router->get('/api/student/assignments/{id}', [AssignmentController::class, 'studentShow'], $student);
