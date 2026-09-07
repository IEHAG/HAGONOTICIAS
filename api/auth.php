<?php
/**
 * AUTH API — Login / Logout / Session Check
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ── GET: Verificar sesión ──
    case 'GET':
        if (!empty($_SESSION['user_id'])) {
            // Verificar expiración
            if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > SESSION_LIFETIME) {
                session_destroy();
                jsonResponse(['autenticado' => false], 200);
            }
            jsonResponse([
                'autenticado' => true,
                'user' => [
                    'id'       => $_SESSION['user_id'],
                    'username' => $_SESSION['username'],
                    'rol'      => $_SESSION['rol'],
                    'nombre'   => $_SESSION['nombre'] ?? '',
                ]
            ]);
        }
        jsonResponse(['autenticado' => false]);
        break;

    // ── POST: Login ──
    case 'POST':
        $input = getRequestBody();
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            jsonResponse(['error' => 'Usuario y contraseña son requeridos'], 400);
        }

        $db = getDB();

        // Buscar usuario
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE (username = ? OR email = ?) AND activo = 1');
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(['error' => 'Credenciales inválidas'], 401);
        }

        // Verificar bloqueo por intentos fallidos
        if ($user['bloqueado_hasta'] && strtotime($user['bloqueado_hasta']) > time()) {
            $minutos = ceil((strtotime($user['bloqueado_hasta']) - time()) / 60);
            jsonResponse(['error' => "Cuenta bloqueada. Intenta de nuevo en {$minutos} minutos."], 423);
        }

        // Verificar contraseña
        if (!password_verify($password, $user['password_hash'])) {
            // Incrementar intentos fallidos
            $intentos = $user['intentos_fallidos'] + 1;
            $bloqueo = null;
            if ($intentos >= MAX_LOGIN_ATTEMPTS) {
                $bloqueo = date('Y-m-d H:i:s', time() + LOGIN_LOCKOUT_TIME);
                $intentos = 0;
            }
            $stmt = $db->prepare('UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?');
            $stmt->execute([$intentos, $bloqueo, $user['id']]);
            logActividad($user['id'], 'login_fallido', "Intento #{$intentos}");
            jsonResponse(['error' => 'Credenciales inválidas'], 401);
        }

        // Login exitoso — resetear intentos
        $stmt = $db->prepare('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = NOW() WHERE id = ?');
        $stmt->execute([$user['id']]);

        // Crear sesión
        $_SESSION['user_id']    = $user['id'];
        $_SESSION['username']   = $user['username'];
        $_SESSION['rol']        = $user['rol'];
        $_SESSION['nombre']     = $user['nombre_completo'];
        $_SESSION['login_time'] = time();

        logActividad($user['id'], 'login_exitoso');

        jsonResponse([
            'mensaje' => 'Inicio de sesión exitoso',
            'user' => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'rol'      => $user['rol'],
                'nombre'   => $user['nombre_completo'],
            ]
        ]);
        break;

    // ── DELETE: Logout ──
    case 'DELETE':
        $userId = $_SESSION['user_id'] ?? null;
        if ($userId) {
            logActividad($userId, 'logout');
        }
        session_destroy();
        jsonResponse(['mensaje' => 'Sesión cerrada']);
        break;

    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}
