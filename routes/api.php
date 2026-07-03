<?php

$auth = [AuthMiddleware::class];
$admin = [AuthMiddleware::class, [RoleMiddleware::class, 'admin']];
$student = [AuthMiddleware::class, [RoleMiddleware::class, 'student']];

$router->post('/api/register', [AuthController::class, 'register']);
$router->post('/api/login', [AuthController::class, 'login']);
$router->get('/api/me', [AuthController::class, 'me'], $auth);
$router->post('/api/logout', [AuthController::class, 'logout'], $auth);
$router->get('/api/admin/dashboard', [AuthController::class, 'adminDashboard'], $admin);
$router->get('/api/student/dashboard', [AuthController::class, 'studentDashboard'], $student);

$router->get('/api/admin/students/import/template', [StudentController::class, 'downloadTemplate'], $admin);
$router->post('/api/admin/students/import', [StudentController::class, 'import'], $admin);
$router->get('/api/admin/students', [StudentController::class, 'index'], $admin);
$router->get('/api/admin/students/{id}', [StudentController::class, 'show'], $admin);
$router->post('/api/admin/students', [StudentController::class, 'store'], $admin);
$router->put('/api/admin/students/{id}', [StudentController::class, 'update'], $admin);
$router->delete('/api/admin/students/{id}', [StudentController::class, 'destroy'], $admin);
$router->put('/api/admin/students/{id}/disable', [StudentController::class, 'disable'], $admin);
$router->put('/api/admin/students/{id}/enable', [StudentController::class, 'enable'], $admin);
$router->put('/api/admin/students/{id}/lock', [StudentController::class, 'lock'], $admin);
$router->put('/api/admin/students/{id}/reset-password', [StudentController::class, 'resetPassword'], $admin);

$router->get('/api/subjects', [SubjectController::class, 'index'], $auth);
$router->get('/api/subjects/{id}', [SubjectController::class, 'show'], $auth);
$router->post('/api/subjects', [SubjectController::class, 'store'], $auth);
$router->post('/api/subjects/{id}', [SubjectController::class, 'update'], $auth);
$router->put('/api/subjects/{id}', [SubjectController::class, 'update'], $auth);
$router->delete('/api/subjects/{id}', [SubjectController::class, 'destroy'], $auth);
