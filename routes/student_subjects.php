<?php

$router->get('/api/student/my-subjects', [StudentSubjectController::class, 'mySubjects'], $student);
$router->get('/api/student/my-subjects/{subjectId}', [StudentSubjectController::class, 'mySubjectDetail'], $student);

$router->get('/api/admin/subjects/{subjectId}/students', [StudentSubjectController::class, 'index'], $admin);
$router->get('/api/admin/subjects/{subjectId}/available-students', [StudentSubjectController::class, 'availableStudents'], $admin);
$router->post('/api/admin/subjects/{subjectId}/students', [StudentSubjectController::class, 'store'], $admin);
$router->delete('/api/admin/subjects/{subjectId}/students/{studentId}', [StudentSubjectController::class, 'destroy'], $admin);
