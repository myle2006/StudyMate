<?php

class AssignmentController extends Controller
{
    private Assignment $assignment;
    private SubjectClass $subjectClass;

    public function __construct()
    {
        $this->assignment = new Assignment();
        $this->subjectClass = new SubjectClass();
    }

    public function index(): void
    {
        $assignments = $this->assignment->getAll([
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
            'subject_id' => trim((string) ($_GET['subject_id'] ?? '')),
            'class_id' => trim((string) ($_GET['class_id'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách bài tập thành công.',
            'data' => $assignments,
        ]);
    }

    public function show(string|int $id): void
    {
        $assignment = $this->assignment->findById((int) $id);

        if ($assignment === null) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài tập thành công.',
            'data' => $assignment,
        ]);
    }

    public function store(): void
    {
        $data = $this->normalizeData($this->requestData());
        $file = $this->uploadedAttachment();
        $errors = $this->validateData($data, $file);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($file !== null) {
            $data['attachment_path'] = $this->storeAttachment($file);
        }

        $currentUser = $this->currentUser();
        $data['created_by'] = (int) ($currentUser['id'] ?? 0);

        $assignmentId = $this->assignment->create($data);

        $this->json([
            'success' => true,
            'message' => 'Tạo bài tập thành công.',
            'data' => $this->assignment->findById($assignmentId),
        ], 201);
    }

    public function update(string|int $id): void
    {
        $assignmentId = (int) $id;
        $assignment = $this->assignment->findById($assignmentId);

        if ($assignment === null) {
            $this->notFound();
            return;
        }

        $data = $this->normalizeData($this->requestData(), $assignment);
        $file = $this->uploadedAttachment();
        $errors = $this->validateData($data, $file);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($file !== null) {
            $data['attachment_path'] = $this->storeAttachment($file);
        }

        $this->assignment->update($assignmentId, $data);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật bài tập thành công.',
            'data' => $this->assignment->findById($assignmentId),
        ]);
    }

    public function destroy(string|int $id): void
    {
        $assignmentId = (int) $id;

        if ($this->assignment->findById($assignmentId) === null) {
            $this->notFound();
            return;
        }

        $this->assignment->delete($assignmentId);

        $this->json([
            'success' => true,
            'message' => 'Xóa bài tập thành công.',
        ]);
    }

    public function duplicate(string|int $id): void
    {
        $source = $this->assignment->findById((int) $id);
        if ($source === null) {
            $this->notFound();
            return;
        }

        $input = $this->input();
        $classIds = array_values(array_unique(array_filter(array_map(
            static fn (mixed $value): int => is_numeric($value) ? (int) $value : 0,
            is_array($input['class_ids'] ?? null) ? $input['class_ids'] : [$input['class_id'] ?? 0]
        ), static fn (int $value): bool => $value > 0)));

        $data = [
            'title' => trim((string) ($input['title'] ?? $source['title'] ?? '')),
            'description' => trim((string) ($input['description'] ?? $source['description'] ?? '')),
            'deadline' => trim((string) ($input['deadline'] ?? $source['deadline'] ?? '')),
            'status' => trim((string) ($input['status'] ?? $source['status'] ?? 'draft')),
            'class_ids' => $classIds,
        ];

        $errors = $this->validateDuplicateData($data, (int) $source['subject_id']);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $data['deadline'] = AssignmentValidation::normalizeDeadline($data['deadline']);
        $created = $this->assignment->duplicate((int) $id, $data, $this->currentUserId());

        $this->json([
            'success' => true,
            'message' => 'Duplicate bài tập thành công.',
            'data' => $created,
        ], 201);
    }

    public function studentIndex(): void
    {
        $assignments = $this->assignment->getForStudent($this->currentUserId(), [
            'subject_id' => trim((string) ($_GET['subject_id'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? '')),
            'deadline' => trim((string) ($_GET['deadline'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách bài tập của tôi thành công.',
            'data' => $assignments,
        ]);
    }

    public function studentShow(string|int $id): void
    {
        $assignment = $this->assignment->findForStudent((int) $id, $this->currentUserId());

        if ($assignment === null) {
            $this->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem bài tập này.',
                'errors' => [],
            ], 403);
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài tập của tôi thành công.',
            'data' => $assignment,
        ]);
    }

    private function normalizeData(array $input, ?array $current = null): array
    {
        return [
            'subject_id' => trim((string) ($input['subject_id'] ?? $current['subject_id'] ?? '')),
            'class_id' => trim((string) ($input['class_id'] ?? $current['class_id'] ?? '')),
            'title' => trim((string) ($input['title'] ?? $current['title'] ?? '')),
            'description' => trim((string) ($input['description'] ?? $current['description'] ?? '')),
            'deadline' => trim((string) ($input['deadline'] ?? $current['deadline'] ?? '')),
            'attachment_path' => $current['attachment_path'] ?? null,
            'status' => trim((string) ($input['status'] ?? $current['status'] ?? 'draft')),
        ];
    }

    private function validateData(array &$data, ?array $file = null): array
    {
        $errors = AssignmentValidation::validate($data, $file);

        if (! isset($errors['subject_id']) && ! $this->assignment->subjectExists((int) $data['subject_id'])) {
            $errors['subject_id'] = 'Môn học không tồn tại hoặc đã bị xóa.';
        }

        if (! isset($errors['subject_id']) && ! isset($errors['class_id'])) {
            if (! ctype_digit((string) $data['class_id']) || ! $this->assignment->classBelongsToSubject((int) $data['class_id'], (int) $data['subject_id'])) {
                $errors['class_id'] = 'Lớp không thuộc môn học này hoặc đã bị khóa.';
            }
        }

        if (! isset($errors['deadline'])) {
            $data['deadline'] = AssignmentValidation::normalizeDeadline($data['deadline']);
        }

        return $errors;
    }

    private function validateDuplicateData(array $data, int $subjectId): array
    {
        $errors = [];

        if ($data['title'] === '') {
            $errors['title'] = 'Tiêu đề bài tập là bắt buộc.';
        }

        if ($data['deadline'] === '') {
            $errors['deadline'] = 'Deadline là bắt buộc.';
        } elseif (strtotime($data['deadline']) === false) {
            $errors['deadline'] = 'Deadline không đúng định dạng.';
        }

        if ($data['class_ids'] === []) {
            $errors['class_ids'] = 'Vui lòng chọn ít nhất một lớp đích.';
        }

        foreach ($data['class_ids'] as $classId) {
            if (! $this->assignment->classBelongsToSubject((int) $classId, $subjectId)) {
                $errors['class_ids'] = 'Chỉ được duplicate sang lớp thuộc cùng môn học.';
                break;
            }
        }

        if (! in_array($data['status'], ['open', 'closed', 'draft'], true)) {
            $errors['status'] = 'Trạng thái không hợp lệ.';
        }

        return $errors;
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

    private function uploadedAttachment(): ?array
    {
        $file = $_FILES['attachment'] ?? $_FILES['attachment_file'] ?? null;

        if (! is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        return $file;
    }

    private function storeAttachment(array $file): string
    {
        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $uploadDir = BASE_PATH . '/storage/uploads/assignments';

        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = 'assignment_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $targetPath = $uploadDir . '/' . $fileName;

        if (! move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
            throw new RuntimeException('Không thể lưu file đính kèm.');
        }

        return public_url_path() . '/api/files/assignments/' . $fileName;
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
            'message' => 'Không tìm thấy bài tập.',
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
