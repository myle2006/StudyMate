<?php

class AIService
{
    private array $env;

    public function __construct()
    {
        $this->env = $this->loadEnv();
    }

    public function generateLearningRoadmap(array $context): array
    {
        $prompt = $this->buildRoadmapPrompt($context);
        $content = $this->callConfiguredProvider($prompt);
        $json = $this->decodeJsonContent($content);

        if (! isset($json['title'], $json['overview'], $json['items']) || ! is_array($json['items'])) {
            throw new RuntimeException('AI không trả về JSON lộ trình hợp lệ.');
        }

        $items = [];
        foreach ($json['items'] as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $items[] = [
                'week_number' => max(1, (int) ($item['week_number'] ?? 1)),
                'order_number' => $index + 1,
                'title' => trim((string) ($item['title'] ?? '')),
                'description' => trim((string) ($item['description'] ?? '')),
                'expected_result' => trim((string) ($item['expected_result'] ?? '')),
                'suggested_task' => trim((string) ($item['suggested_task'] ?? '')),
                'planned_date' => trim((string) ($item['planned_date'] ?? '')),
                'start_time' => trim((string) ($item['start_time'] ?? '')),
                'duration_minutes' => isset($item['duration_minutes']) ? max(15, (int) $item['duration_minutes']) : null,
                'priority' => in_array(($item['priority'] ?? 'medium'), ['low', 'medium', 'high'], true)
                    ? $item['priority']
                    : 'medium',
                'status' => 'not_started',
            ];
        }

        if ($items === []) {
            throw new RuntimeException('AI không tạo được bước học nào.');
        }

        return [
            'title' => trim((string) $json['title']),
            'overview' => trim((string) $json['overview']),
            'items' => $items,
            'ai_prompt' => $prompt,
            'ai_raw_response' => $content,
        ];
    }

    private function callConfiguredProvider(string $prompt): string
    {
        $provider = strtolower($this->envValue('AI_PROVIDER', 'openai'));
        $this->guardProviderAvailability($provider);

        if ($provider === 'gemini' || $provider === 'google') {
            return $this->callGeminiGenerateContent($prompt);
        }

        return $this->callChatCompletions($prompt);
    }

    public function status(): array
    {
        $provider = $this->normalizeProvider($this->envValue('AI_PROVIDER', 'openai'));
        $configured = $this->providerConfigured($provider);
        $lock = $this->activeProviderLock($provider);
        $message = $this->providerLabel($provider) . ' sẵn sàng tạo lộ trình học.';

        if (! $configured) {
            $message = $provider === 'gemini'
                ? 'Chưa cấu hình GEMINI_API_KEY hoặc GOOGLE_API_KEY trong file .env của backend.'
                : 'Chưa cấu hình AI_API_KEY hoặc OPENAI_API_KEY trong file .env của backend.';
        } elseif ($lock !== null) {
            $message = (string) ($lock['message'] ?? 'AI đang tạm ngưng do hết credit/quota.');
        }

        return [
            'provider' => $provider,
            'provider_label' => $this->providerLabel($provider),
            'configured' => $configured,
            'blocked' => $lock !== null,
            'available' => $configured && $lock === null,
            'message' => $message,
            'blocked_until' => $lock['blocked_until'] ?? null,
        ];
    }

    private function callChatCompletions(string $prompt): string
    {
        $apiKey = $this->envValueAny(['AI_API_KEY', 'OPENAI_API_KEY']);
        if ($apiKey === '') {
            throw new RuntimeException('Chưa cấu hình AI_API_KEY hoặc OPENAI_API_KEY trong file .env của backend.');
        }

        $apiUrl = $this->envValue('AI_API_URL', 'https://api.openai.com/v1/chat/completions');
        $model = $this->envValue('AI_MODEL', 'gpt-4o-mini');
        $payload = [
            'model' => $model,
            'temperature' => 0.4,
            'response_format' => ['type' => 'json_object'],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Bạn là trợ lý học tập StudyMate AI. Chỉ trả lời JSON hợp lệ, không markdown, không giải thích ngoài JSON.',
                ],
                [
                    'role' => 'user',
                    'content' => $prompt,
                ],
            ],
        ];

        $ch = curl_init($apiUrl);
        if ($ch === false) {
            throw new RuntimeException('Không thể khởi tạo kết nối AI API.');
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
            CURLOPT_TIMEOUT => (int) $this->envValue('AI_TIMEOUT', '60'),
        ]);

        $response = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || $curlError !== '') {
            throw new RuntimeException('Không thể gọi AI API: ' . $curlError);
        }

        $decoded = json_decode((string) $response, true);
        if ($statusCode >= 400) {
            $message = $decoded['error']['message'] ?? 'AI API trả về lỗi.';
            $code = (string) ($decoded['error']['code'] ?? '');
            $type = (string) ($decoded['error']['type'] ?? '');
            throw new RuntimeException($this->friendlyApiError((string) $message, $code, $type, $statusCode, 'openai'));
        }

        $content = $decoded['choices'][0]['message']['content'] ?? null;
        if (! is_string($content) || trim($content) === '') {
            throw new RuntimeException('AI API không trả về nội dung hợp lệ.');
        }

        return $content;
    }

    private function callGeminiGenerateContent(string $prompt): string
    {
        $apiKey = $this->envValueAny(['GEMINI_API_KEY', 'GOOGLE_API_KEY']);
        if ($apiKey === '') {
            throw new RuntimeException('Chưa cấu hình GEMINI_API_KEY hoặc GOOGLE_API_KEY trong file .env của backend.');
        }

        $model = $this->envValue('GEMINI_MODEL', 'gemini-3.6-flash');
        $model = ltrim(str_replace('models/', '', $model), '/');
        $apiBaseUrl = rtrim($this->envValue('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models'), '/');
        $apiUrl = $apiBaseUrl . '/' . rawurlencode($model) . ':generateContent';
        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        [
                            'text' => 'Bạn là trợ lý học tập StudyMate AI. Chỉ trả lời JSON hợp lệ, không markdown, không giải thích ngoài JSON.' . "\n\n" . $prompt,
                        ],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => 0.4,
                'responseMimeType' => 'application/json',
            ],
        ];

        $ch = curl_init($apiUrl);
        if ($ch === false) {
            throw new RuntimeException('Không thể khởi tạo kết nối Gemini API.');
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
            CURLOPT_TIMEOUT => (int) $this->envValue('AI_TIMEOUT', '60'),
        ]);

        $response = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || $curlError !== '') {
            throw new RuntimeException('Không thể gọi Gemini API: ' . $curlError);
        }

        $decoded = json_decode((string) $response, true);
        if ($statusCode >= 400) {
            $message = $decoded['error']['message'] ?? 'Gemini API trả về lỗi.';
            $code = (string) ($decoded['error']['code'] ?? '');
            $status = (string) ($decoded['error']['status'] ?? '');
            throw new RuntimeException($this->friendlyApiError((string) $message, $code, $status, $statusCode, 'gemini'));
        }

        $content = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (! is_string($content) || trim($content) === '') {
            throw new RuntimeException('Gemini API không trả về nội dung hợp lệ.');
        }

        return $content;
    }

    private function buildRoadmapPrompt(array $context): string
    {
        $subjectName = trim((string) ($context['subject_name'] ?? ''));
        $subjectCode = trim((string) ($context['subject_code'] ?? ''));
        $goal = trim((string) ($context['goal'] ?? ''));
        $currentLevel = trim((string) ($context['current_level'] ?? ''));
        $studyTime = trim((string) ($context['study_time_per_day'] ?? ''));
        $weekdays = trim((string) ($context['available_weekdays'] ?? ''));
        if (is_array($context['available_weekdays'] ?? null)) {
            $weekdays = implode(', ', $context['available_weekdays']);
        }
        $preferredStartTime = trim((string) ($context['preferred_start_time'] ?? ''));
        $sessionDuration = trim((string) ($context['session_duration_minutes'] ?? ''));
        $maxDailyMinutes = trim((string) ($context['max_daily_minutes'] ?? ''));
        $maxWeeklyMinutes = trim((string) ($context['max_weekly_minutes'] ?? ''));
        $startDate = trim((string) ($context['start_date'] ?? ''));
        $endDate = trim((string) ($context['end_date'] ?? ''));

        return <<<PROMPT
Hãy tạo lộ trình học cá nhân hóa bằng tiếng Việt.

Thông tin đầu vào:
- Môn học: {$subjectCode} - {$subjectName}
- Mục tiêu học tập: {$goal}
- Trình độ hiện tại: {$currentLevel}
- Thời gian học mỗi ngày: {$studyTime} giờ
- Các ngày có thể học trong tuần theo ISO weekday (1=Thứ 2, 7=Chủ nhật): {$weekdays}
- Khung giờ bắt đầu học ưu tiên: {$preferredStartTime}
- Thời lượng mỗi buổi: {$sessionDuration} phút
- Tổng thời gian tối đa mỗi ngày: {$maxDailyMinutes} phút
- Tổng thời gian tối đa mỗi tuần: {$maxWeeklyMinutes} phút
- Ngày bắt đầu: {$startDate}
- Ngày kết thúc: {$endDate}

Yêu cầu:
- Chia lộ trình thành các nhiệm vụ học tập cụ thể theo từng ngày trong khoảng thời gian trên.
- Chỉ xếp nhiệm vụ vào các ngày có thể học trong tuần.
- Mỗi nhiệm vụ phải có ngày học, giờ bắt đầu, thời lượng dự kiến và mức độ ưu tiên.
- Mỗi bước học phải thực tế với thời gian học mỗi ngày.
- Ưu tiên nội dung có thể đo lường được.
- Không nhắc đến AI nhận dạng trái cây.
- Chỉ trả về JSON hợp lệ, không markdown, không code fence, không giải thích ngoài JSON.

JSON output bắt buộc theo format:
{
  "title": "Tên lộ trình",
  "overview": "Mô tả ngắn",
  "items": [
    {
      "week_number": 1,
      "title": "Tên bước học",
      "description": "Nội dung cần học",
      "planned_date": "YYYY-MM-DD",
      "start_time": "HH:mm",
      "duration_minutes": 60,
      "expected_result": "Kết quả cần đạt",
      "suggested_task": "Bài tập gợi ý",
      "priority": "low|medium|high"
    }
  ]
}
PROMPT;
    }

    private function decodeJsonContent(string $content): array
    {
        $content = trim($content);
        $content = preg_replace('/^```(?:json)?\s*/i', '', $content) ?? $content;
        $content = preg_replace('/\s*```$/', '', $content) ?? $content;

        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        $firstBrace = strpos($content, '{');
        $lastBrace = strrpos($content, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $candidate = substr($content, $firstBrace, $lastBrace - $firstBrace + 1);
            $decoded = json_decode($candidate, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        throw new RuntimeException('Không thể đọc JSON từ phản hồi AI.');
    }

    private function envValue(string $key, string $default = ''): string
    {
        $value = getenv($key);
        if ($value !== false && $value !== '') {
            return (string) $value;
        }

        return (string) ($this->env[$key] ?? $default);
    }

    private function envValueAny(array $keys, string $default = ''): string
    {
        foreach ($keys as $key) {
            $value = $this->envValue((string) $key);
            if ($value !== '') {
                return $value;
            }
        }

        return $default;
    }

    private function friendlyApiError(string $message, string $code, string $type, int $statusCode, string $provider = 'ai'): string
    {
        $haystack = strtolower($message . ' ' . $code . ' ' . $type);
        $provider = $this->normalizeProvider($provider);
        $providerLabel = $this->providerLabel($provider);

        $quotaKeywords = [
            'insufficient_quota',
            'resource_exhausted',
            'quota',
            'billing',
            'credit',
            'exhausted',
        ];

        foreach ($quotaKeywords as $keyword) {
            if (str_contains($haystack, $keyword)) {
                $minutes = max(5, (int) $this->envValue('AI_CREDIT_BLOCK_MINUTES', '1440'));
                $lock = $this->blockProvider(
                    $provider,
                    $providerLabel . ' đã hết credit/quota. Hệ thống đã tạm ngưng tạo lộ trình AI để tránh gọi thêm API. Vui lòng kiểm tra billing/quota rồi thử lại sau.',
                    $minutes
                );

                return (string) $lock['message'];
            }
        }

        if ($statusCode === 429 || str_contains($haystack, 'rate_limit') || str_contains($haystack, 'rate limit')) {
            $minutes = max(1, (int) $this->envValue('AI_RATE_LIMIT_BLOCK_MINUTES', '15'));
            $lock = $this->blockProvider(
                $provider,
                $providerLabel . ' đang bị giới hạn lượt gọi. Hệ thống đã tạm ngưng tạm thời để tránh gửi thêm request không cần thiết.',
                $minutes
            );

            return (string) $lock['message'];
        }

        if ($statusCode === 401 || str_contains($haystack, 'invalid_api_key') || str_contains($haystack, 'incorrect api key') || str_contains($haystack, 'api key not valid')) {
            return $provider === 'gemini'
                ? 'API key Gemini không hợp lệ. Vui lòng kiểm tra GEMINI_API_KEY hoặc GOOGLE_API_KEY trong file .env của backend.'
                : 'API key OpenAI không hợp lệ. Vui lòng kiểm tra AI_API_KEY hoặc OPENAI_API_KEY trong file .env của backend.';
        }

        if (str_contains($haystack, 'insufficient_quota') || str_contains($haystack, 'quota') || str_contains($haystack, 'billing')) {
            return 'Tài khoản OpenAI API đã hết quota hoặc chưa có credit/billing hợp lệ. Vui lòng kiểm tra Billing, nạp credit hoặc tăng usage limit trong OpenAI Platform rồi thử lại.';
        }

        if ($statusCode === 429 || str_contains($haystack, 'rate_limit')) {
            return 'OpenAI API đang bị giới hạn tốc độ gọi. Vui lòng chờ một lúc rồi thử lại hoặc kiểm tra rate limit của project.';
        }

        if ($statusCode === 401 || str_contains($haystack, 'invalid_api_key') || str_contains($haystack, 'incorrect api key')) {
            return 'API key OpenAI không hợp lệ. Vui lòng kiểm tra lại AI_API_KEY hoặc OPENAI_API_KEY trong file .env của backend.';
        }

        return $message !== '' ? $message : 'AI API trả về lỗi.';
    }

    private function guardProviderAvailability(string $provider): void
    {
        $provider = $this->normalizeProvider($provider);

        if (! $this->providerConfigured($provider)) {
            throw new RuntimeException($provider === 'gemini'
                ? 'Chưa cấu hình GEMINI_API_KEY hoặc GOOGLE_API_KEY trong file .env của backend.'
                : 'Chưa cấu hình AI_API_KEY hoặc OPENAI_API_KEY trong file .env của backend.');
        }

        $lock = $this->activeProviderLock($provider);
        if ($lock !== null) {
            throw new RuntimeException((string) ($lock['message'] ?? 'AI đang tạm ngưng do hết credit/quota.'));
        }
    }

    private function providerConfigured(string $provider): bool
    {
        $provider = $this->normalizeProvider($provider);

        if ($provider === 'gemini') {
            return $this->envValueAny(['GEMINI_API_KEY', 'GOOGLE_API_KEY']) !== '';
        }

        return $this->envValueAny(['AI_API_KEY', 'OPENAI_API_KEY']) !== '';
    }

    private function providerLabel(string $provider): string
    {
        return $this->normalizeProvider($provider) === 'gemini' ? 'Gemini' : 'OpenAI';
    }

    private function normalizeProvider(string $provider): string
    {
        $provider = strtolower(trim($provider));

        return in_array($provider, ['gemini', 'google'], true) ? 'gemini' : 'openai';
    }

    private function activeProviderLock(string $provider): ?array
    {
        $provider = $this->normalizeProvider($provider);
        $locks = $this->readProviderLocks();
        $lock = $locks[$provider] ?? null;

        if (! is_array($lock)) {
            return null;
        }

        $blockedUntil = (string) ($lock['blocked_until'] ?? '');
        if ($blockedUntil === '') {
            return null;
        }

        try {
            $until = new DateTimeImmutable($blockedUntil);
        } catch (Throwable) {
            return null;
        }

        if ($until <= new DateTimeImmutable('now')) {
            unset($locks[$provider]);
            $this->writeProviderLocks($locks);
            return null;
        }

        return [
            'message' => (string) ($lock['message'] ?? 'AI đang tạm ngưng do hết credit/quota.'),
            'blocked_until' => $until->format(DateTimeInterface::ATOM),
        ];
    }

    private function blockProvider(string $provider, string $message, int $minutes): array
    {
        $provider = $this->normalizeProvider($provider);
        $now = new DateTimeImmutable('now');
        $blockedUntil = $now->modify('+' . max(1, $minutes) . ' minutes');
        $locks = $this->readProviderLocks();

        $lock = [
            'message' => $message,
            'blocked_until' => $blockedUntil->format(DateTimeInterface::ATOM),
            'created_at' => $now->format(DateTimeInterface::ATOM),
        ];

        $locks[$provider] = $lock;
        $this->writeProviderLocks($locks);

        return $lock;
    }

    private function readProviderLocks(): array
    {
        $path = $this->aiLockPath();
        if (! file_exists($path)) {
            return [];
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) ? $decoded : [];
    }

    private function writeProviderLocks(array $locks): void
    {
        $path = $this->aiLockPath();
        $directory = dirname($path);

        if (! is_dir($directory)) {
            @mkdir($directory, 0775, true);
        }

        @file_put_contents($path, json_encode($locks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function aiLockPath(): string
    {
        return BASE_PATH . '/storage/ai_provider_lock.json';
    }

    private function loadEnv(): array
    {
        $path = BASE_PATH . '/.env';
        if (! file_exists($path)) {
            return [];
        }

        $values = [];
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || ! str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            $value = trim($value, "\"'");
            if ($key !== '') {
                $values[$key] = $value;
            }
        }

        return $values;
    }
}
