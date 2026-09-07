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

$file     = $_FILES['file'];
$type     = $file['type'];
$size     = $file['size'];
$error    = $file['error'];
$tmpName  = $file['tmp_name'];

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

// Determinar tipo y validar
$isPDF     = in_array($type, ALLOWED_PDF_TYPES);
$isImage   = in_array($type, ALLOWED_IMAGE_TYPES);

if (!$isPDF && !$isImage) {
    jsonResponse(['error' => "Tipo de archivo no permitido: {$type}"], 400);
}

if ($isPDF && $size > MAX_PDF_SIZE) {
    jsonResponse(['error' => 'El PDF excede 50 MB'], 400);
}
if ($isImage && $size > MAX_IMAGE_SIZE) {
    jsonResponse(['error' => 'La imagen excede 2 MB'], 400);
}

// Generar nombre seguro
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$ext = strtolower($ext);
$prefix = $isPDF ? 'pdf' : 'thumb';
$nombre = $prefix . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

// Determinar destino
$destino = $isPDF ? UPLOAD_PDF_DIR : UPLOAD_THUMB_DIR;
$rutaCompleta = $destino . $nombre;

if (!move_uploaded_file($tmpName, $rutaCompleta)) {
    jsonResponse(['error' => 'Error al guardar el archivo'], 500);
}

// URL relativa
$urlRelativa = 'admin/uploads/' . ($isPDF ? 'pdfs/' : 'thumbnails/') . $nombre;

logActividad($user['id'], 'subir_archivo', json_encode(['archivo' => $nombre, 'tipo' => $isPDF ? 'pdf' : 'imagen', 'size' => $size]));

jsonResponse([
    'mensaje' => 'Archivo subido correctamente',
    'url'     => $urlRelativa,
    'nombre'  => $nombre,
    'tipo'    => $isPDF ? 'pdf' : 'imagen',
    'size'    => $size,
], 201);
