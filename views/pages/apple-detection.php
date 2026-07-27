<div id="apple-detection-root"></div>

<script>
  window.STUDYMATE_BASE_PATH = <?= json_encode(base_url_path(), JSON_UNESCAPED_SLASHES) ?>;
  window.STUDYMATE_APPLE_DETECTION = {
    homeUrl: <?= json_encode(url('/'), JSON_UNESCAPED_SLASHES) ?>,
    healthUrl: <?= json_encode(url('/api/apple-detection/health'), JSON_UNESCAPED_SLASHES) ?>,
    predictUrl: <?= json_encode(url('/api/apple-detection/predict'), JSON_UNESCAPED_SLASHES) ?>,
    fastApiHelp: <?= json_encode('cd "C:\xampp\htdocs\recognize image AI Model\ai-service" && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000', JSON_UNESCAPED_SLASHES) ?>,
  };
</script>
<script type="text/babel" src="<?= asset('js/apple-detection.js') ?>"></script>
