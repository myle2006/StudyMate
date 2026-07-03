<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($title ?? 'StudyMate AI') ?></title>
    <meta name="description" content="<?= e($description ?? 'StudyMate AI') ?>">
    <script>
      window.STUDYMATE_BASE_PATH = <?= json_encode(base_url_path(), JSON_UNESCAPED_SLASHES) ?>;
      window.STUDYMATE_API_BASE_URL = <?= json_encode(base_url_path() . '/api', JSON_UNESCAPED_SLASHES) ?>;
      tailwind = {
        config: {
          darkMode: "class",
          theme: {
            extend: {
              fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
              }
            }
          }
        }
      };
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <?php
      $manifestPath = BASE_PATH . '/public/build/react/.vite/manifest.json';
      $manifest = file_exists($manifestPath)
        ? json_decode(file_get_contents($manifestPath), true)
        : [];
      $entry = $manifest['src/main.jsx'] ?? null;
    ?>
    <?php if ($entry && ! empty($entry['css'])): ?>
      <?php foreach ($entry['css'] as $cssFile): ?>
        <link rel="stylesheet" href="<?= public_url_path() . '/build/react/' . $cssFile ?>">
      <?php endforeach; ?>
    <?php endif; ?>
  </head>
  <body>
    <div id="root"></div>

    <?php if ($entry): ?>
      <script type="module" src="<?= public_url_path() . '/build/react/' . $entry['file'] ?>"></script>
    <?php else: ?>
      <div style="font-family: Inter, Arial, sans-serif; padding: 32px;">
        <h1>React app chưa được build</h1>
        <p>Chạy <code>npm install</code> rồi <code>npm run build</code> trong thư mục dự án.</p>
      </div>
    <?php endif; ?>
  </body>
</html>
