<?php

class AppleDetectionService
{
    private array $env;

    public function __construct()
    {
        $this->env = $this->loadEnv();
    }

    public function health(): array
    {
        $url = $this->envValue('OBJECT_DETECTION_FASTAPI_HEALTH_URL', 'http://127.0.0.1:8000/health');

        return $this->getJson($url);
    }

    public function predict(array $file): array
    {
        $url = $this->envValue('OBJECT_DETECTION_FASTAPI_URL', 'http://127.0.0.1:8000/predict');
        $tmpName = (string) ($file['tmp_name'] ?? '');
        $originalName = (string) ($file['name'] ?? 'upload.jpg');

        if ($tmpName === '' || ! is_uploaded_file($tmpName)) {
            throw new RuntimeException('File upload không hợp lệ.');
        }

        $mimeType = mime_content_type($tmpName) ?: 'image/jpeg';

        if (! function_exists('curl_init')) {
            throw new RuntimeException('PHP cURL extension chưa được bật.');
        }

        $curl = curl_init($url);
        if ($curl === false) {
            throw new RuntimeException('Không thể khởi tạo kết nối tới AI service.');
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [
                'file' => new CURLFile($tmpName, $mimeType, $originalName),
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 120,
        ]);

        return $this->executeJsonRequest($curl, 'FastAPI prediction failed');
    }

    private function getJson(string $url): array
    {
        if (! function_exists('curl_init')) {
            throw new RuntimeException('PHP cURL extension chưa được bật.');
        }

        $curl = curl_init($url);
        if ($curl === false) {
            throw new RuntimeException('Không thể khởi tạo kết nối tới AI service.');
        }

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);

        return $this->executeJsonRequest($curl, 'FastAPI health check failed');
    }

    private function executeJsonRequest(CurlHandle $curl, string $fallbackMessage): array
    {
        $responseBody = curl_exec($curl);
        $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException($curlError !== '' ? $curlError : $fallbackMessage);
        }

        $data = json_decode((string) $responseBody, true);
        if (! is_array($data)) {
            throw new RuntimeException('AI service trả về JSON không hợp lệ.');
        }

        if ($statusCode >= 400) {
            $detail = $data['detail'] ?? $data['message'] ?? $fallbackMessage;
            throw new RuntimeException(is_string($detail) ? $detail : $fallbackMessage);
        }

        return $data;
    }

    private function envValue(string $key, string $default = ''): string
    {
        $value = getenv($key);
        if ($value !== false && $value !== '') {
            return (string) $value;
        }

        return (string) ($this->env[$key] ?? $default);
    }

    private function loadEnv(): array
    {
        $path = BASE_PATH . '/.env';
        if (! file_exists($path)) {
            return [];
        }

        $values = [];
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim((string) $line);
            if ($line === '' || str_starts_with($line, '#') || ! str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $values[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
        }

        return $values;
    }
}
