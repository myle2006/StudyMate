<?php

class LessonController extends Controller
{
    private Lesson $lesson;

    public function __construct()
    {
        $this->lesson = new Lesson();
    }

    public function adminIndex(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách bài học thành công.',
            'data' => $this->lesson->getAllAdmin([
                'keyword' => trim((string) ($_GET['keyword'] ?? '')),
                'subject_id' => trim((string) ($_GET['subject_id'] ?? '')),
                'status' => trim((string) ($_GET['status'] ?? '')),
            ]),
        ]);
    }

    public function adminShow(string|int $id): void
    {
        $lesson = $this->lesson->findAdmin((int) $id);
        if ($lesson === null) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài học thành công.',
            'data' => $lesson,
        ]);
    }

    public function store(): void
    {
        $data = $this->normalizeData($this->requestData());
        $data['created_by'] = (int) (($this->currentUser() ?? [])['id'] ?? 0);
        $file = $this->uploadedMaterial();
        $errors = $this->validateData($data, $file);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($file !== null) {
            try {
                $data['material_path'] = $this->storeMaterial($file);
            } catch (RuntimeException $exception) {
                $this->validationFailed(['material' => $exception->getMessage()]);
                return;
            }
        }

        $lessonId = $this->lesson->create($data);

        $this->json([
            'success' => true,
            'message' => 'Tạo bài học thành công.',
            'data' => $this->lesson->findAdmin($lessonId),
        ], 201);
    }

    public function update(string|int $id): void
    {
        $lessonId = (int) $id;
        $current = $this->lesson->findAdmin($lessonId);
        if ($current === null) {
            $this->notFound();
            return;
        }

        $data = $this->normalizeData($this->requestData(), $current);
        $file = $this->uploadedMaterial();
        $errors = $this->validateData($data, $file);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($file !== null) {
            try {
                $data['material_path'] = $this->storeMaterial($file);
            } catch (RuntimeException $exception) {
                $this->validationFailed(['material' => $exception->getMessage()]);
                return;
            }
        }

        $this->lesson->update($lessonId, $data);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật bài học thành công.',
            'data' => $this->lesson->findAdmin($lessonId),
        ]);
    }

    public function destroy(string|int $id): void
    {
        if (! $this->lesson->delete((int) $id)) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Xóa bài học thành công.',
        ]);
    }

    public function studentIndex(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách bài học của tôi thành công.',
            'data' => $this->lesson->getForStudent($this->currentUserId(), [
                'keyword' => trim((string) ($_GET['keyword'] ?? '')),
                'subject_id' => trim((string) ($_GET['subject_id'] ?? '')),
            ]),
        ]);
    }

    public function studentShow(string|int $id): void
    {
        $lesson = $this->lesson->findForStudent((int) $id, $this->currentUserId());
        if ($lesson === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bài học hoặc bạn chưa được gán vào môn học này.',
                'errors' => [],
            ], 404);
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài học của tôi thành công.',
            'data' => $lesson,
        ]);
    }

    public function markCompleted(string|int $id): void
    {
        $lesson = $this->lesson->findForStudent((int) $id, $this->currentUserId());
        if ($lesson === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bài học hoặc bạn chưa được gán vào môn học này.',
                'errors' => [],
            ], 404);
            return;
        }

        $this->lesson->markCompleted((int) $id, $this->currentUserId());

        $this->json([
            'success' => true,
            'message' => 'Đã đánh dấu bài học là đã học.',
            'data' => $this->lesson->findForStudent((int) $id, $this->currentUserId()),
        ]);
    }

    private function normalizeData(array $input, ?array $current = null): array
    {
        return [
            'subject_id' => trim((string) ($input['subject_id'] ?? $current['subject_id'] ?? '')),
            'title' => trim((string) ($input['title'] ?? $current['title'] ?? '')),
            'content' => trim((string) ($input['content'] ?? $current['content'] ?? '')),
            'video_url' => trim((string) ($input['video_url'] ?? $current['video_url'] ?? '')),
            'external_url' => trim((string) ($input['external_url'] ?? $current['external_url'] ?? '')),
            'material_path' => trim((string) ($input['material_path'] ?? $current['material_path'] ?? '')),
            'duration_minutes' => trim((string) ($input['duration_minutes'] ?? $current['duration_minutes'] ?? '')),
            'status' => trim((string) ($input['status'] ?? $current['status'] ?? 'draft')),
            'created_by' => (int) ($input['created_by'] ?? $current['created_by'] ?? 0),
        ];
    }

    private function validateData(array $data, ?array $file): array
    {
        $errors = LessonValidation::validate($data, $file);

        if (! isset($errors['subject_id']) && ! $this->lesson->subjectExists((int) $data['subject_id'])) {
            $errors['subject_id'] = 'Môn học không tồn tại hoặc đã bị xóa.';
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

    private function uploadedMaterial(): ?array
    {
        $file = $_FILES['material'] ?? $_FILES['material_file'] ?? null;

        if (! is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        return $file;
    }

    private function storeMaterial(array $file): string
    {
        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $uploadDir = BASE_PATH . '/public/uploads/lessons';

        if (! is_dir($uploadDir) && ! mkdir($uploadDir, 0755, true)) {
            throw new RuntimeException('Không thể tạo thư mục lưu tài liệu bài học.');
        }

        $fileName = 'lesson_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $targetPath = $uploadDir . '/' . $fileName;

        if (! move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
            throw new RuntimeException('Không thể lưu tài liệu bài học.');
        }

        return public_url_path() . '/uploads/lessons/' . $fileName;
    }

    private function currentUserId(): int
    {
        return (int) (($this->currentUser() ?? [])['id'] ?? 0);
    }

    private function notFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy bài học.',
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
