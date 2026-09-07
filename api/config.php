<?php
/**
 * CONFIGURACIÓN — HAGO Noticias
 * Institución Educativa Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

// ── Base de datos ──
define('DB_HOST', 'localhost');
define('DB_NAME', 'hagonoticias');
define('DB_USER', 'root');
define('DB_PASS', '');           // XAMPP default sin contraseña
define('DB_CHARSET', 'utf8mb4');

// ── Seguridad ──
define('SESSION_LIFETIME', 7200);        // 2 horas
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900);       // 15 minutos
define('CSRF_TOKEN_NAME', 'hago_csrf');

// ── Upload ──
define('MAX_PDF_SIZE', 52428800);        // 50 MB
define('MAX_IMAGE_SIZE', 2097152);       // 2 MB
define('UPLOAD_DIR', dirname(__DIR__) . '/admin/uploads/');
define('UPLOAD_PDF_DIR', UPLOAD_DIR . 'pdfs/');
define('UPLOAD_THUMB_DIR', UPLOAD_DIR . 'thumbnails/');
define('ALLOWED_PDF_TYPES', ['application/pdf']);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// ── Rutas ──
define('BASE_URL', dirname($_SERVER['SCRIPT_NAME']));
define('ROOT_PATH', dirname(__DIR__));

// ── Headers de seguridad ──
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// ── Conexión PDO ──
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error de conexión a la base de datos']);
            exit;
        }
    }
    return $pdo;
}

// ── Helpers ──
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getRequestBody(): array {
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}

function sanitizeInput(string $input): string {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function generateCSRFToken(): string {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

function verifyCSRFToken(string $token): bool {
    if (session_status() === PHP_SESSION_NONE) session_start();
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

function requireAuth(): array {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['user_id'])) {
        jsonResponse(['error' => 'No autenticado'], 401);
    }
    // Verificar expiración de sesión
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > SESSION_LIFETIME) {
        session_destroy();
        jsonResponse(['error' => 'Sesión expirada'], 401);
    }
    return [
        'id'       => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'rol'      => $_SESSION['rol'],
    ];
}

function logActividad(int $userId, string $accion, string $detalles = ''): void {
    try {
        $db = getDB();
        $stmt = $db->prepare('INSERT INTO logs_actividad (usuario_id, accion, detalles, ip_address) VALUES (?, ?, ?, ?)');
        $stmt->execute([$userId, $accion, $detalles, $_SERVER['REMOTE_ADDR'] ?? '']);
    } catch (Exception $e) {
        // Silenciar errores de log
    }
}

// ── Crear directorios de upload si no existen ──
foreach ([UPLOAD_DIR, UPLOAD_PDF_DIR, UPLOAD_THUMB_DIR] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}
