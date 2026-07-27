<?php

class AppleDetectionService
{
    private const CLASS_INFO = [
        'apple_good' => [
            'condition_key' => 'good',
            'label_vi' => 'Táo tốt',
            'condition_vi' => 'Bình thường',
            'recommendation' => 'Có thể sử dụng hoặc tiếp tục bảo quản trong ngăn mát.',
            'color' => '#2f855a',
            'severity' => 1,
        ],
        'apple_bruised' => [
            'condition_key' => 'bruised',
            'label_vi' => 'Táo bị dập',
            'condition_vi' => 'Dập/thâm nhẹ',
            'recommendation' => 'Nên kiểm tra phần thịt bên trong, cắt bỏ vùng bị ảnh hưởng và sử dụng sớm.',
            'color' => '#b7791f',
            'severity' => 2,
        ],
        'apple_rotten' => [
            'condition_key' => 'rotten',
            'label_vi' => 'Táo bị thối',
            'condition_vi' => 'Hư hỏng rõ',
            'recommendation' => 'Không nên sử dụng. Hãy loại bỏ quả bị thối.',
            'color' => '#c53030',
            'severity' => 3,
        ],
        'apple_moldy' => [
            'condition_key' => 'moldy',
            'label_vi' => 'Táo bị mốc',
            'condition_vi' => 'Có dấu hiệu mốc',
            'recommendation' => 'Nên loại bỏ và tách khỏi các quả còn lại để tránh lây nhiễm.',
            'color' => '#6b46c1',
            'severity' => 4,
        ],
        'uncertain' => [
            'condition_key' => 'uncertain',
            'label_vi' => 'Không phát hiện',
            'condition_vi' => 'Không đủ dữ liệu',
            'recommendation' => 'Hãy chụp lại ảnh rõ hơn, đủ sáng hơn hoặc đưa quả táo vào gần trung tâm ảnh.',
            'color' => '#718096',
            'severity' => 0,
        ],
    ];

    private array $env;

    public function __construct()
    {
        $this->env = $this->loadEnv();
    }

    public function health(): array
    {
        if ($this->provider() === 'roboflow') {
            return $this->roboflowHealth();
        }

        $url = $this->envValue('OBJECT_DETECTION_FASTAPI_HEALTH_URL', 'http://127.0.0.1:8000/health');

        return $this->getJson($url);
    }

    public function predict(array $file): array
    {
        $tmpName = (string) ($file['tmp_name'] ?? '');
        $originalName = (string) ($file['name'] ?? 'upload.jpg');

        if ($tmpName === '' || ! is_uploaded_file($tmpName)) {
            throw new RuntimeException('File upload không hợp lệ.');
        }

        $mimeType = mime_content_type($tmpName) ?: 'image/jpeg';

        if (! function_exists('curl_init')) {
            throw new RuntimeException('PHP cURL extension chưa được bật.');
        }

        if ($this->provider() === 'roboflow') {
            return $this->predictWithRoboflow($tmpName, $originalName, $mimeType);
        }

        return $this->predictWithFastApi($tmpName, $originalName, $mimeType);
    }

    private function predictWithFastApi(string $tmpName, string $originalName, string $mimeType): array
    {
        $url = $this->envValue('OBJECT_DETECTION_FASTAPI_URL', 'http://127.0.0.1:8000/predict');

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

    private function predictWithRoboflow(string $tmpName, string $originalName, string $mimeType): array
    {
        $apiKey = $this->envValue('ROBOFLOW_API_KEY');
        $modelId = $this->roboflowModelId();

        if ($apiKey === '' || $modelId === '') {
            throw new RuntimeException('Roboflow chưa được cấu hình ROBOFLOW_API_KEY hoặc ROBOFLOW_MODEL_ID.');
        }

        $imageBytes = file_get_contents($tmpName);
        if ($imageBytes === false || $imageBytes === '') {
            throw new RuntimeException('Không thể đọc ảnh upload.');
        }

        $query = http_build_query([
            'api_key' => $apiKey,
            'confidence' => (int) $this->envValue('ROBOFLOW_CONFIDENCE', '40'),
            'overlap' => (int) $this->envValue('ROBOFLOW_OVERLAP', '30'),
            'format' => 'json',
        ]);
        $url = rtrim($this->envValue('ROBOFLOW_API_URL', 'https://serverless.roboflow.com'), '/')
            . '/'
            . $this->encodeModelId($modelId)
            . '?'
            . $query;

        $curl = curl_init($url);
        if ($curl === false) {
            throw new RuntimeException('Không thể khởi tạo kết nối tới Roboflow.');
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => base64_encode($imageBytes),
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => (int) $this->envValue('ROBOFLOW_CONNECT_TIMEOUT', '20'),
            CURLOPT_DNS_CACHE_TIMEOUT => 300,
            CURLOPT_TIMEOUT => (int) $this->envValue('ROBOFLOW_TIMEOUT', '60'),
        ]);
        $this->applyRoboflowCurlCompatibilityOptions($curl);

        $data = $this->executeJsonRequest($curl, 'Roboflow prediction failed');

        return $this->normalizeRoboflowPrediction($data, $originalName, $mimeType, base64_encode($imageBytes));
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
            $detail = $data['detail'] ?? $data['message'] ?? $data['error'] ?? $fallbackMessage;
            throw new RuntimeException(is_string($detail) ? $detail : $fallbackMessage);
        }

        return $data;
    }

    private function applyRoboflowCurlCompatibilityOptions(CurlHandle $curl): void
    {
        if (
            $this->envValue('ROBOFLOW_FORCE_IPV4', '1') === '1'
            && defined('CURLOPT_IPRESOLVE')
            && defined('CURL_IPRESOLVE_V4')
        ) {
            curl_setopt($curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        }

        if (defined('CURLOPT_HTTP_VERSION') && defined('CURL_HTTP_VERSION_1_1')) {
            curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        }
    }

    private function roboflowHealth(): array
    {
        $apiKey = $this->envValue('ROBOFLOW_API_KEY');
        $modelId = $this->roboflowModelId();

        return [
            'status' => $apiKey !== '' && $modelId !== '' ? 'ok' : 'missing_config',
            'provider' => 'roboflow',
            'model_loaded' => $apiKey !== '' && $modelId !== '',
            'model_id' => $modelId,
            'api_url' => rtrim($this->envValue('ROBOFLOW_API_URL', 'https://serverless.roboflow.com'), '/'),
            'confidence_threshold' => ((int) $this->envValue('ROBOFLOW_CONFIDENCE', '40')) / 100,
        ];
    }

    private function normalizeRoboflowPrediction(array $data, string $filename, string $mimeType, string $imageBase64): array
    {
        $predictions = is_array($data['predictions'] ?? null) ? $data['predictions'] : [];
        $detections = [];

        foreach ($predictions as $prediction) {
            if (! is_array($prediction)) {
                continue;
            }

            $class = $this->canonicalClass((string) ($prediction['class'] ?? 'uncertain'));
            $info = $this->classInfo($class);
            $x = (float) ($prediction['x'] ?? 0);
            $y = (float) ($prediction['y'] ?? 0);
            $width = (float) ($prediction['width'] ?? 0);
            $height = (float) ($prediction['height'] ?? 0);
            $box = [
                round($x - ($width / 2), 2),
                round($y - ($height / 2), 2),
                round($x + ($width / 2), 2),
                round($y + ($height / 2), 2),
            ];
            $confidence = round((float) ($prediction['confidence'] ?? $prediction['class_confidence'] ?? 0), 6);

            $detections[] = [
                'id' => count($detections) + 1,
                'class' => $class,
                'model_class' => (string) ($prediction['class'] ?? $class),
                'label' => $class,
                'label_vi' => $info['label_vi'],
                'condition' => $info['condition_key'],
                'condition_vi' => $info['condition_vi'],
                'confidence' => $confidence,
                'bounding_box' => $box,
                'box' => [
                    'x1' => $box[0],
                    'y1' => $box[1],
                    'x2' => $box[2],
                    'y2' => $box[3],
                ],
                'recommendation' => $info['recommendation'],
                'severity' => $info['severity'],
                'color' => $info['color'],
                'needs_review' => $confidence < 0.5,
            ];
        }

        usort($detections, static fn (array $a, array $b): int => [$b['severity'], $b['confidence']] <=> [$a['severity'], $a['confidence']]);
        foreach ($detections as $index => &$detection) {
            $detection['id'] = $index + 1;
        }
        unset($detection);

        $summary = $this->buildSummary($detections);
        $best = $detections[0] ?? null;
        $label = $best['class'] ?? 'uncertain';
        $bestInfo = $this->classInfo($label);

        return [
            'filename' => $filename,
            'fruit_type' => 'apple',
            'model_type' => 'detection',
            'provider' => 'roboflow',
            'label' => $label,
            'label_vi' => $best['label_vi'] ?? self::CLASS_INFO['uncertain']['label_vi'],
            'condition' => $bestInfo['condition_key'],
            'condition_vi' => $bestInfo['condition_vi'],
            'confidence' => (float) ($best['confidence'] ?? 0),
            'is_confident' => $best !== null,
            'confidence_threshold' => ((int) $this->envValue('ROBOFLOW_CONFIDENCE', '40')) / 100,
            'total_count' => count($detections),
            'detection_count' => count($detections),
            'detections' => $detections,
            'items' => $detections,
            'predictions' => array_slice($detections, 0, 10),
            'summary' => $summary,
            'overall_recommendation' => $this->buildOverallRecommendation($summary, count($detections)),
            'annotated_image_mime' => $mimeType,
            'annotated_image_base64' => $imageBase64,
            'image' => $data['image'] ?? null,
            'message' => count($detections) > 0
                ? 'Roboflow phát hiện ' . count($detections) . ' quả táo.'
                : 'Roboflow chưa phát hiện quả táo nào. Hãy thử ảnh rõ hơn hoặc giảm ngưỡng confidence.',
        ];
    }

    private function buildSummary(array $detections): array
    {
        $summary = [
            'good' => 0,
            'bruised' => 0,
            'rotten' => 0,
            'moldy' => 0,
            'low_confidence' => 0,
        ];

        foreach ($detections as $detection) {
            $condition = (string) ($detection['condition'] ?? 'uncertain');
            if (array_key_exists($condition, $summary)) {
                $summary[$condition]++;
            }
            if ((float) ($detection['confidence'] ?? 0) < 0.5) {
                $summary['low_confidence']++;
            }
        }

        return $summary;
    }

    private function buildOverallRecommendation(array $summary, int $totalCount): string
    {
        if ($totalCount === 0) {
            return self::CLASS_INFO['uncertain']['recommendation'];
        }

        $parts = [];
        if ($summary['good'] > 0) {
            $parts[] = $summary['good'] . ' quả có thể sử dụng hoặc tiếp tục bảo quản';
        }
        if ($summary['bruised'] > 0) {
            $parts[] = $summary['bruised'] . ' quả bị dập nên tách ra và dùng sớm';
        }
        if ($summary['rotten'] > 0) {
            $parts[] = $summary['rotten'] . ' quả bị thối nên loại bỏ';
        }
        if ($summary['moldy'] > 0) {
            $parts[] = $summary['moldy'] . ' quả bị mốc cần loại bỏ và kiểm tra các quả tiếp xúc gần';
        }

        $recommendation = 'Có ' . implode(', ', $parts) . '.';
        if ($summary['low_confidence'] > 0) {
            $recommendation .= ' Một số kết quả có confidence thấp; nên chụp lại ảnh rõ hơn trước khi kết luận.';
        }

        return $recommendation;
    }

    private function canonicalClass(string $label): string
    {
        $normalized = strtolower(trim($label));
        $normalized = str_replace('_', '-', $normalized);
        $normalized = preg_replace('/[^a-z0-9]+/', '-', $normalized) ?? $normalized;
        $normalized = trim($normalized, '-');

        $aliases = [
            'apple-good' => 'apple_good',
            'apple-normal' => 'apple_good',
            'apple-healthy' => 'apple_good',
            'good' => 'apple_good',
            'apple-bruise' => 'apple_bruised',
            'apple-bruised' => 'apple_bruised',
            'bruised' => 'apple_bruised',
            'bruise' => 'apple_bruised',
            'apple-rotten' => 'apple_rotten',
            'rotten' => 'apple_rotten',
            'apple-moldy' => 'apple_moldy',
            'apple-mouldy' => 'apple_moldy',
            'moldy' => 'apple_moldy',
            'mouldy' => 'apple_moldy',
        ];

        return $aliases[$normalized] ?? str_replace('-', '_', $normalized);
    }

    private function classInfo(string $label): array
    {
        return self::CLASS_INFO[$label] ?? self::CLASS_INFO['uncertain'];
    }

    private function roboflowModelId(): string
    {
        $modelId = $this->envValue('ROBOFLOW_MODEL_ID');
        if ($modelId !== '') {
            return trim($modelId, '/');
        }

        $project = $this->envValue('ROBOFLOW_PROJECT_SLUG');
        $version = $this->envValue('ROBOFLOW_VERSION');

        return $project !== '' && $version !== '' ? trim($project, '/') . '/' . trim($version, '/') : '';
    }

    private function encodeModelId(string $modelId): string
    {
        return implode('/', array_map('rawurlencode', explode('/', trim($modelId, '/'))));
    }

    private function provider(): string
    {
        return strtolower(trim($this->envValue('OBJECT_DETECTION_PROVIDER', 'fastapi')));
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
