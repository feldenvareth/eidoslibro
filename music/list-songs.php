<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$directory = __DIR__ . DIRECTORY_SEPARATOR . 'Songs';
$allowedExtensions = [
    'mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'flac', 'webm'
];

if (!is_dir($directory) || !is_readable($directory)) {
    http_response_code(500);
    echo json_encode(
        ['error' => 'No se puede leer la carpeta Music/Songs.', 'tracks' => []],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

$entries = scandir($directory);
if ($entries === false) {
    http_response_code(500);
    echo json_encode(
        ['error' => 'No se ha podido examinar la carpeta de canciones.', 'tracks' => []],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

$tracks = [];

foreach ($entries as $entry) {
    if ($entry === '.' || $entry === '..' || str_starts_with($entry, '.')) {
        continue;
    }

    $fullPath = $directory . DIRECTORY_SEPARATOR . $entry;
    if (!is_file($fullPath) || !is_readable($fullPath)) {
        continue;
    }

    $extension = strtolower((string) pathinfo($entry, PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        continue;
    }

    $baseName = (string) pathinfo($entry, PATHINFO_FILENAME);
    $title = preg_replace('/[_-]+/u', ' ', $baseName);
    $title = preg_replace('/\s+/u', ' ', trim((string) $title));

    $tracks[] = [
        'title' => $title !== '' ? $title : $baseName,
        'file' => $entry
    ];
}

usort(
    $tracks,
    static fn(array $a, array $b): int => strnatcasecmp($a['title'], $b['title'])
);

echo json_encode(
    [
        'tracks' => $tracks,
        'count' => count($tracks),
        'generatedAt' => gmdate('c')
    ],
    JSON_UNESCAPED_UNICODE
    | JSON_UNESCAPED_SLASHES
    | JSON_INVALID_UTF8_SUBSTITUTE
);
