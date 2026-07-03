<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= e($title ?? app_config('name')) ?></title>
    <meta name="description" content="<?= e($description ?? '') ?>" />
    <script>
      tailwind = {
        config: {
          darkMode: "class",
          theme: {
            extend: {
              fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
              },
              boxShadow: {
                glow: "0 24px 80px rgba(67, 97, 238, 0.18)",
              },
            },
          },
        },
      };
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="<?= asset('css/main.css') ?>" />
  </head>
  <body class="bg-white text-slate-950 antialiased dark:bg-slate-950 dark:text-white">
