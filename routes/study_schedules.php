<?php

$router->get('/api/study-schedules', [StudyScheduleController::class, 'index'], $student);
$router->get('/api/study-schedules/{id}', [StudyScheduleController::class, 'show'], $student);
$router->post('/api/study-schedules', [StudyScheduleController::class, 'store'], $student);
$router->put('/api/study-schedules/{id}', [StudyScheduleController::class, 'update'], $student);
$router->delete('/api/study-schedules/{id}', [StudyScheduleController::class, 'destroy'], $student);
