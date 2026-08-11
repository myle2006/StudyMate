<?php

declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/core/helpers.php';

spl_autoload_register(function (string $class): void {
    $locations = [
        BASE_PATH . '/core/' . $class . '.php',
        BASE_PATH . '/models/' . $class . '.php',
        BASE_PATH . '/services/' . $class . '.php',
    ];

    foreach ($locations as $file) {
        if (file_exists($file)) {
            require $file;
            return;
        }
    }
});

$provisioner = new RoadmapTemplateProvisioner();
$actions = $provisioner->ensureForAllCurrentSubjects();
$coverage = $provisioner->coverageReport();

echo json_encode([
    'processed_subject_count' => count($coverage['coverage']),
    'actions' => $actions,
    ...$coverage,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
