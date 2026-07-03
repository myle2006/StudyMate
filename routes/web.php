<?php

$router->get('/', [HomeController::class, 'index']);
$router->get('/login', [HomeController::class, 'login']);
$router->get('/register', [HomeController::class, 'register']);
$router->get('/dashboard', [HomeController::class, 'dashboard']);
$router->get('/student/dashboard', [HomeController::class, 'dashboard']);
$router->get('/admin', [HomeController::class, 'admin']);
$router->get('/admin/dashboard', [HomeController::class, 'admin']);
$router->get('/admin/users', [HomeController::class, 'admin']);
$router->get('/admin/students', [HomeController::class, 'admin']);
$router->get('/admin/students/create', [HomeController::class, 'admin']);
$router->get('/admin/students/import', [HomeController::class, 'admin']);
$router->get('/admin/students/{id}', [HomeController::class, 'admin']);
$router->get('/admin/students/{id}/edit', [HomeController::class, 'admin']);
$router->get('/admin/lessons', [HomeController::class, 'admin']);
$router->get('/admin/quizzes', [HomeController::class, 'admin']);
$router->get('/admin/statistics', [HomeController::class, 'admin']);
$router->get('/subjects', [HomeController::class, 'subjects']);
$router->get('/subjects/create', [HomeController::class, 'subjects']);
$router->get('/subjects/{id}', [HomeController::class, 'subjects']);
$router->get('/subjects/{id}/edit', [HomeController::class, 'subjects']);
$router->get('/roadmap', [HomeController::class, 'dashboard']);
$router->get('/tasks', [HomeController::class, 'dashboard']);
$router->get('/notes', [HomeController::class, 'dashboard']);
$router->get('/assistant', [HomeController::class, 'dashboard']);
$router->get('/progress', [HomeController::class, 'dashboard']);
