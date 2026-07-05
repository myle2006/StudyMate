<?php

class Router
{
    private array $routes = [];

    public function get(string $uri, array $action, array $middlewares = []): void
    {
        $this->add('GET', $uri, $action, $middlewares);
    }

    public function post(string $uri, array $action, array $middlewares = []): void
    {
        $this->add('POST', $uri, $action, $middlewares);
    }

    public function put(string $uri, array $action, array $middlewares = []): void
    {
        $this->add('PUT', $uri, $action, $middlewares);
    }

    public function delete(string $uri, array $action, array $middlewares = []): void
    {
        $this->add('DELETE', $uri, $action, $middlewares);
    }

    public function dispatch(string $method, string $requestUri): void
    {
        if ($method === 'OPTIONS') {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            http_response_code(204);
            return;
        }

        $path = parse_url($requestUri, PHP_URL_PATH) ?: '/';
        $base = base_url_path();

        if ($base !== '' && strncmp($path, $base, strlen($base)) === 0) {
            $path = substr($path, strlen($base)) ?: '/';
        }

        $path = $this->normalize($path);
        $matchedRoute = $this->match($method, $path);

        if ($matchedRoute === null) {
            http_response_code(404);
            if (str_starts_with($path, '/api/')) {
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Không tìm thấy API.',
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo '404 - Page not found';
            return;
        }

        try {
            foreach ($matchedRoute['middlewares'] as $middlewareDefinition) {
                [$middlewareClass, $arguments] = $this->parseMiddleware($middlewareDefinition);
                $middleware = new $middlewareClass();

                if ($middleware->handle(...$arguments) === false) {
                    return;
                }
            }

            $action = $matchedRoute['action'];
            [$controllerClass, $methodName] = $action;
            $controller = new $controllerClass();
            $controller->{$methodName}(...$matchedRoute['params']);
        } catch (Throwable $exception) {
            $this->handleException($exception, $path);
        }
    }

    private function normalize(string $uri): string
    {
        $uri = '/' . trim($uri, '/');

        return $uri === '//' ? '/' : $uri;
    }

    private function add(string $method, string $uri, array $action, array $middlewares = []): void
    {
        $uri = $this->normalize($uri);
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '([^/]+)', $uri);

        $this->routes[$method][] = [
            'uri' => $uri,
            'pattern' => '#^' . $pattern . '$#',
            'action' => $action,
            'middlewares' => $middlewares,
        ];
    }

    private function match(string $method, string $path): ?array
    {
        foreach ($this->routes[$method] ?? [] as $route) {
            if (! preg_match($route['pattern'], $path, $matches)) {
                continue;
            }

            array_shift($matches);
            $route['params'] = $matches;

            return $route;
        }

        return null;
    }

    private function parseMiddleware(string|array $middlewareDefinition): array
    {
        if (is_string($middlewareDefinition)) {
            return [$middlewareDefinition, []];
        }

        $class = $middlewareDefinition[0] ?? null;
        $arguments = $middlewareDefinition[1] ?? [];

        if (! is_array($arguments)) {
            $arguments = [$arguments];
        }

        return [$class, $arguments];
    }

    private function handleException(Throwable $exception, string $path): void
    {
        error_log($exception);
        http_response_code(500);

        if (str_starts_with($path, '/api/')) {
            header('Content-Type: application/json; charset=utf-8');

            $payload = [
                'success' => false,
                'message' => 'Máy chủ gặp lỗi khi xử lý yêu cầu.',
            ];

            if (app_config('debug', false)) {
                $payload['debug'] = [
                    'type' => $exception::class,
                    'message' => $exception->getMessage(),
                    'file' => basename($exception->getFile()),
                    'line' => $exception->getLine(),
                ];
            }

            echo json_encode($payload, JSON_UNESCAPED_UNICODE);
            return;
        }

        echo app_config('debug', false)
            ? 'Server error: ' . e($exception->getMessage())
            : '500 - Server error';
    }
}
