<?php

$router->get('/api/admin/reports/students/export', [ReportController::class, 'studentsExport'], $admin);
$router->get('/api/admin/reports/subjects/export', [ReportController::class, 'subjectsExport'], $admin);
$router->get('/api/admin/reports/student-subjects/export', [ReportController::class, 'studentSubjectsExport'], $admin);
$router->get('/api/admin/reports/assignments/export', [ReportController::class, 'assignmentsExport'], $admin);
$router->get('/api/admin/reports/submissions/export', [ReportController::class, 'submissionsExport'], $admin);
$router->get('/api/admin/reports/grades/export', [ReportController::class, 'gradesExport'], $admin);
$router->get('/api/admin/reports/progress/export', [ReportController::class, 'progressExport'], $admin);
