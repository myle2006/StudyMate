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
        $user = $this->currentUser();
        $filters = [
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? '')),
            'page' => (int) ($_GET['page'] ?? 1),
            'limit' => (int) ($_GET['limit'] ?? 10),
        ];

        $result = $this->subject->getAll($user, $filters);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách môn học thành công.',
            'data' => $result['data'],
            'pagination' => $result['pagination'],
        ]);
    }

    public function show(string|int $id): void
    {
        $subject = $this->subject->findById((int) $id);

        if ($subject === null) {
            $this->notFound();
            return;
        }

        if (! $this->canAccess($subject)) {
            $this->accessDenied();
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
        $user = $this->currentUser();
        $data = $this->normalizeSubjectData($this->requestData());
        $errors = array_merge($this->validate($data), $this->validateSubjectImage());

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($this->hasUploadedSubjectImage()) {
            $data['icon'] = $this->storeSubjectImage();
        }

        if ($this->subject->isCodeExists($data['code'], (int) $user['id'])) {
            $this->validationFailed([
                'code' => 'Mã môn học đã tồn tại trong tài khoản này.',
            ]);
            return;
        }

        $data['user_id'] = (int) $user['id'];
        $subjectId = $this->subject->create($data);
        $createdSubject = $this->subject->findById($subjectId);

        $this->json([
            'success' => true,
            'message' => 'Thêm môn học thành công.',
            'data' => $this->compactSubject($createdSubject),
        ], 201);
    }

    public function update(string|int $id): void
    {
        $subjectId = (int) $id;
        $subject = $this->subject->findById($subjectId);

        if ($subject === null) {
            $this->notFound();
            return;
        }

        if (! $this->canAccess($subject)) {
            $this->accessDenied();
            return;
        }

        $data = $this->normalizeSubjectData($this->requestData());
        $errors = array_merge($this->validate($data), $this->validateSubjectImage());

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($this->hasUploadedSubjectImage()) {
            $data['icon'] = $this->storeSubjectImage();
        } elseif ($data['icon'] === '') {
            $data['icon'] = (string) ($subject['icon'] ?? '');
        }

        if ($this->subject->isCodeExists($data['code'], (int) $subject['user_id'], $subjectId)) {
            $this->validationFailed([
                'code' => 'Mã môn học đã tồn tại trong tài khoản này.',
            ]);
            return;
        }

        $this->subject->update($subjectId, $data);
        $updatedSubject = $this->subject->findById($subjectId);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật môn học thành công.',
            'data' => $this->compactSubject($updatedSubject),
        ]);
    }

    public function destroy(string|int $id): void
    {
        $subjectId = (int) $id;
        $subject = $this->subject->findById($subjectId);

        if ($subject === null) {
            $this->notFound();
            return;
        }

        if (! $this->canAccess($subject)) {
            $this->accessDenied();
            return;
        }

        if ($this->subject->hasRelatedData($subjectId)) {
            $this->subject->archive($subjectId);
            $this->json([
                'success' => true,
                'message' => 'Môn học đã được chuyển sang trạng thái lưu trữ.',
            ]);
            return;
        }

        $this->subject->delete($subjectId);

        $this->json([
            'success' => true,
            'message' => 'Xóa môn học thành công.',
        ]);
    }

    private function normalizeSubjectData(array $input): array
    {
        return [
            'name' => trim((string) ($input['name'] ?? '')),
            'code' => trim((string) ($input['code'] ?? '')),
            'description' => trim((string) ($input['description'] ?? '')),
            'color' => trim((string) ($input['color'] ?? '')),
            'icon' => trim((string) ($input['icon'] ?? '')),
            'status' => trim((string) ($input['status'] ?? 'active')),
        ];
    }

    private function requestData(): array
    {
        if (! empty($_POST)) {
            return $_POST;
        }

        return $this->input();
    }

    private function validate(array $data): array
    {
        $errors = [];
        $nameLength = $this->textLength($data['name']);

        if ($data['name'] === '') {
            $errors['name'] = 'Tên môn học là bắt buộc.';
        } elseif ($nameLength < 3) {
            $errors['name'] = 'Tên môn học phải có ít nhất 3 ký tự.';
        } elseif ($nameLength > 150) {
            $errors['name'] = 'Tên môn học không được vượt quá 150 ký tự.';
        }

        if ($data['code'] !== '' && $this->textLength($data['code']) > 50) {
            $errors['code'] = 'Mã môn học không được vượt quá 50 ký tự.';
        }

        if ($data['color'] !== '' && ! preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', $data['color'])) {
            $errors['color'] = 'Màu môn học không đúng định dạng.';
        }

        if ($data['icon'] !== '' && $this->textLength($data['icon']) > 255) {
            $errors['icon'] = 'Icon môn học không được vượt quá 255 ký tự.';
        }

        if ($data['status'] !== '' && ! in_array($data['status'], ['active', 'archived'], true)) {
            $errors['status'] = 'Trạng thái môn học chỉ được là active hoặc archived.';
        }

        return $errors;
    }

    private function validateSubjectImage(): array
    {
        if (! $this->hasUploadedSubjectImage()) {
            return [];
        }

        $file = $_FILES['image'] ?? $_FILES['icon_file'] ?? null;

        if (! is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            return ['image' => 'Không thể tải ảnh môn học.'];
        }

        if (($file['size'] ?? 0) > 2 * 1024 * 1024) {
            return ['image' => 'Ảnh môn học không được vượt quá 2MB.'];
        }

        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            return ['image' => 'File tải lên phải là hình ảnh hợp lệ.'];
        }

        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (! in_array($imageInfo['mime'] ?? '', $allowedMimeTypes, true)) {
            return ['image' => 'Ảnh môn học chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF.'];
        }

        return [];
    }

    private function hasUploadedSubjectImage(): bool
    {
        $file = $_FILES['image'] ?? $_FILES['icon_file'] ?? null;

        return is_array($file) && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
    }

    private function storeSubjectImage(): string
    {
        $file = $_FILES['image'] ?? $_FILES['icon_file'];
        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $extension = in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)
            ? $extension
            : 'jpg';
        $uploadDir = BASE_PATH . '/public/uploads/subjects';

        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = 'subject_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $targetPath = $uploadDir . '/' . $fileName;

        if (! move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new RuntimeException('Không thể lưu ảnh môn học.');
        }

        return public_url_path() . '/uploads/subjects/' . $fileName;
    }

    private function canAccess(array $subject): bool
    {
        $user = $this->currentUser();

        if ($this->isAdmin($user)) {
            return true;
        }

        return (int) $subject['user_id'] === (int) $user['id'];
    }

    private function isAdmin(?array $user): bool
    {
        return strtolower((string) ($user['role'] ?? '')) === 'admin';
    }

    private function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }

    private function compactSubject(?array $subject): array
    {
        if ($subject === null) {
            return [];
        }

        return [
            'id' => (int) $subject['id'],
            'name' => $subject['name'],
            'code' => $subject['code'],
            'description' => $subject['description'],
            'color' => $subject['color'],
            'icon' => $subject['icon'],
            'status' => $subject['status'],
        ];
    }

    private function notFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy môn học.',
        ], 404);
    }

    private function accessDenied(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Bạn không có quyền truy cập môn học này.',
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
