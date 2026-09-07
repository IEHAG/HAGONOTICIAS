<?php
/**
 * STATS API — Estadísticas del dashboard
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

require_once __DIR__ . '/config.php';

$user = requireAuth();
$db   = getDB();

// Total ediciones
$totalEdiciones = (int) $db->query('SELECT COUNT(*) FROM ediciones')->fetchColumn();

// Ediciones activas
$activas = (int) $db->query('SELECT COUNT(*) FROM ediciones WHERE activo = 1')->fetchColumn();

// Total vistas
$totalVistas = (int) $db->query('SELECT COALESCE(SUM(vistas), 0) FROM ediciones')->fetchColumn();

// Total descargas
$totalDescargas = (int) $db->query('SELECT COALESCE(SUM(descargas), 0) FROM ediciones')->fetchColumn();

// Última edición
$ultima = $db->query('SELECT titulo, fecha_publicacion FROM ediciones ORDER BY fecha_publicacion DESC LIMIT 1')->fetch();

// Ediciones por año
$stmt = $db->query('SELECT anio, COUNT(*) as total FROM ediciones WHERE anio IS NOT NULL GROUP BY anio ORDER BY anio DESC');
$porAnio = $stmt->fetchAll();

// Últimos logs
$stmt = $db->query('SELECT l.accion, l.detalles, l.created_at, u.username FROM logs_actividad l LEFT JOIN usuarios u ON u.id = l.usuario_id ORDER BY l.created_at DESC LIMIT 10');
$logsRecientes = $stmt->fetchAll();

jsonResponse([
    'total_ediciones'  => $totalEdiciones,
    'ediciones_activas' => $activas,
    'total_vistas'     => $totalVistas,
    'total_descargas'  => $totalDescargas,
    'ultima_edicion'   => $ultima,
    'por_anio'         => $porAnio,
    'logs_recientes'   => $logsRecientes,
]);
