<?php

$router->get('/api/admin/lessons', [LessonController::class, 'adminIndex'], $admin);
$router->get('/api/admin/lessons/{id}', [LessonController::class, 'adminShow'], $admin);
$router->post('/api/admin/lessons', [LessonController::class, 'store'], $admin);
$router->put('/api/admin/lessons/{id}', [LessonController::class, 'update'], $admin);
$router->post('/api/admin/lessons/{id}', [LessonController::class, 'update'], $admin);
$router->delete('/api/admin/lessons/{id}', [LessonController::class, 'destroy'], $admin);

$router->get('/api/student/lessons', [LessonController::class, 'studentIndex'], $student);
$router->get('/api/student/lessons/{id}', [LessonController::class, 'studentShow'], $student);
$router->put('/api/student/lessons/{id}/complete', [LessonController::class, 'markCompleted'], $student);
