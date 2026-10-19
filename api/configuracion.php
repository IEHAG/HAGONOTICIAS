<?php
/**
 * CONFIGURACIÓN API — Ajustes del sitio
 * GET  público  → ajustes visibles del portal
 * PUT  admin    → guardar ajustes
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

require_once __DIR__ . '/config.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

$whitelist = ['site_name', 'site_description', 'site_author', 'editions_per_page'];

switch ($method) {

    // ── GET: Ajustes públicos ──
    case 'GET':
        $placeholders = implode(',', array_fill(0, count($whitelist), '?'));
        $stmt = $db->prepare("SELECT clave, valor FROM configuracion WHERE clave IN ({$placeholders})");
        $stmt->execute($whitelist);

        $config = [];
        foreach ($stmt->fetchAll() as $row) {
            $config[$row['clave']] = $row['valor'];
        }
        jsonResponse(['config' => $config]);
        break;

    // ── PUT: Guardar ajustes (solo admin) ──
    case 'PUT':
        $user  = requireAdmin();
        $input = getRequestBody();

        $saved = [];
        $stmt  = $db->prepare('INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)');
        foreach ($whitelist as $clave) {
            if (!array_key_exists($clave, $input)) continue;
            $valor = trim((string) $input[$clave]);
            $stmt->execute([$clave, $valor]);
            $saved[$clave] = $valor;
        }

        if (empty($saved)) jsonResponse(['error' => 'Sin ajustes para guardar'], 400);

        logActividad($user['id'], 'editar_configuracion', json_encode(array_keys($saved)));
        jsonResponse(['mensaje' => 'Configuración guardada', 'config' => $saved]);
        break;

    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}
