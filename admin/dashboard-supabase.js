// Dashboard HAGO Noticias - Integración con Supabase
// Este archivo maneja toda la lógica del dashboard administrativo

// Variables globales
let currentUser = null;
let isEditing = false;
let editingId = null;

// Elementos del DOM
const alertContainer = document.getElementById('alertContainer');
const connectionStatus = document.getElementById('connectionStatus');
const edicionForm = document.getElementById('edicionForm');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Elementos del formulario
const tituloInput = document.getElementById('titulo');
const categoriaInput = document.getElementById('categoria');
const autorInput = document.getElementById('autor');
const anioInput = document.getElementById('anio');
const descripcionInput = document.getElementById('descripcion');
const pdfFileInput = document.getElementById('pdfFile');
const thumbnailFileInput = document.getElementById('thumbnailFile');

// Áreas de upload
const pdfUploadArea = document.getElementById('pdfUploadArea');
const thumbnailUploadArea = document.getElementById('thumbnailUploadArea');

// Elementos de la tabla
const loadingEdiciones = document.getElementById('loadingEdiciones');
const edicionesTable = document.getElementById('edicionesTable');
const edicionesTableBody = document.getElementById('edicionesTableBody');
const noEdiciones = document.getElementById('noEdiciones');

// Modal de confirmación
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const confirmMessage = document.getElementById('confirmMessage');
const confirmAction = document.getElementById('confirmAction');

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info', duracion = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="fas fa-${getIconForType(tipo)} me-2"></i>
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);
    
    // Auto-remover después de la duración especificada
    if (duracion > 0) {
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                const alert = new bootstrap.Alert(alertElement);
                alert.close();
            }
        }, duracion);
    }
}

function getIconForType(tipo) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[tipo] || 'info-circle';
}

// Función para actualizar el estado de conexión
function actualizarEstadoConexion(conectado, mensaje = '') {
    if (conectado) {
        connectionStatus.innerHTML = `
            <span class="badge bg-success">
                <i class="fas fa-check-circle me-1"></i>
                Conectado a Supabase
            </span>
        `;
    } else {
        connectionStatus.innerHTML = `
            <span class="badge bg-danger">
                <i class="fas fa-times-circle me-1"></i>
                ${mensaje || 'Desconectado'}
            </span>
        `;
    }
}

// Función para verificar autenticación
async function verificarAutenticacion() {
    try {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('Error al verificar autenticación:', error);
            redirigirALogin();
            return false;
        }

        if (!user) {
            redirigirALogin();
            return false;
        }

        currentUser = user;
        console.log('Usuario autenticado:', user.email);
        return true;
    } catch (error) {
        console.error('Error en verificarAutenticacion:', error);
        mostrarAlerta('Error al verificar la autenticación. Redirigiendo al login...', 'danger');
        setTimeout(() => redirigirALogin(), 2000);
        return false;
    }
}

function redirigirALogin() {
    window.location.href = 'login.html';
}

// Función para cerrar sesión
async function cerrarSesion() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error al cerrar sesión:', error);
            mostrarAlerta('Error al cerrar sesión', 'danger');
        } else {
            mostrarAlerta('Sesión cerrada correctamente', 'success', 2000);
            setTimeout(() => redirigirALogin(), 2000);
        }
    } catch (error) {
        console.error('Error en cerrarSesion:', error);
        mostrarAlerta('Error al cerrar sesión', 'danger');
    }
}

// Configurar drag & drop para archivos
function configurarDragAndDrop() {
    [pdfUploadArea, thumbnailUploadArea].forEach(area => {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });

        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const input = area === pdfUploadArea ? pdfFileInput : thumbnailFileInput;
                input.files = files;
                manejarCambioArchivo(input);
            }
        });

        area.addEventListener('click', () => {
            const input = area === pdfUploadArea ? pdfFileInput : thumbnailFileInput;
            input.click();
        });
    });
}

// Manejar cambio de archivo
function manejarCambioArchivo(input) {
    const file = input.files[0];
    if (!file) return;

    if (input === pdfFileInput) {
        // Validar PDF
        if (file.type !== 'application/pdf') {
            mostrarAlerta('Por favor selecciona un archivo PDF válido', 'danger');
            input.value = '';
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            mostrarAlerta('El archivo PDF es demasiado grande (máximo 10MB)', 'danger');
            input.value = '';
            return;
        }

        document.getElementById('pdfFileName').textContent = file.name;
        document.getElementById('pdfPreview').style.display = 'block';
    } else {
        // Validar imagen
        if (!file.type.startsWith('image/')) {
            mostrarAlerta('Por favor selecciona un archivo de imagen válido', 'danger');
            input.value = '';
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB
            mostrarAlerta('La imagen es demasiado grande (máximo 2MB)', 'danger');
            input.value = '';
            return;
        }

        // Mostrar preview de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('thumbnailImg').src = e.target.result;
            document.getElementById('thumbnailPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Función para subir archivo a Supabase Storage
async function subirArchivo(archivo, bucket, nombreArchivo) {
    try {
        const resultado = await edicionesManager.subirArchivo(bucket, archivo, nombreArchivo);
        
        if (!resultado.success) {
            throw new Error(resultado.error);
        }

        return resultado.publicUrl;
    } catch (error) {
        console.error('Error al subir archivo:', error);
        throw error;
    }
}

// Función para generar nombre único de archivo
function generarNombreArchivo(archivo, prefijo = '') {
    const timestamp = Date.now();
    const extension = archivo.name.split('.').pop();
    return `${prefijo}${timestamp}.${extension}`;
}

// Función para enviar formulario
async function enviarFormulario(e) {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!tituloInput.value.trim() || !categoriaInput.value.trim() || !anioInput.value) {
        mostrarAlerta('Por favor completa todos los campos requeridos', 'danger');
        return;
    }

    if (!isEditing && !pdfFileInput.files[0]) {
        mostrarAlerta('Por favor selecciona un archivo PDF', 'danger');
        return;
    }

    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Guardando...';

    try {
        let pdfUrl = null;
        let thumbnailUrl = null;

        // Subir PDF si hay uno nuevo
        if (pdfFileInput.files[0]) {
            const pdfFile = pdfFileInput.files[0];
            const nombrePdf = generarNombreArchivo(pdfFile, 'pdf_');
            pdfUrl = await subirArchivo(pdfFile, 'pdfs', nombrePdf);
        }

        // Subir thumbnail si hay uno
        if (thumbnailFileInput.files[0]) {
            const thumbnailFile = thumbnailFileInput.files[0];
            const nombreThumbnail = generarNombreArchivo(thumbnailFile, 'thumb_');
            thumbnailUrl = await subirArchivo(thumbnailFile, 'thumbnails', nombreThumbnail);
        }

        // Preparar datos de la edición
        const edicionData = {
            titulo: tituloInput.value.trim(),
            categoria: categoriaInput.value.trim(),
            autor: autorInput.value.trim() || null,
            anio: parseInt(anioInput.value),
            descripcion: descripcionInput.value.trim() || null
        };

        // Agregar URLs solo si se subieron archivos nuevos
        if (pdfUrl) edicionData.pdf_url = pdfUrl;
        if (thumbnailUrl) edicionData.thumbnail_url = thumbnailUrl;

        let resultado;
        if (isEditing) {
            resultado = await edicionesManager.actualizarEdicion(editingId, edicionData);
        } else {
            // Para nuevas ediciones, el PDF es requerido
            if (!pdfUrl) {
                throw new Error('Se requiere un archivo PDF para crear una nueva edición');
            }
            resultado = await edicionesManager.crearEdicion(edicionData);
        }

        if (resultado.success) {
            mostrarAlerta(
                isEditing ? 'Edición actualizada correctamente' : 'Edición creada correctamente',
                'success'
            );
            limpiarFormulario();
            cargarEdiciones();
        } else {
            throw new Error(resultado.error);
        }

    } catch (error) {
        console.error('Error al guardar edición:', error);
        mostrarAlerta(`Error al guardar la edición: ${error.message}`, 'danger');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Función para limpiar formulario
function limpiarFormulario() {
    edicionForm.reset();
    document.getElementById('pdfPreview').style.display = 'none';
    document.getElementById('thumbnailPreview').style.display = 'none';
    isEditing = false;
    editingId = null;
    
    submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Edición';
    document.querySelector('.card-header h5').innerHTML = '<i class="fas fa-plus-circle me-2"></i>Agregar Nueva Edición';
}

// Función para cargar ediciones
async function cargarEdiciones() {
    try {
        loadingEdiciones.style.display = 'block';
        edicionesTable.style.display = 'none';
        noEdiciones.style.display = 'none';

        const ediciones = await edicionesManager.obtenerEdiciones();

        if (ediciones.length === 0) {
            loadingEdiciones.style.display = 'none';
            noEdiciones.style.display = 'block';
            return;
        }

        // Limpiar tabla
        edicionesTableBody.innerHTML = '';

        // Agregar filas
        ediciones.forEach(edicion => {
            const fila = crearFilaEdicion(edicion);
            edicionesTableBody.appendChild(fila);
        });

        loadingEdiciones.style.display = 'none';
        edicionesTable.style.display = 'block';

    } catch (error) {
        console.error('Error al cargar ediciones:', error);
        mostrarAlerta('Error al cargar las ediciones', 'danger');
        loadingEdiciones.style.display = 'none';
        noEdiciones.style.display = 'block';
    }
}

// Función para crear fila de edición
function crearFilaEdicion(edicion) {
    const fila = document.createElement('tr');
    
    const fecha = new Date(edicion.fecha_publicacion).toLocaleDateString('es-ES');
    const thumbnail = edicion.thumbnail_url || '../img/default-thumbnail.png';
    
    fila.innerHTML = `
        <td>
            <img src="${thumbnail}" alt="Thumbnail" class="thumbnail-preview" 
                 onerror="this.src='../img/default-thumbnail.png'">
        </td>
        <td>
            <strong>${edicion.titulo}</strong>
            ${edicion.descripcion ? `<br><small class="text-muted">${edicion.descripcion}</small>` : ''}
        </td>
        <td><span class="badge bg-primary">${edicion.categoria}</span></td>
        <td>${edicion.anio}</td>
        <td>
            <span class="status-badge ${edicion.activo ? 'status-active' : 'status-inactive'}">
                ${edicion.activo ? 'Activo' : 'Inactivo'}
            </span>
        </td>
        <td>${fecha}</td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-warning" onclick="editarEdicion('${edicion.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="confirmarEliminar('${edicion.id}', '${edicion.titulo}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
                <a href="${edicion.pdf_url}" target="_blank" class="btn btn-info" title="Ver PDF">
                    <i class="fas fa-eye"></i>
                </a>
            </div>
        </td>
    `;
    
    return fila;
}

// Función para editar edición
async function editarEdicion(id) {
    try {
        const edicion = await edicionesManager.obtenerEdicionPorId(id);
        
        if (!edicion) {
            mostrarAlerta('No se pudo cargar la edición para editar', 'danger');
            return;
        }

        // Llenar formulario
        tituloInput.value = edicion.titulo;
        categoriaInput.value = edicion.categoria;
        autorInput.value = edicion.autor || '';
        anioInput.value = edicion.anio;
        descripcionInput.value = edicion.descripcion || '';

        // Mostrar thumbnail si existe
        if (edicion.thumbnail_url) {
            document.getElementById('thumbnailImg').src = edicion.thumbnail_url;
            document.getElementById('thumbnailPreview').style.display = 'block';
        }

        // Cambiar estado del formulario
        isEditing = true;
        editingId = id;
        
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Edición';
        document.querySelector('.card-header h5').innerHTML = '<i class="fas fa-edit me-2"></i>Editar Edición';

        // Scroll al formulario
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error al cargar edición para editar:', error);
        mostrarAlerta('Error al cargar la edición para editar', 'danger');
    }
}

// Función para confirmar eliminación
function confirmarEliminar(id, titulo) {
    confirmMessage.textContent = `¿Estás seguro de que deseas eliminar la edición "${titulo}"?`;
    
    confirmAction.onclick = () => {
        eliminarEdicion(id);
        confirmModal.hide();
    };
    
    confirmModal.show();
}

// Función para eliminar edición
async function eliminarEdicion(id) {
    try {
        const resultado = await edicionesManager.eliminarEdicion(id);
        
        if (resultado.success) {
            mostrarAlerta('Edición eliminada correctamente', 'success');
            cargarEdiciones();
        } else {
            throw new Error(resultado.error);
        }
    } catch (error) {
        console.error('Error al eliminar edición:', error);
        mostrarAlerta('Error al eliminar la edición', 'danger');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar configuración de Supabase
    if (!validarConfiguracion()) {
        actualizarEstadoConexion(false, 'Configuración incompleta');
        mostrarAlerta('Las credenciales de Supabase no están configuradas correctamente. Por favor, actualiza el archivo supabase-config.js', 'warning', 0);
        return;
    }

    // Inicializar sistema
    if (!inicializarSistema()) {
        actualizarEstadoConexion(false, 'Error de inicialización');
        mostrarAlerta('Error al inicializar el sistema. Verifica la configuración de Supabase.', 'danger');
        return;
    }

    // Verificar autenticación
    const autenticado = await verificarAutenticacion();
    if (!autenticado) {
        return;
    }

    actualizarEstadoConexion(true);
    
    // Configurar interfaz
    configurarDragAndDrop();
    
    // Cargar ediciones
    await cargarEdiciones();
    
    // Configurar año por defecto
    anioInput.value = new Date().getFullYear();
});

// Event listeners para formulario
edicionForm.addEventListener('submit', enviarFormulario);
cancelBtn.addEventListener('click', limpiarFormulario);
refreshBtn.addEventListener('click', cargarEdiciones);
logoutBtn.addEventListener('click', cerrarSesion);

// Event listeners para archivos
pdfFileInput.addEventListener('change', () => manejarCambioArchivo(pdfFileInput));
thumbnailFileInput.addEventListener('change', () => manejarCambioArchivo(thumbnailFileInput));

// Hacer funciones globales para uso en HTML
window.editarEdicion = editarEdicion;
window.confirmarEliminar = confirmarEliminar;

