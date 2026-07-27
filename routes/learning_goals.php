<?php

$router->get('/api/student/learning-goals', [LearningGoalController::class, 'index'], $student);
$router->get('/api/student/learning-goals/{id}', [LearningGoalController::class, 'show'], $student);
$router->post('/api/student/learning-goals', [LearningGoalController::class, 'store'], $student);
$router->put('/api/student/learning-goals/{id}', [LearningGoalController::class, 'update'], $student);
$router->delete('/api/student/learning-goals/{id}', [LearningGoalController::class, 'destroy'], $student);
