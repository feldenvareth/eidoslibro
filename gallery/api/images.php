<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$galleryRoot = realpath(__DIR__ . '/../images/gallery');
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

if ($galleryRoot === false || !is_dir($galleryRoot)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'images' => [],
        'message' => 'No se encuentra la carpeta images/gallery.'
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$images = [];
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($galleryRoot, FilesystemIterator::SKIP_DOTS)
);

foreach ($iterator as $fileInfo) {
    if (!$fileInfo->isFile() || $fileInfo->isLink()) {
        continue;
    }

    if (str_starts_with($fileInfo->getFilename(), '.')) {
        continue;
    }

    $extension = strtolower($fileInfo->getExtension());
    if (!in_array($extension, $allowedExtensions, true)) {
        continue;
    }

    $absolutePath = $fileInfo->getPathname();
    $relativePath = substr($absolutePath, strlen($galleryRoot) + 1);
    $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);

    // Codifica cada segmento, pero conserva las subcarpetas.
    $encodedPath = implode('/', array_map('rawurlencode', explode('/', $relativePath)));
    $modified = $fileInfo->getMTime();

    $images[] = [
        'url' => 'images/gallery/' . $encodedPath . '?v=' . $modified,
        'path' => $relativePath,
        'name' => pathinfo($fileInfo->getFilename(), PATHINFO_FILENAME),
        'modified' => $modified
    ];
}

usort($images, static function (array $a, array $b): int {
    return strnatcasecmp($a['path'], $b['path']);
});

echo json_encode([
    'ok' => true,
    'count' => count($images),
    'images' => $images
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
