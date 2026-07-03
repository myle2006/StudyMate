<?php

class Controller
{
    protected function view(string $view, array $data = [], string $layout = 'main'): void
    {
        $viewFile = BASE_PATH . '/views/' . str_replace('.', '/', $view) . '.php';
        $layoutFile = BASE_PATH . '/views/layouts/' . $layout . '.php';

        if (! file_exists($viewFile)) {
            throw new RuntimeException("View not found: {$view}");
        }

        extract($data, EXTR_SKIP);

        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        if ($layout === '') {
            echo $content;
            return;
        }

        require $layoutFile;
    }

    protected function json(array $payload, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    protected function input(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);

        return is_array($data) ? $data : [];
    }

    protected function currentUser(): ?array
    {
        return AuthMiddleware::user();
    }
}
