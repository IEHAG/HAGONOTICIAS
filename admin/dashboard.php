<?php
/**
 * DASHBOARD — Panel Administrativo
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */
require_once __DIR__ . '/../api/config.php';
if (session_status() === PHP_SESSION_NONE) session_start();

// Verificar autenticación
if (empty($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

// Verificar expiración
if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > SESSION_LIFETIME) {
    session_destroy();
    header('Location: login.php');
    exit;
}

$user = [
    'id'       => $_SESSION['user_id'],
    'username' => $_SESSION['username'],
    'rol'      => $_SESSION['rol'],
    'nombre'   => $_SESSION['nombre'] ?? 'Administrador',
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HAGO Noticias — Dashboard</title>
    <link rel="stylesheet" href="../css/admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body class="admin-body">

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <img src="../img/logo.png" alt="HAGO" class="sidebar-logo">
            <span class="sidebar-title">HAGO Admin</span>
            <button class="sidebar-close" onclick="toggleSidebar()" aria-label="Cerrar menú">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <nav class="sidebar-nav">
            <a href="#" class="nav-link active" data-section="dashboard" onclick="showSection('dashboard')">
                <i class="fas fa-chart-line"></i> Dashboard
            </a>
            <a href="#" class="nav-link" data-section="ediciones" onclick="showSection('ediciones')">
                <i class="fas fa-newspaper"></i> Ediciones
            </a>
            <a href="#" class="nav-link" data-section="nueva" onclick="showSection('nueva')">
                <i class="fas fa-plus-circle"></i> Nueva Edición
            </a>
            <a href="#" class="nav-link" data-section="configuracion" onclick="showSection('configuracion')">
                <i class="fas fa-cog"></i> Configuración
            </a>
        </nav>
        <div class="sidebar-footer">
            <a href="../index.html" target="_blank"><i class="fas fa-external-link-alt"></i> Ver Portal</a>
            <a href="#" onclick="cerrarSesion()"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
        </div>
    </aside>

    <!-- Overlay móvil -->
    <div class="sidebar-overlay" id="overlay" onclick="toggleSidebar()"></div>

    <!-- Main content -->
    <main class="main-content">
        <!-- Top bar -->
        <header class="topbar">
            <button class="mobile-toggle" onclick="toggleSidebar()" aria-label="Abrir menú">
                <i class="fas fa-bars"></i>
            </button>
            <div class="topbar-info">
                <span class="topbar-greeting">Bienvenido, <strong><?= htmlspecialchars($user['nombre']) ?></strong></span>
                <span class="topbar-role badge badge-<?= $user['rol'] === 'admin' ? 'admin' : 'editor' ?>">
                    <?= ucfirst($user['rol']) ?>
                </span>
            </div>
            <div class="topbar-actions">
                <span class="topbar-date" id="currentDate"></span>
            </div>
        </header>

        <!-- Sección: Dashboard -->
        <section class="content-section active" id="section-dashboard">
            <h2 class="section-title"><i class="fas fa-chart-line"></i> Resumen</h2>
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-newspaper"></i></div>
                    <div class="stat-info">
                        <span class="stat-number" id="statTotal">—</span>
                        <span class="stat-label">Ediciones</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-eye"></i></div>
                    <div class="stat-info">
                        <span class="stat-number" id="statVistas">—</span>
                        <span class="stat-label">Vistas totales</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-download"></i></div>
                    <div class="stat-info">
                        <span class="stat-number" id="statDescargas">—</span>
                        <span class="stat-label">Descargas</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                    <div class="stat-info">
                        <span class="stat-number" id="statUltima">—</span>
                        <span class="stat-label">Última edición</span>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> Actividad reciente</h3>
                </div>
                <div class="card-body">
                    <div id="logsContainer" class="logs-list">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sección: Ediciones -->
        <section class="content-section" id="section-ediciones">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-newspaper"></i> Ediciones</h2>
                <button class="btn btn-primary" onclick="showSection('nueva')">
                    <i class="fas fa-plus"></i> Nueva Edición
                </button>
            </div>

            <div class="table-container">
                <table class="data-table" id="edicionesTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Título</th>
                            <th>Categoría</th>
                            <th>Año</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="edicionesBody">
                        <tr><td colspan="6" class="text-center text-muted">Cargando ediciones...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Sección: Nueva/Editar Edición -->
        <section class="content-section" id="section-nueva">
            <h2 class="section-title" id="formTitle"><i class="fas fa-plus-circle"></i> Nueva Edición</h2>

            <form id="edicionForm" class="card">
                <input type="hidden" id="edicionId" value="">

                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="edTitulo">Título *</label>
                        <input type="text" id="edTitulo" required placeholder="Ej: Edición # 7">
                    </div>

                    <div class="form-group">
                        <label for="edAutor">Autor / Descripción corta</label>
                        <input type="text" id="edAutor" placeholder="Ej: Día del estudiante">
                    </div>

                    <div class="form-group">
                        <label for="edCategoria">Categoría</label>
                        <select id="edCategoria">
                            <option value="#1">#1</option>
                            <option value="#2">#2</option>
                            <option value="#3">#3</option>
                            <option value="#4">#4</option>
                            <option value="#5">#5</option>
                            <option value="#6">#6</option>
                            <option value="#7">#7</option>
                            <option value="#8">#8</option>
                            <option value="#9">#9</option>
                            <option value="#10">#10</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="edAnio">Año</label>
                        <input type="number" id="edAnio" min="2020" max="2030" value="<?= date('Y') ?>">
                    </div>

                    <div class="form-group full-width">
                        <label for="edDescripcion">Descripción</label>
                        <textarea id="edDescripcion" rows="3" placeholder="Descripción de la edición"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="edPdfUrl">URL del PDF *</label>
                        <input type="text" id="edPdfUrl" required placeholder="pdf/EDICION7.pdf">
                        <small class="help-text">Ruta relativa al PDF (ej: pdf/EDICION7.pdf)</small>
                    </div>

                    <div class="form-group">
                        <label for="edThumbUrl">URL Thumbnail</label>
                        <input type="text" id="edThumbUrl" placeholder="URL de la imagen de portada">
                    </div>

                    <div class="form-group">
                        <label for="edFecha">Fecha de publicación</label>
                        <input type="date" id="edFecha" value="<?= date('Y-m-d') ?>">
                    </div>

                    <div class="form-group">
                        <label for="edOrden">Orden de visualización</label>
                        <input type="number" id="edOrden" min="0" value="0">
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="edActivo" checked> Activo
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" id="btnGuardar">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="limpiarFormulario()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </section>

        <!-- Sección: Configuración -->
        <section class="content-section" id="section-configuracion">
            <h2 class="section-title"><i class="fas fa-cog"></i> Configuración</h2>

            <div class="card">
                <div class="card-header">
                    <h3>Información del sitio</h3>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nombre del sitio</label>
                            <input type="text" id="cfgSiteName" value="HAGO Noticias">
                        </div>
                        <div class="form-group">
                            <label>Autor del desarrollo</label>
                            <input type="text" id="cfgAuthor" value="Ing. Víctor Cañola" disabled>
                        </div>
                        <div class="form-group full-width">
                            <label>Descripción</label>
                            <input type="text" id="cfgDescription" value="Periódico Institucional — I.E. Héctor Abad Gómez">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header">
                    <h3>Backup de datos</h3>
                </div>
                <div class="card-body">
                    <div class="backup-actions">
                        <button class="btn btn-primary" onclick="exportarBackup()">
                            <i class="fas fa-download"></i> Exportar Backup (JSON)
                        </button>
                        <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()">
                            <i class="fas fa-upload"></i> Importar Backup
                        </button>
                        <input type="file" id="importFile" accept=".json" style="display:none" onchange="importarBackup(event)">
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Modal de confirmación -->
    <div class="modal-overlay" id="confirmModal" style="display:none">
        <div class="modal-card">
            <h3><i class="fas fa-exclamation-triangle"></i> Confirmar eliminación</h3>
            <p id="confirmMessage">¿Estás seguro de eliminar esta edición?</p>
            <div class="modal-actions">
                <button class="btn btn-danger" id="confirmAction">Eliminar</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            </div>
        </div>
    </div>

    <!-- Toast notifications -->
    <div id="toastContainer" class="toast-container"></div>

    <script src="../js/admin.js"></script>
    <script>
        initDashboard();
    </script>
</body>
</html>
