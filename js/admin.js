/**
 * ADMIN.JS — Panel Administrativo
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 */

// ════════════════════════════════════════════════
//  VARIABLES GLOBALES
// ════════════════════════════════════════════════
const API_BASE = '../api';
let ediciones = [];
let usuarios = [];
let editandoId = null;

// ════════════════════════════════════════════════
//  INICIALIZACIÓN
// ════════════════════════════════════════════════
function initDashboard() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    cargarEstadisticas();
    cargarEdiciones();
    cargarLogs();
    cargarConfig();

    document.getElementById('edicionForm').addEventListener('submit', guardarEdicion);

    const usuarioForm = document.getElementById('usuarioForm');
    if (usuarioForm) usuarioForm.addEventListener('submit', guardarUsuario);

    const thumbInput = document.getElementById('edThumbUrl');
    if (thumbInput) thumbInput.addEventListener('input', actualizarPreviewThumb);
}

// ════════════════════════════════════════════════
//  NAVEGACIÓN
// ════════════════════════════════════════════════
function showSection(name) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const section = document.getElementById('section-' + name);
    const link    = document.querySelector(`[data-section="${name}"]`);

    if (section) section.classList.add('active');
    if (link)    link.classList.add('active');

    // Cerrar sidebar en móvil
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');

    // Recargar datos si es necesario
    if (name === 'dashboard') {
        cargarEstadisticas();
        cargarLogs();
    }
    if (name === 'ediciones') {
        cargarEdiciones();
    }
    if (name === 'usuarios') {
        cargarUsuarios();
    }
    if (name === 'configuracion') {
        cargarConfig();
    }
    if (name === 'nueva' && !editandoId) {
        document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Edición';
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
}

// ════════════════════════════════════════════════
//  API HELPERS
// ════════════════════════════════════════════════
async function apiRequest(endpoint, options = {}) {
    try {
        const resp = await fetch(`${API_BASE}/${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        const data = await resp.json();
        if (!resp.ok) {
            if (resp.status === 401) {
                window.location.href = 'login.php';
                return null;
            }
            throw new Error(data.error || 'Error del servidor');
        }
        return data;
    } catch (e) {
        showToast(e.message, 'error');
        return null;
    }
}

// ════════════════════════════════════════════════
//  ESTADÍSTICAS
// ════════════════════════════════════════════════
async function cargarEstadisticas() {
    const data = await apiRequest('stats.php');
    if (!data) return;

    document.getElementById('statTotal').textContent    = data.total_ediciones;
    document.getElementById('statVistas').textContent   = (data.total_vistas || 0).toLocaleString();
    document.getElementById('statDescargas').textContent = (data.total_descargas || 0).toLocaleString();
    document.getElementById('statUltima').textContent   = data.ultima_edicion?.titulo ?? '—';

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('statActivas',      data.ediciones_activas ?? '—');
    set('statDestacadas',   data.destacadas ?? '—');
    set('statProximamente', data.proximamente ?? '—');
    set('statUsuarios',     data.usuarios_activos ?? '—');

    renderPorAnio(data.por_anio || []);
    renderTopVistas(data.top_vistas || []);
}

function renderPorAnio(items) {
    const c = document.getElementById('porAnioContainer');
    if (!c) return;
    if (!items.length) { c.innerHTML = '<p class="text-muted">Sin datos</p>'; return; }
    const max = Math.max(...items.map(i => Number(i.total) || 0), 1);
    c.innerHTML = items.map(i => {
        const pct = Math.round((Number(i.total) / max) * 100);
        return `<div class="bar-row">
            <span class="bar-label">${escapeHtml(String(i.anio))}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
            <span class="bar-value">${i.total}</span>
        </div>`;
    }).join('');
}

function renderTopVistas(items) {
    const c = document.getElementById('topVistasContainer');
    if (!c) return;
    if (!items.length) { c.innerHTML = '<p class="text-muted">Sin datos</p>'; return; }
    c.innerHTML = items.map((i, idx) => `<div class="top-item">
        <span class="top-rank">${idx + 1}</span>
        <span class="top-title">${escapeHtml(i.titulo)}</span>
        <span class="top-metric"><i class="fas fa-eye"></i> ${Number(i.vistas || 0).toLocaleString()}</span>
    </div>`).join('');
}

// ════════════════════════════════════════════════
//  EDICIONES — CRUD
// ════════════════════════════════════════════════
async function cargarEdiciones() {
    const data = await apiRequest('ediciones.php?solo_activos=0&limit=200');
    if (!data) return;

    ediciones = data.ediciones;
    renderizarEdiciones();
}

function filtrarTablaEdiciones() {
    const q = (document.getElementById('buscarEdiciones')?.value || '').trim().toLowerCase();
    renderizarEdiciones(q);
}

function renderizarEdiciones(filtro = '') {
    const tbody = document.getElementById('edicionesBody');

    let lista = ediciones;
    if (filtro) {
        lista = ediciones.filter(e =>
            (e.titulo || '').toLowerCase().includes(filtro) ||
            (e.autor || '').toLowerCase().includes(filtro) ||
            (e.categoria || '').toLowerCase().includes(filtro)
        );
    }

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay ediciones registradas</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(e => `
        <tr>
            <td>${e.id}</td>
            <td>
                <div style="font-weight:500">${escapeHtml(e.titulo)}</div>
                ${e.autor ? `<small style="color:var(--admin-text-muted)">${escapeHtml(e.autor)}</small>` : ''}
            </td>
            <td><span class="badge badge-editor">${escapeHtml(e.categoria || '—')}</span></td>
            <td>${e.anio || '—'}</td>
            <td>
                <span class="status-badge ${e.activo ? 'status-active' : 'status-inactive'}">
                    ${e.activo ? 'Activo' : 'Inactivo'}
                </span>
                ${e.destacada ? '<span class="status-badge status-destacada"><i class="fas fa-star"></i> Destacada</span>' : ''}
                ${e.proximamente ? '<span class="status-badge status-proximamente"><i class="fas fa-hourglass-half"></i> Próximamente</span>' : ''}
            </td>
            <td>
                <div style="display:flex;gap:4px" class="row-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editarEdicion(${e.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="toggleActivo(${e.id})" title="${e.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas fa-${e.activo ? 'toggle-on' : 'toggle-off'}"></i>
                    </button>
                    <button class="btn btn-sm ${e.destacada ? 'btn-warning' : 'btn-secondary'}" onclick="toggleDestacada(${e.id})" title="${e.destacada ? 'Quitar de destacadas' : 'Destacar'}">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${e.id}, '${escapeHtml(e.titulo).replace(/'/g, "\\'")}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${e.pdf_url ? `<a href="../${e.pdf_url}" target="_blank" class="btn btn-sm btn-secondary" title="Ver PDF"><i class="fas fa-eye"></i></a>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

async function toggleActivo(id) {
    const ed = ediciones.find(e => e.id === id);
    if (!ed) return;
    const result = await apiRequest(`ediciones.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ activo: ed.activo ? 0 : 1 }),
    });
    if (result) {
        showToast(result.activo ? 'Edición activada' : 'Edición desactivada', 'success');
        cargarEdiciones();
    }
}

async function toggleDestacada(id) {
    const ed = ediciones.find(e => e.id === id);
    if (!ed) return;
    const result = await apiRequest(`ediciones.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ destacada: ed.destacada ? 0 : 1 }),
    });
    if (result) {
        showToast(result.destacada ? 'Añadida a destacadas' : 'Quitada de destacadas', 'success');
        cargarEdiciones();
    }
}

async function guardarEdicion(e) {
    e.preventDefault();

    const id       = document.getElementById('edicionId').value;
    const payload  = {
        titulo:              document.getElementById('edTitulo').value.trim(),
        autor:               document.getElementById('edAutor').value.trim(),
        categoria:           document.getElementById('edCategoria').value,
        anio:                parseInt(document.getElementById('edAnio').value) || null,
        descripcion:         document.getElementById('edDescripcion').value.trim(),
        pdf_url:             document.getElementById('edPdfUrl').value.trim(),
        thumbnail_url:       document.getElementById('edThumbUrl').value.trim(),
        fecha_publicacion:   document.getElementById('edFecha').value,
        orden_visualizacion: parseInt(document.getElementById('edOrden').value) || 0,
        activo:              document.getElementById('edActivo').checked ? 1 : 0,
        destacada:           document.getElementById('edDestacada').checked ? 1 : 0,
        proximamente:        document.getElementById('edProximamente').checked ? 1 : 0,
    };

    if (!payload.titulo || !payload.pdf_url) {
        showToast('Título y URL del PDF son requeridos', 'error');
        return;
    }

    const btn = document.getElementById('btnGuardar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    let result;
    if (id) {
        result = await apiRequest(`ediciones.php?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    } else {
        result = await apiRequest('ediciones.php', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Guardar';

    if (result) {
        showToast(id ? 'Edición actualizada' : 'Edición creada', 'success');
        limpiarFormulario();
        cargarEdiciones();
        cargarEstadisticas();
    }
}

function editarEdicion(id) {
    const ed = ediciones.find(e => e.id === id);
    if (!ed) return;

    editandoId = id;

    document.getElementById('edicionId').value      = ed.id;
    document.getElementById('edTitulo').value       = ed.titulo;
    document.getElementById('edAutor').value        = ed.autor || '';
    document.getElementById('edCategoria').value    = ed.categoria || '#1';
    document.getElementById('edAnio').value         = ed.anio || '';
    document.getElementById('edDescripcion').value  = ed.descripcion || '';
    document.getElementById('edPdfUrl').value       = ed.pdf_url;
    document.getElementById('edThumbUrl').value     = ed.thumbnail_url || '';
    document.getElementById('edFecha').value        = ed.fecha_publicacion || '';
    document.getElementById('edOrden').value        = ed.orden_visualizacion || 0;
    document.getElementById('edActivo').checked     = !!ed.activo;
    document.getElementById('edDestacada').checked  = !!ed.destacada;
    document.getElementById('edProximamente').checked = !!ed.proximamente;
    actualizarPreviewThumb();

    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Edición';
    showSection('nueva');
}

function confirmarEliminar(id, titulo) {
    const modal   = document.getElementById('confirmModal');
    const msg     = document.getElementById('confirmMessage');
    const action  = document.getElementById('confirmAction');

    msg.textContent = `¿Eliminar la edición "${titulo}"? Esta acción no se puede deshacer.`;

    action.onclick = async function () {
        const result = await apiRequest(`ediciones.php?id=${id}`, { method: 'DELETE' });
        if (result) {
            showToast('Edición eliminada', 'success');
            closeModal();
            cargarEdiciones();
            cargarEstadisticas();
        }
    };

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function limpiarFormulario() {
    editandoId = null;
    document.getElementById('edicionId').value      = '';
    document.getElementById('edTitulo').value       = '';
    document.getElementById('edAutor').value        = '';
    document.getElementById('edCategoria').value    = '#1';
    document.getElementById('edAnio').value         = new Date().getFullYear();
    document.getElementById('edDescripcion').value  = '';
    document.getElementById('edPdfUrl').value       = '';
    document.getElementById('edThumbUrl').value     = '';
    document.getElementById('edFecha').value        = new Date().toISOString().split('T')[0];
    document.getElementById('edOrden').value        = 0;
    document.getElementById('edActivo').checked     = true;
    document.getElementById('edDestacada').checked  = false;
    document.getElementById('edProximamente').checked = false;
    actualizarPreviewThumb();
    document.getElementById('formTitle').innerHTML  = '<i class="fas fa-plus-circle"></i> Nueva Edición';
}

// ════════════════════════════════════════════════
//  SUBIDA DE ARCHIVOS
// ════════════════════════════════════════════════
async function subirArchivo(event, tipo) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    showToast('Subiendo archivo...', 'info');

    try {
        const resp = await fetch(`${API_BASE}/upload.php`, {
            method: 'POST',
            body: formData,
        });

        if (resp.status === 401) {
            window.location.href = 'login.php';
            return;
        }

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Error al subir el archivo');

        if (tipo === 'pdf') {
            document.getElementById('edPdfUrl').value = data.url;
        } else {
            document.getElementById('edThumbUrl').value = data.url;
            actualizarPreviewThumb();
        }

        showToast(`Archivo subido (${(data.size / 1024).toFixed(0)} KB)`, 'success');
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function actualizarPreviewThumb() {
    const url   = document.getElementById('edThumbUrl').value.trim();
    const wrap  = document.getElementById('thumbPreview');
    const img   = document.getElementById('thumbPreviewImg');
    if (!wrap || !img) return;

    if (url) {
        img.src = url.startsWith('http') ? url : `../${url}`;
        wrap.style.display = 'block';
    } else {
        img.src = '';
        wrap.style.display = 'none';
    }
}

// ════════════════════════════════════════════════
//  LOGS
// ════════════════════════════════════════════════
async function cargarLogs() {
    const data = await apiRequest('stats.php');
    if (!data || !data.logs_recientes) return;

    const container = document.getElementById('logsContainer');

    if (data.logs_recientes.length === 0) {
        container.innerHTML = '<p class="text-muted">Sin actividad reciente</p>';
        return;
    }

    const iconMap = {
        login_exitoso: 'login', login_fallido: 'error', logout: 'logout',
        crear_edicion: 'create', editar_edicion: 'edit', eliminar_edicion: 'delete',
        subir_archivo: 'upload',
    };

    const labelMap = {
        login_exitoso: 'Inicio de sesión', login_fallido: 'Login fallido',
        logout: 'Cierre de sesión', crear_edicion: 'Creó edición',
        editar_edicion: 'Editó edición', eliminar_edicion: 'Eliminó edición',
        subir_archivo: 'Subió archivo', crear_usuario: 'Creó usuario',
        editar_usuario: 'Editó usuario', eliminar_usuario: 'Eliminó usuario',
        editar_configuracion: 'Editó configuración',
    };

    container.innerHTML = data.logs_recientes.map(log => `
        <div class="log-item">
            <div class="log-icon ${iconMap[log.accion] || 'info'}">
                <i class="fas fa-${getLogIcon(log.accion)}"></i>
            </div>
            <div class="log-info">
                <span class="log-action">${labelMap[log.accion] || log.accion}</span>
                ${log.username ? `<small style="color:var(--admin-text-muted)"> — ${escapeHtml(log.username)}</small>` : ''}
                ${log.detalles ? `<br><small style="color:var(--admin-text-muted)">${escapeHtml(log.detalles)}</small>` : ''}
            </div>
            <span class="log-time">${formatDate(log.created_at)}</span>
        </div>
    `).join('');
}

function getLogIcon(accion) {
    const icons = {
        login_exitoso: 'sign-in-alt', login_fallido: 'exclamation-triangle',
        logout: 'sign-out-alt', crear_edicion: 'plus-circle',
        editar_edicion: 'edit', eliminar_edicion: 'trash',
        subir_archivo: 'upload', crear_usuario: 'user-plus',
        editar_usuario: 'user-edit', eliminar_usuario: 'user-minus',
        editar_configuracion: 'cog',
    };
    return icons[accion] || 'info-circle';
}

// ════════════════════════════════════════════════
//  USUARIOS (solo admin)
// ════════════════════════════════════════════════
async function cargarUsuarios() {
    const tbody = document.getElementById('usuariosBody');
    if (!tbody) return;

    const data = await apiRequest('usuarios.php');
    if (!data) return;

    usuarios = data.usuarios;
    renderizarUsuarios();
}

function renderizarUsuarios() {
    const tbody = document.getElementById('usuariosBody');

    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td><strong>${escapeHtml(u.username)}</strong> <small class="text-muted">#${u.id}</small></td>
            <td>${escapeHtml(u.nombre_completo || '—')}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge ${u.rol === 'admin' ? 'badge-admin' : 'badge-editor'}">${u.rol === 'admin' ? 'Administrador' : 'Editor'}</span></td>
            <td>
                <span class="status-badge ${u.activo ? 'status-active' : 'status-inactive'}">
                    ${u.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>${u.ultimo_acceso ? formatDate(u.ultimo_acceso) : '—'}</td>
            <td>
                <div style="display:flex;gap:4px" class="row-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editarUsuario(${u.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarEliminarUsuario(${u.id}, '${escapeHtml(u.username).replace(/'/g, "\\'")}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function nuevoUsuario() {
    limpiarFormularioUsuario();
    const form = document.getElementById('usuarioForm');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editarUsuario(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;

    document.getElementById('usuarioId').value  = u.id;
    document.getElementById('usUsername').value = u.username;
    document.getElementById('usUsername').disabled = true;
    document.getElementById('usEmail').value    = u.email;
    document.getElementById('usNombre').value   = u.nombre_completo || '';
    document.getElementById('usRol').value      = u.rol;
    document.getElementById('usActivo').checked = !!u.activo;
    document.getElementById('usPassword').value = '';
    document.getElementById('usPasswordHelp').textContent = 'Déjala vacía para conservar la contraseña actual.';

    const form = document.getElementById('usuarioForm');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function limpiarFormularioUsuario() {
    document.getElementById('usuarioId').value  = '';
    document.getElementById('usUsername').value = '';
    document.getElementById('usUsername').disabled = false;
    document.getElementById('usEmail').value    = '';
    document.getElementById('usNombre').value   = '';
    document.getElementById('usRol').value      = 'editor';
    document.getElementById('usActivo').checked = true;
    document.getElementById('usPassword').value = '';
    document.getElementById('usPasswordHelp').textContent = 'Obligatoria al crear. Déjala vacía para conservarla al editar.';
    document.getElementById('usuarioForm').style.display = 'none';
}

async function guardarUsuario(e) {
    e.preventDefault();

    const id       = document.getElementById('usuarioId').value;
    const password = document.getElementById('usPassword').value;
    const payload  = {
        username:        document.getElementById('usUsername').value.trim(),
        email:           document.getElementById('usEmail').value.trim(),
        nombre_completo: document.getElementById('usNombre').value.trim(),
        rol:             document.getElementById('usRol').value,
        activo:          document.getElementById('usActivo').checked ? 1 : 0,
    };
    if (password) payload.password = password;

    if (!id && !password) {
        showToast('La contraseña es obligatoria al crear un usuario', 'error');
        return;
    }

    const btn = document.getElementById('btnGuardarUsuario');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    let result;
    if (id) {
        delete payload.username;
        result = await apiRequest(`usuarios.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
        result = await apiRequest('usuarios.php', { method: 'POST', body: JSON.stringify(payload) });
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Guardar';

    if (result) {
        showToast(id ? 'Usuario actualizado' : 'Usuario creado', 'success');
        limpiarFormularioUsuario();
        cargarUsuarios();
    }
}

function confirmarEliminarUsuario(id, username) {
    const modal  = document.getElementById('confirmModal');
    const msg    = document.getElementById('confirmMessage');
    const action = document.getElementById('confirmAction');

    msg.textContent = `¿Eliminar el usuario "${username}"? Esta acción no se puede deshacer.`;

    action.onclick = async function () {
        const result = await apiRequest(`usuarios.php?id=${id}`, { method: 'DELETE' });
        if (result) {
            showToast('Usuario eliminado', 'success');
            closeModal();
            cargarUsuarios();
        }
    };

    modal.style.display = 'flex';
}

// ════════════════════════════════════════════════
//  CONFIGURACIÓN
// ════════════════════════════════════════════════
async function cargarConfig() {
    const data = await apiRequest('configuracion.php');
    if (!data || !data.config) return;

    const cfg = data.config;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    set('cfgSiteName', cfg.site_name);
    set('cfgAuthor', cfg.site_author);
    set('cfgDescription', cfg.site_description);
}

async function guardarConfig() {
    const btn = document.getElementById('btnGuardarConfig');
    if (!btn) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    const result = await apiRequest('configuracion.php', {
        method: 'PUT',
        body: JSON.stringify({
            site_name:        document.getElementById('cfgSiteName').value.trim(),
            site_author:      document.getElementById('cfgAuthor').value.trim(),
            site_description: document.getElementById('cfgDescription').value.trim(),
        }),
    });

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Guardar configuración';

    if (result) showToast('Configuración guardada', 'success');
}

// ════════════════════════════════════════════════
//  SESIÓN
// ════════════════════════════════════════════════
async function cerrarSesion() {
    await fetch(`${API_BASE}/auth.php`, { method: 'DELETE' });
    window.location.href = 'login.php';
}

// ════════════════════════════════════════════════
//  BACKUP
// ════════════════════════════════════════════════
async function exportarBackup() {
    const data = await apiRequest('ediciones.php?solo_activos=0');
    if (!data) return;

    const blob = new Blob([JSON.stringify(data.ediciones, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `hago-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado', 'success');
}

async function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text  = await file.text();
        const items = JSON.parse(text);

        if (!Array.isArray(items)) throw new Error('Formato inválido');

        let importados = 0;
        for (const item of items) {
            const result = await apiRequest('ediciones.php', {
                method: 'POST',
                body: JSON.stringify({
                    titulo:              item.titulo,
                    autor:               item.autor,
                    categoria:           item.categoria,
                    anio:                item.anio,
                    descripcion:         item.descripcion,
                    pdf_url:             item.pdf_url,
                    thumbnail_url:       item.thumbnail_url,
                    fecha_publicacion:   item.fecha_publicacion,
                    orden_visualizacion: item.orden_visualizacion || 0,
                    activo:              item.activo ?? 1,
                }),
            });
            if (result) importados++;
        }

        showToast(`${importados} ediciones importadas`, 'success');
        cargarEdiciones();
        cargarEstadisticas();
    } catch (e) {
        showToast('Error al importar: ' + e.message, 'error');
    }

    event.target.value = '';
}

// ════════════════════════════════════════════════
//  UTILIDADES
// ════════════════════════════════════════════════
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast     = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
