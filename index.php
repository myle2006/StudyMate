<?php

define('BASE_PATH', __DIR__);

require BASE_PATH . '/core/helpers.php';

date_default_timezone_set(app_config('timezone', 'Asia/Bangkok'));

spl_autoload_register(function (string $class): void {
    $locations = [
        BASE_PATH . '/core/' . $class . '.php',
        BASE_PATH . '/controllers/' . $class . '.php',
        BASE_PATH . '/models/' . $class . '.php',
        BASE_PATH . '/services/' . $class . '.php',
        BASE_PATH . '/validations/' . $class . '.php',
        BASE_PATH . '/middlewares/' . $class . '.php',
    ];

    foreach ($locations as $file) {
        if (file_exists($file)) {
            require $file;
            return;
        }
    }
});

$router = new Router();

require BASE_PATH . '/routes/web.php';

if (file_exists(BASE_PATH . '/routes/api.php')) {
    require BASE_PATH . '/routes/api.php';
}

$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
