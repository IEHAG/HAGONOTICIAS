<?php
/**
 * EDICIONES API — CRUD completo
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

require_once __DIR__ . '/config.php';

$method  = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? null;
$id      = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db      = getDB();

switch ($method) {

    // ── GET: Listar o buscar ediciones ──
    case 'GET':
        // Si se pide una edición específica
        if ($id) {
            $stmt = $db->prepare('SELECT * FROM ediciones WHERE id = ?');
            $stmt->execute([$id]);
            $edicion = $stmt->fetch();
            if (!$edicion) jsonResponse(['error' => 'Edición no encontrada'], 404);
            jsonResponse($edicion);
        }

        // Parámetros de filtro
        $categoria = $_GET['categoria'] ?? null;
        $anio      = isset($_GET['anio']) ? (int) $_GET['anio'] : null;
        $buscar    = $_GET['buscar'] ?? null;
        $page      = max(1, (int) ($_GET['page'] ?? 1));
        $limit     = min(50, max(1, (int) ($_GET['limit'] ?? 12)));
        $offset    = ($page - 1) * $limit;
        $soloActivos = isset($_GET['solo_activos']) ? (bool) $_GET['solo_activos'] : true;

        $where  = [];
        $params = [];

        if ($soloActivos) {
            $where[]  = 'activo = 1';
        }
        if ($categoria) {
            $where[]  = 'categoria = ?';
            $params[] = $categoria;
        }
        if ($anio) {
            $where[]  = 'anio = ?';
            $params[] = $anio;
        }
        if ($buscar) {
            $where[]  = '(titulo LIKE ? OR autor LIKE ? OR descripcion LIKE ?)';
            $like = "%{$buscar}%";
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        // Contar total
        $countSQL = "SELECT COUNT(*) FROM ediciones {$whereSQL}";
        $stmt = $db->prepare($countSQL);
        $stmt->execute($params);
        $total = (int) $stmt->fetchColumn();

        // Obtener datos
        $sql = "SELECT * FROM ediciones {$whereSQL} ORDER BY orden_visualizacion ASC, fecha_publicacion DESC LIMIT {$limit} OFFSET {$offset}";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $ediciones = $stmt->fetchAll();

        jsonResponse([
            'ediciones' => $ediciones,
            'total'     => $total,
            'page'      => $page,
            'pages'     => (int) ceil($total / $limit),
        ]);
        break;

    // ── POST: Crear edición ──
    case 'POST':
        $user = requireAuth();
        $input = getRequestBody();

        // Validaciones
        $titulo  = trim($input['titulo'] ?? '');
        $pdf_url = trim($input['pdf_url'] ?? '');

        if (empty($titulo))      jsonResponse(['error' => 'El título es requerido'], 400);
        if (empty($pdf_url))     jsonResponse(['error' => 'La URL del PDF es requerida'], 400);

        $stmt = $db->prepare('INSERT INTO ediciones (titulo, autor, categoria, anio, descripcion, pdf_url, thumbnail_url, fecha_publicacion, activo, orden_visualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $titulo,
            trim($input['autor'] ?? null),
            trim($input['categoria'] ?? null),
            $input['anio'] ?? date('Y'),
            trim($input['descripcion'] ?? null),
            $pdf_url,
            trim($input['thumbnail_url'] ?? null),
            $input['fecha_publicacion'] ?? date('Y-m-d'),
            $input['activo'] ?? 1,
            $input['orden_visualizacion'] ?? 0,
        ]);

        $newId = (int) $db->lastInsertId();
        logActividad($user['id'], 'crear_edicion', json_encode(['id' => $newId, 'titulo' => $titulo]));

        $stmt = $db->prepare('SELECT * FROM ediciones WHERE id = ?');
        $stmt->execute([$newId]);
        jsonResponse($stmt->fetch(), 201);
        break;

    // ── PUT: Actualizar edición ──
    case 'PUT':
        $user = requireAuth();
        if (!$id) jsonResponse(['error' => 'ID requerido'], 400);

        // Verificar que existe
        $stmt = $db->prepare('SELECT id FROM ediciones WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) jsonResponse(['error' => 'Edición no encontrada'], 404);

        $input = getRequestBody();
        $fields = [];
        $params = [];

        $allowed = ['titulo', 'autor', 'categoria', 'anio', 'descripcion', 'pdf_url', 'thumbnail_url', 'fecha_publicacion', 'activo', 'orden_visualizacion', 'vistas', 'descargas'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $input)) {
                $fields[] = "{$field} = ?";
                $params[] = $input[$field];
            }
        }

        if (empty($fields)) jsonResponse(['error' => 'Sin campos para actualizar'], 400);

        $params[] = $id;
        $sql = 'UPDATE ediciones SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        logActividad($user['id'], 'editar_edicion', json_encode(['id' => $id]));

        $stmt = $db->prepare('SELECT * FROM ediciones WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse($stmt->fetch());
        break;

    // ── DELETE: Eliminar edición ──
    case 'DELETE':
        $user = requireAuth();
        if (!$id) jsonResponse(['error' => 'ID requerido'], 400);

        $stmt = $db->prepare('SELECT * FROM ediciones WHERE id = ?');
        $stmt->execute([$id]);
        $edicion = $stmt->fetch();
        if (!$edicion) jsonResponse(['error' => 'Edición no encontrada'], 404);

        $stmt = $db->prepare('DELETE FROM ediciones WHERE id = ?');
        $stmt->execute([$id]);

        logActividad($user['id'], 'eliminar_edicion', json_encode(['id' => $id, 'titulo' => $edicion['titulo']]));

        jsonResponse(['mensaje' => 'Edición eliminada']);
        break;

    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}
