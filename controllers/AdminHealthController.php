<?php

class AdminHealthController extends Controller
{
    public function index(): void
    {
        $checks = [
            ...$this->tableChecks(),
            ...$this->uploadChecks(),
        ];

        $failed = array_values(array_filter($checks, static fn (array $check): bool => ($check['status'] ?? '') !== 'ok'));

        $this->json([
            'success' => true,
            'message' => $failed === [] ? 'Hệ thống sẵn sàng.' : 'Có hạng mục hệ thống cần kiểm tra.',
            'data' => [
                'status' => $failed === [] ? 'ok' : 'warning',
                'checks' => $checks,
                'failed_count' => count($failed),
                'generated_at' => date(DATE_ATOM),
            ],
        ]);
    }

    private function tableChecks(): array
    {
        $requirements = [
            'subject_classes' => ['id', 'subject_id', 'class_code', 'deleted_at'],
            'student_subjects' => ['student_id', 'subject_id', 'class_id', 'status'],
            'assignments' => ['id', 'subject_id', 'class_id', 'deadline', 'deleted_at'],
            'assignment_quiz_questions' => ['assignment_id', 'question_text', 'correct_answer'],
            'assignment_submissions' => ['assignment_id', 'student_id', 'score'],
            'learning_roadmaps' => ['id', 'user_id', 'subject_id', 'deleted_at'],
            'learning_roadmap_items' => ['roadmap_id', 'lesson_id', 'assignment_id', 'status'],
            'lesson_dependencies' => ['lesson_id', 'prerequisite_lesson_id'],
            'quiz_security_events' => ['assignment_id', 'student_id', 'event_type'],
            'study_schedules' => ['user_id', 'subject_id', 'study_date', 'deleted_at'],
        ];

        $db = Database::connection();
        $checks = [];
        foreach ($requirements as $table => $columns) {
            try {
                $exists = $db->query('SHOW TABLES LIKE ' . $db->quote($table))->fetchColumn() !== false;
                if (! $exists) {
                    $checks[] = [
                        'key' => "table:{$table}",
                        'label' => "Bảng {$table}",
                        'status' => 'error',
                        'message' => 'Thiếu bảng. Cần chạy migration/import database.',
                    ];
                    continue;
                }

                $missingColumns = [];
                foreach ($columns as $column) {
                    $statement = $db->prepare("SHOW COLUMNS FROM {$table} LIKE :column_name");
                    $statement->execute(['column_name' => $column]);
                    if (! $statement->fetch()) {
                        $missingColumns[] = $column;
                    }
                }

                $checks[] = [
                    'key' => "table:{$table}",
                    'label' => "Bảng {$table}",
                    'status' => $missingColumns === [] ? 'ok' : 'error',
                    'message' => $missingColumns === []
                        ? 'Đủ bảng/cột quan trọng.'
                        : 'Thiếu cột: ' . implode(', ', $missingColumns),
                ];
            } catch (Throwable $exception) {
                $checks[] = [
                    'key' => "table:{$table}",
                    'label' => "Bảng {$table}",
                    'status' => 'error',
                    'message' => 'Không thể kiểm tra: ' . $exception->getMessage(),
                ];
            }
        }

        return $checks;
    }

    private function uploadChecks(): array
    {
        $paths = [
            'Assignment uploads' => BASE_PATH . '/storage/uploads/assignments',
            'Submission uploads' => BASE_PATH . '/storage/uploads/submissions',
            'Lesson materials' => BASE_PATH . '/storage/uploads/lessons',
        ];

        $checks = [];
        foreach ($paths as $label => $path) {
            if (! is_dir($path)) {
                @mkdir($path, 0755, true);
            }

            $checks[] = [
                'key' => 'path:' . $path,
                'label' => $label,
                'status' => is_dir($path) && is_writable($path) ? 'ok' : 'error',
                'message' => is_dir($path) && is_writable($path)
                    ? 'Có thể ghi file.'
                    : "Không thể ghi vào {$path}.",
            ];
        }

        return $checks;
    }
}
