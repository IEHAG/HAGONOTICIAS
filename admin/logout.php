<?php
/**
 * LOGOUT — Cerrar sesión
 * HAGO Noticias — I.E. Héctor Abad Gómez
 */
require_once __DIR__ . '/../api/config.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (!empty($_SESSION['user_id'])) {
    logActividad($_SESSION['user_id'], 'logout');
}

session_destroy();
header('Location: login.php');
exit;
