<?php

class AppleDetectionController extends Controller
{
    private AppleDetectionService $service;

    public function __construct()
    {
        $this->service = new AppleDetectionService();
    }

    public function health(): void
    {
        try {
            $this->json([
                'success' => true,
                'message' => 'AI service sẵn sàng.',
                'data' => $this->service->health(),
            ]);
        } catch (Throwable $exception) {
            $this->json([
                'success' => false,
                'message' => 'Chưa kết nối được AI service. Hãy chạy FastAPI ở http://127.0.0.1:8000.',
                'errors' => [
                    'service' => $exception->getMessage(),
                ],
            ], 503);
        }
    }

    public function predict(): void
    {
        $file = $this->uploadedImage();
        $errors = $this->validateImage($file);

        if ($errors !== []) {
            $this->json([
                'success' => false,
                'message' => 'Dữ liệu upload không hợp lệ.',
                'errors' => $errors,
            ], 422);
            return;
        }

        try {
            $prediction = $this->service->predict($file);

            $this->json([
                'success' => true,
                'message' => 'Nhận diện ảnh thành công.',
                'data' => $prediction,
            ]);
        } catch (Throwable $exception) {
            $this->json([
                'success' => false,
                'message' => 'Không thể nhận diện ảnh. Hãy kiểm tra FastAPI model đã chạy chưa.',
                'errors' => [
                    'service' => $exception->getMessage(),
                ],
            ], 502);
        }
    }

    private function uploadedImage(): ?array
    {
        $file = $_FILES['image'] ?? null;

        if (! is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        return $file;
    }

    private function validateImage(?array $file): array
    {
        if ($file === null) {
            return ['image' => 'Vui lòng chọn ảnh cần nhận diện.'];
        }

        if ((int) ($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            return ['image' => 'Không thể upload ảnh. Vui lòng thử lại.'];
        }

        $maxBytes = 8 * 1024 * 1024;
        if ((int) ($file['size'] ?? 0) <= 0) {
            return ['image' => 'Ảnh upload đang rỗng.'];
        }

        if ((int) ($file['size'] ?? 0) > $maxBytes) {
            return ['image' => 'Ảnh upload không được vượt quá 8MB.'];
        }

        $tmpName = (string) ($file['tmp_name'] ?? '');
        $mimeType = $tmpName !== '' ? mime_content_type($tmpName) : '';
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (! in_array($mimeType, $allowedMimeTypes, true)) {
            return ['image' => 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.'];
        }

        return [];
    }
}
