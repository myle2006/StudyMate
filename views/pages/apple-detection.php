<?php
  $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
  $isLocalEnvironment = preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/', $host) === 1
      || str_starts_with($host, 'localhost:')
      || str_starts_with($host, '127.0.0.1:');
?>

<div id="apple-detection-root"></div>

<script>
  window.STUDYMATE_BASE_PATH = <?= json_encode(base_url_path(), JSON_UNESCAPED_SLASHES) ?>;
  window.STUDYMATE_APPLE_DETECTION = {
    homeUrl: <?= json_encode(url('/'), JSON_UNESCAPED_SLASHES) ?>,
    healthUrl: <?= json_encode(url('/api/apple-detection/health'), JSON_UNESCAPED_SLASHES) ?>,
    predictUrl: <?= json_encode(url('/api/apple-detection/predict'), JSON_UNESCAPED_SLASHES) ?>,
    isLocalEnvironment: <?= json_encode($isLocalEnvironment) ?>,
    fastApiHelp: <?= json_encode('cd "C:\xampp\htdocs\recognize image AI Model\ai-service" && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000', JSON_UNESCAPED_SLASHES) ?>,
    productionHelp: <?= json_encode('AI service chưa sẵn sàng trên hosting. Nếu dùng Roboflow, hãy cấu hình OBJECT_DETECTION_PROVIDER=roboflow, ROBOFLOW_API_KEY và ROBOFLOW_MODEL_ID trong file .env trên hosting.', JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
  };
</script>
<script type="text/babel" src="<?= asset('js/apple-detection.js') ?>"></script>
