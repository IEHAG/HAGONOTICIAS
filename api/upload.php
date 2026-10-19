<?php
/**
 * UPLOAD API — Subida de archivos (PDF + imágenes)
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

require_once __DIR__ . '/config.php';

$user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

if (empty($_FILES['file'])) {
    jsonResponse(['error' => 'No se envió ningún archivo'], 400);
}

$file    = $_FILES['file'];
$error   = $file['error'];
$size    = (int) $file['size'];
$tmpName = $file['tmp_name'];

if ($error !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'Archivo excede el tamaño máximo del servidor',
        UPLOAD_ERR_FORM_SIZE  => 'Archivo excede el tamaño máximo del formulario',
        UPLOAD_ERR_PARTIAL    => 'El archivo fue parcialmente subido',
        UPLOAD_ERR_NO_FILE    => 'No se seleccionó ningún archivo',
        UPLOAD_ERR_NO_TMP_DIR => 'Falta directorio temporal',
        UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo',
    ];
    jsonResponse(['error' => $errors[$error] ?? 'Error desconocido al subir archivo'], 400);
}

// ── Validación REAL del contenido (no confiar en el tipo enviado por el navegador) ──
$realMime = '';
if (function_exists('finfo_open') && is_uploaded_file($tmpName)) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $realMime = finfo_file($finfo, $tmpName) ?: '';
    finfo_close($finfo);
}
if (!$realMime) {
    $realMime = $file['type'] ?? '';
}

$extOriginal = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

$isPDF   = $realMime === 'application/pdf';
$isImage = in_array($realMime, ALLOWED_IMAGE_TYPES, true);

if (!$isPDF && !$isImage) {
    jsonResponse(['error' => "Tipo de archivo no permitido: {$realMime}"], 400);
}

// Extensión permitida y coherente con el contenido real
if ($isPDF && $extOriginal !== 'pdf') {
    jsonResponse(['error' => 'El archivo no es un PDF válido'], 400);
}
$imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
if ($isImage && !in_array($extOriginal, $imageExts, true)) {
    jsonResponse(['error' => 'Extensión de imagen no permitida'], 400);
}

if ($isPDF && $size > MAX_PDF_SIZE) {
    jsonResponse(['error' => 'El PDF excede 50 MB'], 400);
}
if ($isImage && $size > MAX_IMAGE_SIZE) {
    jsonResponse(['error' => 'La imagen excede 2 MB'], 400);
}

// Generar nombre seguro
$ext    = $isPDF ? 'pdf' : ($extOriginal === 'jpeg' ? 'jpg' : $extOriginal);
$prefix = $isPDF ? 'pdf' : 'thumb';
$nombre = $prefix . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

// Determinar destino
$destino      = $isPDF ? UPLOAD_PDF_DIR : UPLOAD_THUMB_DIR;
$rutaCompleta = $destino . $nombre;

if (!is_dir($destino)) {
    @mkdir($destino, 0755, true);
}

if (!move_uploaded_file($tmpName, $rutaCompleta)) {
    jsonResponse(['error' => 'Error al guardar el archivo'], 500);
}

// URL relativa a la raíz del sitio (admin/uploads/...)
$urlRelativa = 'admin/uploads/' . ($isPDF ? 'pdfs/' : 'thumbnails/') . $nombre;

logActividad($user['id'], 'subir_archivo', json_encode(['archivo' => $nombre, 'tipo' => $isPDF ? 'pdf' : 'imagen', 'size' => $size]));

jsonResponse([
    'mensaje' => 'Archivo subido correctamente',
    'url'     => $urlRelativa,
    'nombre'  => $nombre,
    'tipo'    => $isPDF ? 'pdf' : 'imagen',
    'size'    => $size,
], 201);
