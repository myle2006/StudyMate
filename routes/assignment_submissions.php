<?php

$router->get('/api/admin/assignments/{assignmentId}/submissions', [AssignmentSubmissionController::class, 'adminAssignmentSubmissions'], $admin);
$router->get('/api/admin/submissions/{id}', [AssignmentSubmissionController::class, 'adminShow'], $admin);
$router->put('/api/admin/submissions/{id}/grade', [AssignmentSubmissionController::class, 'adminGrade'], $admin);

$router->get('/api/student/grades', [AssignmentSubmissionController::class, 'grades'], $student);
$router->get('/api/student/submissions/{id}/grade', [AssignmentSubmissionController::class, 'gradeShow'], $student);
$router->get('/api/student/submissions', [AssignmentSubmissionController::class, 'index'], $student);
$router->get('/api/student/submissions/{id}', [AssignmentSubmissionController::class, 'show'], $student);
$router->get('/api/student/assignments/{assignmentId}/submission', [AssignmentSubmissionController::class, 'showForAssignment'], $student);
$router->post('/api/student/assignments/{assignmentId}/submit', [AssignmentSubmissionController::class, 'submit'], $student);
$router->put('/api/student/submissions/{id}', [AssignmentSubmissionController::class, 'update'], $student);
$router->post('/api/student/submissions/{id}', [AssignmentSubmissionController::class, 'update'], $student);
