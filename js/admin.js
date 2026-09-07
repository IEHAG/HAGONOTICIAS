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

    document.getElementById('edicionForm').addEventListener('submit', guardarEdicion);
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
    document.getElementById('statVistas').textContent   = data.total_vistas.toLocaleString();
    document.getElementById('statDescargas').textContent = data.total_descargas.toLocaleString();
    document.getElementById('statUltima').textContent   = data.ultima_edicion?.titulo ?? '—';
}

// ════════════════════════════════════════════════
//  EDICIONES — CRUD
// ════════════════════════════════════════════════
async function cargarEdiciones() {
    const data = await apiRequest('ediciones.php?solo_activos=0');
    if (!data) return;

    ediciones = data.ediciones;
    renderizarEdiciones();
}

function renderizarEdiciones() {
    const tbody = document.getElementById('edicionesBody');

    if (ediciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay ediciones registradas</td></tr>';
        return;
    }

    tbody.innerHTML = ediciones.map(e => `
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
            </td>
            <td>
                <div style="display:flex;gap:4px">
                    <button class="btn btn-sm btn-secondary" onclick="editarEdicion(${e.id})" title="Editar">
                        <i class="fas fa-edit"></i>
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
    document.getElementById('formTitle').innerHTML  = '<i class="fas fa-plus-circle"></i> Nueva Edición';
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
        subir_archivo: 'Subió archivo',
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
        subir_archivo: 'upload',
    };
    return icons[accion] || 'info-circle';
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
