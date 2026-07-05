<?php

class SubjectController extends Controller
{
    private Subject $subject;

    public function __construct()
    {
        $this->subject = new Subject();
    }

    public function index(): void
    {
        $subjects = $this->subject->getAll([
            'keyword' => $_GET['keyword'] ?? '',
            'status' => $_GET['status'] ?? '',
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách môn học thành công.',
            'data' => $subjects,
        ]);
    }

    public function show(string|int $id): void
    {
        $subject = $this->subject->getById((int) $id);

        if ($subject === null) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết môn học thành công.',
            'data' => $subject,
        ]);
    }

    public function store(): void
    {
        $data = $this->normalizeSubjectData($this->requestData(), true);
        $imageFile = $this->uploadedImage();
        $errors = SubjectValidation::validateCreate($data, $imageFile);

        if ($errors === [] && $this->subject->existsByCode($data['subject_code'])) {
            $errors['subject_code'] = 'Mã môn học đã tồn tại.';
        }

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($imageFile !== null) {
            $data['image'] = $this->storeSubjectImage($imageFile);
        }

        $user = $this->currentUser();
        $data['created_by'] = (int) ($user['id'] ?? 0);

        $subjectId = $this->subject->create($data);
        $createdSubject = $this->subject->getById($subjectId);

        $this->json([
            'success' => true,
            'message' => 'Thêm môn học thành công.',
            'data' => $createdSubject,
        ], 201);
    }

    public function update(string|int $id): void
    {
        $subjectId = (int) $id;
        $subject = $this->subject->getById($subjectId);

        if ($subject === null) {
            $this->notFound();
            return;
        }

        $requestData = $this->requestData();
        if (array_key_exists('subject_code', $requestData)) {
            unset($requestData['subject_code']);
        }

        $data = $this->normalizeSubjectData($requestData, false, $subject);
        $imageFile = $this->uploadedImage();
        $errors = SubjectValidation::validateUpdate($data, $imageFile);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($imageFile !== null) {
            $data['image'] = $this->storeSubjectImage($imageFile);
        }

        $this->subject->update($subjectId, $data);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật môn học thành công.',
            'data' => $this->subject->getById($subjectId),
        ]);
    }

    public function destroy(string|int $id): void
    {
        $subjectId = (int) $id;
        $subject = $this->subject->getById($subjectId);

        if ($subject === null) {
            $this->notFound();
            return;
        }

        $this->subject->delete($subjectId);

        $this->json([
            'success' => true,
            'message' => 'Xóa môn học thành công.',
        ]);
    }

    private function normalizeSubjectData(array $input, bool $isCreate, ?array $current = null): array
    {
        return [
            'subject_code' => $isCreate ? trim((string) ($input['subject_code'] ?? '')) : '',
            'subject_name' => trim((string) ($input['subject_name'] ?? $current['subject_name'] ?? '')),
            'description' => trim((string) ($input['description'] ?? $current['description'] ?? '')),
            'credits' => trim((string) ($input['credits'] ?? $current['credits'] ?? '3')),
            'status' => trim((string) ($input['status'] ?? $current['status'] ?? 'studying')),
            'color' => trim((string) ($input['color'] ?? $current['color'] ?? '#2563EB')),
            'image' => trim((string) ($input['image'] ?? $current['image'] ?? '')),
            'created_by' => (int) ($input['created_by'] ?? $current['created_by'] ?? 0),
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

    private function uploadedImage(): ?array
    {
        $file = $_FILES['image'] ?? null;

        if (! is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        return $file;
    }

    private function storeSubjectImage(array $file): string
    {
        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $uploadDir = BASE_PATH . '/public/uploads/subjects';

        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = 'subject_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $targetPath = $uploadDir . '/' . $fileName;

        if (! move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
            throw new RuntimeException('Không thể lưu ảnh môn học.');
        }

        return public_url_path() . '/uploads/subjects/' . $fileName;
    }

    private function notFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy môn học.',
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
