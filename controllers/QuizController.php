<?php

class QuizController extends Controller
{
    private Assignment $assignment;
    private AssignmentSubmission $submission;
    private AssignmentQuizQuestion $quizQuestion;

    public function __construct()
    {
        $this->assignment = new Assignment();
        $this->submission = new AssignmentSubmission();
        $this->quizQuestion = new AssignmentQuizQuestion();
    }

    public function show(string|int $assignmentId): void
    {
        $studentId = $this->currentUserId();
        $assignment = $this->assignment->findForStudent((int) $assignmentId, $studentId);

        if ($assignment === null) {
            $this->forbidden();
            return;
        }

        $this->ensureQuestionsFromAttachment($assignment);
        $questions = $this->quizQuestion->getForAssignment((int) $assignmentId);
        $submission = $this->submission->findByAssignmentForStudent((int) $assignmentId, $studentId);

        $this->json([
            'success' => true,
            'message' => $questions === [] ? 'Quiz này chưa có câu hỏi.' : 'Lấy quiz thành công.',
            'data' => [
                'assignment' => $assignment,
                'questions' => $questions,
                'submission' => $this->normalizeSubmission($submission),
                'passing_score' => 70,
            ],
        ]);
    }

    public function submit(string|int $assignmentId): void
    {
        $studentId = $this->currentUserId();
        $assignment = $this->assignment->findForStudent((int) $assignmentId, $studentId);

        if ($assignment === null) {
            $this->forbidden();
            return;
        }

        if (($assignment['status'] ?? '') === 'closed') {
            $this->json([
                'success' => false,
                'message' => 'Quiz đã đóng, không thể nộp bài.',
                'errors' => ['assignment' => 'Quiz đã đóng.'],
            ], 422);
            return;
        }

        $this->ensureQuestionsFromAttachment($assignment);
        $questions = $this->quizQuestion->getForAssignment((int) $assignmentId, true);
        if ($questions === []) {
            $this->json([
                'success' => false,
                'message' => 'Quiz này chưa có câu hỏi. Vui lòng báo giảng viên/admin nhập file CSV.',
                'errors' => ['quiz' => 'Quiz chưa có câu hỏi.'],
            ], 422);
            return;
        }

        $input = $this->input();
        $answers = $input['answers'] ?? [];
        if (! is_array($answers)) {
            $this->json([
                'success' => false,
                'message' => 'Dữ liệu đáp án không hợp lệ.',
                'errors' => ['answers' => 'Đáp án phải là một object/array.'],
            ], 422);
            return;
        }

        $errors = $this->validateAnswers($questions, $answers);
        if ($errors !== []) {
            $this->json([
                'success' => false,
                'message' => 'Bạn cần trả lời đầy đủ câu hỏi bắt buộc.',
                'errors' => $errors,
            ], 422);
            return;
        }

        $result = $this->quizQuestion->grade((int) $assignmentId, $answers);
        $feedback = $result['passed']
            ? 'Quiz đạt yêu cầu. Bài học đã được xác nhận hoàn thành.'
            : 'Quiz chưa đạt yêu cầu. Bạn cần đạt tối thiểu 70% phần trắc nghiệm.';
        $payload = [
            'type' => 'lesson_quiz',
            'answers' => $answers,
            'score' => $result['score'],
            'passed' => $result['passed'],
            'details' => $result['details'],
        ];

        $submissionId = $this->submission->upsertQuizResult(
            (int) $assignmentId,
            $studentId,
            $payload,
            (float) $result['score'],
            $feedback
        );

        $progress = $result['passed']
            ? $this->completeRoadmapItems((int) $assignmentId, $studentId)
            : ['roadmap_items' => 0, 'lessons' => 0, 'roadmaps' => []];

        $this->json([
            'success' => true,
            'message' => $feedback,
            'data' => [
                'submission' => $this->submission->findForStudent($submissionId, $studentId),
                'result' => $result,
                'progress' => $progress,
            ],
        ]);
    }

    private function validateAnswers(array $questions, array $answers): array
    {
        $errors = [];

        foreach ($questions as $question) {
            $questionId = (int) $question['id'];
            $answer = trim((string) ($answers[$questionId] ?? $answers[(string) $questionId] ?? ''));
            if ($answer === '') {
                $errors["answers.{$questionId}"] = 'Câu hỏi này chưa có câu trả lời.';
            }
        }

        return $errors;
    }

    private function ensureQuestionsFromAttachment(array $assignment): void
    {
        $assignmentId = (int) ($assignment['id'] ?? 0);
        if ($assignmentId <= 0 || $this->quizQuestion->countForAssignment($assignmentId) > 0) {
            return;
        }

        $path = $this->attachmentToLocalPath((string) ($assignment['attachment_path'] ?? ''));
        if ($path === null || strtolower(pathinfo($path, PATHINFO_EXTENSION)) !== 'csv') {
            return;
        }

        try {
            $this->quizQuestion->importCsv($assignmentId, $path);
        } catch (Throwable $exception) {
            error_log($exception);
        }
    }

    private function attachmentToLocalPath(string $attachmentPath): ?string
    {
        $attachmentPath = trim($attachmentPath);
        if ($attachmentPath === '') {
            return null;
        }

        $path = parse_url($attachmentPath, PHP_URL_PATH) ?: $attachmentPath;
        $base = base_url_path();
        if ($base !== '' && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base)) ?: '/';
        }

        $path = '/' . ltrim($path, '/');
        $candidates = [];
        if (str_starts_with($path, '/public/')) {
            $candidates[] = BASE_PATH . $path;
        }
        if (str_starts_with($path, '/uploads/')) {
            $candidates[] = BASE_PATH . '/public' . $path;
        }

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_readable($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function normalizeSubmission(?array $submission): ?array
    {
        if ($submission === null) {
            return null;
        }

        $content = json_decode((string) ($submission['content'] ?? ''), true);
        if (is_array($content)) {
            $submission['quiz_payload'] = $content;
        }

        return $submission;
    }

    private function completeRoadmapItems(int $assignmentId, int $studentId): array
    {
        $db = Database::connection();
        $statement = $db->prepare(
            'SELECT i.id, i.roadmap_id, i.lesson_id
             FROM learning_roadmap_items i
             INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
             WHERE i.assignment_id = :assignment_id
               AND r.user_id = :student_id
               AND r.deleted_at IS NULL'
        );
        $statement->execute([
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
        ]);
        $items = $statement->fetchAll(PDO::FETCH_ASSOC);

        if ($items === []) {
            return ['roadmap_items' => 0, 'lessons' => 0, 'roadmaps' => []];
        }

        $updateItem = $db->prepare(
            'UPDATE learning_roadmap_items
             SET status = "completed",
                 completion_percent = 100,
                 actual_study_minutes = COALESCE(actual_study_minutes, duration_minutes),
                 updated_at = NOW()
             WHERE id = :id'
        );
        $upsertProgress = $db->prepare(
            'INSERT INTO lesson_progress (lesson_id, student_id, status, completed_at)
             VALUES (:lesson_id, :student_id, "completed", NOW())
             ON DUPLICATE KEY UPDATE status = "completed", completed_at = NOW(), updated_at = NOW()'
        );

        $roadmapIds = [];
        $lessonIds = [];
        foreach ($items as $item) {
            $updateItem->execute(['id' => (int) $item['id']]);
            $roadmapIds[(int) $item['roadmap_id']] = true;

            if (! empty($item['lesson_id'])) {
                $lessonId = (int) $item['lesson_id'];
                $lessonIds[$lessonId] = true;
                $upsertProgress->execute([
                    'lesson_id' => $lessonId,
                    'student_id' => $studentId,
                ]);
            }
        }

        $roadmapModel = new LearningRoadmap();
        foreach (array_keys($roadmapIds) as $roadmapId) {
            $roadmapModel->recalculateProgress((int) $roadmapId);
        }

        return [
            'roadmap_items' => count($items),
            'lessons' => count($lessonIds),
            'roadmaps' => array_map('intval', array_keys($roadmapIds)),
        ];
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }

    private function forbidden(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Bạn không có quyền truy cập quiz này.',
            'errors' => [],
        ], 403);
    }
}
