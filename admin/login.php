<?php
/**
 * LOGIN — Panel Administrativo
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */
require_once __DIR__ . '/../api/config.php';
if (session_status() === PHP_SESSION_NONE) session_start();

// Si ya está autenticado, redirigir
if (!empty($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $error = 'Usuario y contraseña son requeridos';
    } else {
        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE (username = ? OR email = ?) AND activo = 1');
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();

        if (!$user) {
            $error = 'Credenciales inválidas';
        } elseif ($user['bloqueado_hasta'] && strtotime($user['bloqueado_hasta']) > time()) {
            $minutos = ceil((strtotime($user['bloqueado_hasta']) - time()) / 60);
            $error = "Cuenta bloqueada. Intenta de nuevo en {$minutos} minutos.";
        } elseif (!password_verify($password, $user['password_hash'])) {
            $intentos = $user['intentos_fallidos'] + 1;
            $bloqueo = null;
            if ($intentos >= MAX_LOGIN_ATTEMPTS) {
                $bloqueo = date('Y-m-d H:i:s', time() + LOGIN_LOCKOUT_TIME);
                $intentos = 0;
            }
            $stmt = $db->prepare('UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?');
            $stmt->execute([$intentos, $bloqueo, $user['id']]);
            logActividad($user['id'], 'login_fallido', "Intento #{$intentos}");
            $error = 'Credenciales inválidas';
        } else {
            // Login exitoso
            $stmt = $db->prepare('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = NOW() WHERE id = ?');
            $stmt->execute([$user['id']]);

            session_regenerate_id(true);
            $_SESSION['user_id']    = $user['id'];
            $_SESSION['username']   = $user['username'];
            $_SESSION['rol']        = $user['rol'];
            $_SESSION['nombre']     = $user['nombre_completo'];
            $_SESSION['login_time'] = time();

            logActividad($user['id'], 'login_exitoso');
            header('Location: dashboard.php');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HAGO Noticias — Acceso Administrativo</title>
    <link rel="stylesheet" href="../css/admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <img src="../img/logo.png" alt="HAGO Noticias" class="login-logo">
                <h1>HAGO Noticias</h1>
                <p>Panel de Administración</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <?= htmlspecialchars($error) ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="" class="login-form" id="loginForm">
                <div class="form-group">
                    <label for="username"><i class="fas fa-user"></i> Usuario</label>
                    <input type="text" id="username" name="username" required
                           placeholder="Usuario o correo" autocomplete="username"
                           value="<?= htmlspecialchars($username ?? '') ?>">
                </div>

                <div class="form-group">
                    <label for="password"><i class="fas fa-lock"></i> Contraseña</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" required
                               placeholder="Contraseña" autocomplete="current-password">
                        <button type="button" class="toggle-password" onclick="togglePassword()" tabindex="-1">
                            <i class="fas fa-eye" id="passwordIcon"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-login" id="loginButton">
                    <span class="btn-text">Iniciar Sesión</span>
                    <span class="btn-loading" style="display:none">
                        <i class="fas fa-spinner fa-spin"></i> Verificando...
                    </span>
                </button>
            </form>

            <div class="login-footer">
                <a href="../index.html"><i class="fas fa-arrow-left"></i> Volver al portal</a>
            </div>
        </div>
    </div>

    <script>
    function togglePassword() {
        const input = document.getElementById('password');
        const icon  = document.getElementById('passwordIcon');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    document.getElementById('loginForm').addEventListener('submit', function() {
        const btn = document.getElementById('loginButton');
        btn.querySelector('.btn-text').style.display = 'none';
        btn.querySelector('.btn-loading').style.display = 'inline';
        btn.disabled = true;
    });
    </script>
</body>
</html>
