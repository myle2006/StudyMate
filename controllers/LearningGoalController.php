<?php

class LearningGoalController extends Controller
{
    private LearningGoal $learningGoal;

    public function __construct()
    {
        $this->learningGoal = new LearningGoal();
    }

    public function index(): void
    {
        $goals = $this->learningGoal->getForStudent($this->currentUserId(), [
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách mục tiêu học tập thành công.',
            'data' => $goals,
        ]);
    }

    public function show(string|int $id): void
    {
        $goal = $this->learningGoal->findForStudent((int) $id, $this->currentUserId());

        if ($goal === null) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết mục tiêu học tập thành công.',
            'data' => $goal,
        ]);
    }

    public function store(): void
    {
        $studentId = $this->currentUserId();
        $data = $this->normalizeData($this->input());
        $data['user_id'] = $studentId;

        $errors = $this->validateData($data, $studentId);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $goalId = $this->learningGoal->create($data);

        $this->json([
            'success' => true,
            'message' => 'Tạo mục tiêu học tập thành công.',
            'data' => $this->learningGoal->findForStudent($goalId, $studentId),
        ], 201);
    }

    public function update(string|int $id): void
    {
        $studentId = $this->currentUserId();
        $goalId = (int) $id;
        $goal = $this->learningGoal->findForStudent($goalId, $studentId);

        if ($goal === null) {
            $this->notFound();
            return;
        }

        $data = $this->normalizeData($this->input(), $goal);
        $data['user_id'] = $studentId;

        $errors = $this->validateData($data, $studentId);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $this->learningGoal->update($goalId, $studentId, $data);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật mục tiêu học tập thành công.',
            'data' => $this->learningGoal->findForStudent($goalId, $studentId),
        ]);
    }

    public function destroy(string|int $id): void
    {
        if (! $this->learningGoal->delete((int) $id, $this->currentUserId())) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Xóa mục tiêu học tập thành công.',
        ]);
    }

    private function normalizeData(array $input, ?array $current = null): array
    {
        return [
            'subject_id' => trim((string) ($input['subject_id'] ?? $current['subject_id'] ?? '')),
            'title' => trim((string) ($input['title'] ?? $current['title'] ?? '')),
            'goal_description' => trim((string) ($input['goal_description'] ?? $current['goal_description'] ?? '')),
            'current_level' => trim((string) ($input['current_level'] ?? $current['current_level'] ?? 'beginner')),
            'study_time_per_day' => trim((string) ($input['study_time_per_day'] ?? $current['study_time_per_day'] ?? '')),
            'start_date' => trim((string) ($input['start_date'] ?? $current['start_date'] ?? '')),
            'end_date' => trim((string) ($input['end_date'] ?? $current['end_date'] ?? '')),
            'status' => trim((string) ($input['status'] ?? $current['status'] ?? 'active')),
        ];
    }

    private function validateData(array &$data, int $studentId): array
    {
        $errors = LearningGoalValidation::validate($data);

        if (! isset($errors['subject_id']) && ! $this->learningGoal->subjectAssignedToStudent((int) $data['subject_id'], $studentId)) {
            $errors['subject_id'] = 'Môn học không tồn tại hoặc bạn chưa được gán vào môn học này.';
        }

        if (! isset($errors['start_date'])) {
            $data['start_date'] = LearningGoalValidation::normalizeDate($data['start_date']);
        }

        if (! isset($errors['end_date'])) {
            $data['end_date'] = LearningGoalValidation::normalizeDate($data['end_date']);
        }

        return $errors;
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }

    private function notFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy mục tiêu học tập hoặc bạn không có quyền truy cập.',
            'errors' => [],
        ], 404);
    }

    private function validationFailed(array $errors): void
    {
        $this->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $errors,
        ], 422);
    }
}
