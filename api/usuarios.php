<?php
/**
 * USUARIOS API — Gestión de usuarios del panel (solo admin)
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

require_once __DIR__ . '/config.php';

$user   = requireAdmin();
$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

$publicFields = 'id, username, email, nombre_completo, rol, activo, ultimo_acceso, created_at, updated_at';

switch ($method) {

    // ── GET: Listar usuarios ──
    case 'GET':
        if ($id) {
            $stmt = $db->prepare("SELECT {$publicFields} FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) jsonResponse(['error' => 'Usuario no encontrado'], 404);
            jsonResponse($row);
        }

        $rows = $db->query("SELECT {$publicFields} FROM usuarios ORDER BY rol ASC, username ASC")->fetchAll();
        jsonResponse(['usuarios' => $rows, 'total' => count($rows)]);
        break;

    // ── POST: Crear usuario ──
    case 'POST':
        $input = getRequestBody();

        $username = trim($input['username'] ?? '');
        $email    = trim($input['email'] ?? '');
        $password = (string) ($input['password'] ?? '');
        $nombre   = trim($input['nombre_completo'] ?? '');
        $rol      = ($input['rol'] ?? 'editor') === 'admin' ? 'admin' : 'editor';
        $activo   = isset($input['activo']) ? (int) (bool) $input['activo'] : 1;

        if ($username === '' || $email === '' || $password === '') {
            jsonResponse(['error' => 'Usuario, correo y contraseña son requeridos'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['error' => 'Correo electrónico inválido'], 400);
        }
        if (strlen($password) < 8) {
            jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres'], 400);
        }

        try {
            $stmt = $db->prepare('INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol, activo) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $username,
                $email,
                password_hash($password, PASSWORD_BCRYPT),
                $nombre,
                $rol,
                $activo,
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                jsonResponse(['error' => 'El usuario o correo ya existen'], 409);
            }
            throw $e;
        }

        $newId = (int) $db->lastInsertId();
        logActividad($user['id'], 'crear_usuario', json_encode(['id' => $newId, 'username' => $username, 'rol' => $rol]));

        $stmt = $db->prepare("SELECT {$publicFields} FROM usuarios WHERE id = ?");
        $stmt->execute([$newId]);
        jsonResponse($stmt->fetch(), 201);
        break;

    // ── PUT: Actualizar usuario ──
    case 'PUT':
        if (!$id) jsonResponse(['error' => 'ID requerido'], 400);

        $stmt = $db->prepare('SELECT * FROM usuarios WHERE id = ?');
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) jsonResponse(['error' => 'Usuario no encontrado'], 404);

        $input  = getRequestBody();

        // Evitar que el admin se quite a sí mismo el rol o se desactive
        if ($id === (int) $user['id']) {
            if (isset($input['rol']) && $input['rol'] !== 'admin') {
                jsonResponse(['error' => 'No puedes quitarte tu propio rol de administrador'], 400);
            }
            if (array_key_exists('activo', $input) && !(int) $input['activo']) {
                jsonResponse(['error' => 'No puedes desactivar tu propia cuenta'], 400);
            }
        }

        $fields = [];
        $params = [];

        foreach (['email', 'nombre_completo', 'rol', 'activo'] as $field) {
            if (!array_key_exists($field, $input)) continue;
            if ($field === 'email' && !filter_var($input[$field], FILTER_VALIDATE_EMAIL)) {
                jsonResponse(['error' => 'Correo electrónico inválido'], 400);
            }
            if ($field === 'rol') {
                $fields[] = 'rol = ?';
                $params[] = $input[$field] === 'admin' ? 'admin' : 'editor';
                continue;
            }
            $fields[] = "{$field} = ?";
            $params[] = $input[$field];
        }

        // Cambio de contraseña opcional
        if (!empty($input['password'])) {
            if (strlen($input['password']) < 8) {
                jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres'], 400);
            }
            $fields[] = 'password_hash = ?';
            $params[] = password_hash($input['password'], PASSWORD_BCRYPT);
            $fields[] = 'intentos_fallidos = 0';
            $fields[] = 'bloqueado_hasta = NULL';
        }

        if (empty($fields)) jsonResponse(['error' => 'Sin campos para actualizar'], 400);

        $params[] = $id;
        try {
            $stmt = $db->prepare('UPDATE usuarios SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($params);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                jsonResponse(['error' => 'El correo ya está en uso por otro usuario'], 409);
            }
            throw $e;
        }

        logActividad($user['id'], 'editar_usuario', json_encode(['id' => $id, 'username' => $target['username']]));

        $stmt = $db->prepare("SELECT {$publicFields} FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse($stmt->fetch());
        break;

    // ── DELETE: Eliminar usuario ──
    case 'DELETE':
        if (!$id) jsonResponse(['error' => 'ID requerido'], 400);
        if ($id === (int) $user['id']) jsonResponse(['error' => 'No puedes eliminar tu propia cuenta'], 400);

        $stmt = $db->prepare('SELECT * FROM usuarios WHERE id = ?');
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) jsonResponse(['error' => 'Usuario no encontrado'], 404);

        if ($target['rol'] === 'admin') {
            $admins = (int) $db->query("SELECT COUNT(*) FROM usuarios WHERE rol = 'admin' AND activo = 1")->fetchColumn();
            if ($admins <= 1) {
                jsonResponse(['error' => 'Debe existir al menos un administrador activo'], 400);
            }
        }

        $stmt = $db->prepare('DELETE FROM usuarios WHERE id = ?');
        $stmt->execute([$id]);

        logActividad($user['id'], 'eliminar_usuario', json_encode(['id' => $id, 'username' => $target['username']]));

        jsonResponse(['mensaje' => 'Usuario eliminado']);
        break;

    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}
