<?php

class AssignmentSubmissionController extends Controller
{
    private Assignment $assignment;
    private AssignmentSubmission $submission;

    public function __construct()
    {
        $this->assignment = new Assignment();
        $this->submission = new AssignmentSubmission();
    }

    public function adminAssignmentSubmissions(string|int $assignmentId): void
    {
        $assignment = $this->assignment->findById((int) $assignmentId);

        if ($assignment === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bài tập.',
                'errors' => [],
            ], 404);
            return;
        }

        $submissions = $this->submission->getForAssignmentAdmin((int) $assignmentId, [
            'status' => trim((string) ($_GET['status'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách bài nộp theo bài tập thành công.',
            'data' => $submissions,
        ]);
    }

    public function adminShow(string|int $id): void
    {
        $submission = $this->submission->findForAdmin((int) $id);

        if ($submission === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bài nộp.',
                'errors' => [],
            ], 404);
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài nộp thành công.',
            'data' => $submission,
        ]);
    }

    public function adminGrade(string|int $id): void
    {
        $submissionId = (int) $id;
        $submission = $this->submission->findForAdmin($submissionId);

        if ($submission === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bài nộp.',
                'errors' => [],
            ], 404);
            return;
        }

        $data = $this->input();
        $errors = AssignmentSubmissionValidation::validateGrade($data);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $currentUser = $this->currentUser();
        $this->submission->grade(
            $submissionId,
            (float) $data['score'],
            trim((string) ($data['feedback'] ?? '')),
            (int) ($currentUser['id'] ?? 0)
        );

        $this->json([
            'success' => true,
            'message' => 'Lưu điểm và feedback thành công.',
            'data' => $this->submission->findForAdmin($submissionId),
        ]);
    }

    public function index(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách bài nộp thành công.',
            'data' => $this->submission->getAllForStudent($this->currentUserId()),
        ]);
    }

    public function grades(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách điểm và feedback thành công.',
            'data' => $this->submission->getGradesForStudent($this->currentUserId()),
        ]);
    }

    public function gradeShow(string|int $id): void
    {
        $submission = $this->submission->findGradeForStudent((int) $id, $this->currentUserId());

        if ($submission === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy điểm hoặc bạn không có quyền truy cập.',
                'errors' => [],
            ], 404);
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết điểm và feedback thành công.',
            'data' => $submission,
        ]);
    }

    public function showForAssignment(string|int $assignmentId): void
    {
        $assignment = $this->assignment->findForStudent((int) $assignmentId, $this->currentUserId());

        if ($assignment === null) {
            $this->forbidden();
            return;
        }

        $submission = $this->submission->findByAssignmentForStudent((int) $assignmentId, $this->currentUserId());

        $this->json([
            'success' => true,
            'message' => $submission ? 'Lấy bài nộp thành công.' : 'Bạn chưa nộp bài tập này.',
            'data' => $submission,
        ]);
    }

    public function show(string|int $id): void
    {
        $submission = $this->submission->findForStudent((int) $id, $this->currentUserId());

        if ($submission === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bài nộp hoặc bạn không có quyền truy cập.',
                'errors' => [],
            ], 404);
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài nộp thành công.',
            'data' => $submission,
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

        $existingSubmission = $this->submission->findByAssignmentForStudent((int) $assignmentId, $studentId);
        if (! $this->canSubmit($assignment, $existingSubmission)) {
            return;
        }

        $data = $this->normalizeData($this->requestData(), $existingSubmission);
        $file = $this->uploadedSubmissionFile();
        $errors = AssignmentSubmissionValidation::validate($data, $file, ! empty($existingSubmission['file_path'] ?? null));

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($file !== null) {
            $data['file_path'] = $this->storeSubmissionFile($file);
        }

        $data['assignment_id'] = (int) $assignmentId;
        $data['student_id'] = $studentId;
        $data['status'] = $this->submissionStatus($assignment);

        if ($existingSubmission) {
            $this->submission->update((int) $existingSubmission['id'], $studentId, $data);
            $submissionId = (int) $existingSubmission['id'];
            $message = 'Cập nhật bài nộp thành công.';
        } else {
            $submissionId = $this->submission->create($data);
            $message = $data['status'] === 'late' ? 'Nộp bài trễ thành công.' : 'Nộp bài thành công.';
        }

        $this->json([
            'success' => true,
            'message' => $message,
            'data' => $this->submission->findForStudent($submissionId, $studentId),
        ], $existingSubmission ? 200 : 201);
    }

    public function update(string|int $id): void
    {
        $studentId = $this->currentUserId();
        $existingSubmission = $this->submission->findForStudent((int) $id, $studentId);

        if ($existingSubmission === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bài nộp hoặc bạn không có quyền cập nhật.',
                'errors' => [],
            ], 404);
            return;
        }

        $assignment = $this->assignment->findForStudent((int) $existingSubmission['assignment_id'], $studentId);
        if ($assignment === null) {
            $this->forbidden();
            return;
        }

        if (! $this->canSubmit($assignment, $existingSubmission)) {
            return;
        }

        $data = $this->normalizeData($this->requestData(), $existingSubmission);
        $file = $this->uploadedSubmissionFile();
        $errors = AssignmentSubmissionValidation::validate($data, $file, ! empty($existingSubmission['file_path'] ?? null));

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($file !== null) {
            $data['file_path'] = $this->storeSubmissionFile($file);
        }

        $data['status'] = $this->submissionStatus($assignment);
        $this->submission->update((int) $id, $studentId, $data);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật bài nộp thành công.',
            'data' => $this->submission->findForStudent((int) $id, $studentId),
        ]);
    }

    private function canSubmit(array $assignment, ?array $existingSubmission): bool
    {
        if ($assignment['status'] === 'closed') {
            $this->json([
                'success' => false,
                'message' => 'Assignment đã đóng, không thể nộp bài.',
                'errors' => ['assignment' => 'Bài tập đã đóng.'],
            ], 422);
            return false;
        }

        if (($existingSubmission['status'] ?? '') === 'graded') {
            $this->json([
                'success' => false,
                'message' => 'Bài nộp đã được chấm, không thể cập nhật.',
                'errors' => ['submission' => 'Bài nộp đã được chấm.'],
            ], 422);
            return false;
        }

        if ($existingSubmission !== null && $this->isPastDeadline($assignment['deadline'])) {
            $this->json([
                'success' => false,
                'message' => 'Bạn chỉ có thể cập nhật bài nộp trước deadline.',
                'errors' => ['deadline' => 'Deadline đã qua.'],
            ], 422);
            return false;
        }

        return true;
    }

    private function normalizeData(array $input, ?array $current = null): array
    {
        return [
            'content' => trim((string) ($input['content'] ?? $current['content'] ?? '')),
        ];
    }

    private function requestData(): array
    {
        $data = $_POST;

        if ($data === []) {
            $data = $this->input();
        }

        unset($data['_method']);

        return is_array($data) ? $data : [];
    }

    private function uploadedSubmissionFile(): ?array
    {
        $file = $_FILES['file'] ?? $_FILES['submission_file'] ?? null;

        if (! is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        return $file;
    }

    private function storeSubmissionFile(array $file): string
    {
        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $uploadDir = BASE_PATH . '/public/uploads/submissions';

        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = 'submission_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $targetPath = $uploadDir . '/' . $fileName;

        if (! move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
            throw new RuntimeException('Không thể lưu file bài nộp.');
        }

        return public_url_path() . '/uploads/submissions/' . $fileName;
    }

    private function submissionStatus(array $assignment): string
    {
        return $this->isPastDeadline($assignment['deadline']) ? 'late' : 'submitted';
    }

    private function isPastDeadline(string $deadline): bool
    {
        return strtotime($deadline) < time();
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
            'message' => 'Bạn không có quyền truy cập bài tập này.',
            'errors' => [],
        ], 403);
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
