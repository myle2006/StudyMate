<?php

$router->post('/api/student/roadmaps/generate-ai', [LearningRoadmapController::class, 'generateAi'], $student);
$router->post('/api/student/roadmaps', [LearningRoadmapController::class, 'store'], $student);
$router->get('/api/student/roadmaps', [LearningRoadmapController::class, 'index'], $student);
$router->get('/api/student/roadmaps/ai-status', [LearningRoadmapController::class, 'aiStatus'], $student);
$router->get('/api/student/roadmaps/{id}', [LearningRoadmapController::class, 'show'], $student);
$router->get('/api/student/roadmaps/{id}/progress', [LearningRoadmapController::class, 'progress'], $student);
$router->put('/api/student/roadmaps/{id}', [LearningRoadmapController::class, 'update'], $student);
$router->delete('/api/student/roadmaps/{id}', [LearningRoadmapController::class, 'destroy'], $student);
$router->put('/api/student/roadmap-items/{id}/status', [LearningRoadmapController::class, 'updateItemStatus'], $student);
$router->put('/api/student/roadmap-items/{id}/result', [LearningRoadmapController::class, 'updateItemResult'], $student);
$router->put('/api/student/roadmap-items/{id}/schedule', [LearningRoadmapController::class, 'rescheduleItem'], $student);
