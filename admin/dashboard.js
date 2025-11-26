// Datos de PDFs - Importado desde ediciones-data.js
// NOTA: Asegúrate de cargar ediciones-data.js antes de este archivo
let pdfData = (typeof getEdicionesAsPdfData === 'function') 
    ? getEdicionesAsPdfData() 
    : [];

// Variables globales
let currentSection = 'dashboard';
let fileToDelete = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadFilesList();
    updateStats();
});

function initializeDashboard() {
    // Mostrar fecha de último acceso
    const loginTime = sessionStorage.getItem('loginTime');
    if (loginTime) {
        const date = new Date(parseInt(loginTime));
        document.getElementById('lastLogin').textContent = date.toLocaleString('es-ES');
    }
    
    // Configurar navegación
    setupNavigation();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Actualizar estado activo
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
        currentSection = sectionName;
        
        // Cargar datos específicos de la sección
        if (sectionName === 'manage') {
            loadFilesList();
        }
    }
}

function setupEventListeners() {
    // Upload area
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('pdfFile');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        document.getElementById('pdfFile').files = files;
        updateUploadArea(files[0]);
    } else {
        showNotification('Por favor, selecciona un archivo PDF válido.', 'warning');
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        updateUploadArea(file);
    }
}

function updateUploadArea(file) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-file-pdf fa-3x text-success mb-3"></i>
        <h5 class="text-success">Archivo seleccionado</h5>
        <p class="text-muted">${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</p>
        <small class="text-muted">Haz clic para cambiar el archivo</small>
    `;
}

function handleUpload(e) {
    e.preventDefault();
    
    const title = document.getElementById('editionTitle').value;
    const year = document.getElementById('editionYear').value;
    const topics = document.getElementById('editionTopics').value;
    const thumbnail = document.getElementById('thumbnailUrl').value;
    const file = document.getElementById('pdfFile').files[0];
    
    // Si estamos editando, no es necesario un archivo nuevo
    if (!window.isEditing && !file) {
        showNotification('Por favor, selecciona un archivo PDF.', 'warning');
        return;
    }
    
    if (window.isEditing && window.editingId) {
        // Actualizar edición existente
        updateExistingPdf(window.editingId, title, year, topics, thumbnail, file);
    } else {
        // Crear nueva edición
        simulateUpload(title, year, topics, thumbnail, file);
    }
}

function updateExistingPdf(id, title, year, topics, thumbnail, file) {
    const pdfIndex = pdfData.findIndex(p => p.id === id);
    if (pdfIndex !== -1) {
        // Actualizar datos
        pdfData[pdfIndex].title = title;
        pdfData[pdfIndex].year = parseInt(year);
        pdfData[pdfIndex].author = topics;
        pdfData[pdfIndex].thumbnail = thumbnail || pdfData[pdfIndex].thumbnail;
        
        // Si hay un nuevo archivo, actualizar la URL
        if (file) {
            pdfData[pdfIndex].pdfUrl = `../pdf/${file.name}`;
            pdfData[pdfIndex].size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        }
        
        // Resetear estado de edición
        window.isEditing = false;
        window.editingId = null;
        
        // Resetear formulario y UI
        document.getElementById('uploadForm').reset();
        resetUploadArea();
        
        // Restaurar botón y título
        const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Edición';
        }
        
        const uploadTitle = document.querySelector('#upload-section .card-header h5');
        if (uploadTitle) {
            uploadTitle.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Subir Nueva Edición';
        }
        
        // Actualizar estadísticas y lista
        updateStats();
        loadFilesList();
        
        showNotification('¡Edición actualizada exitosamente!', 'success');
        
        // Cambiar a la sección de gestión
        setTimeout(() => {
            showSection('manage');
            document.querySelector('[data-section="manage"]').classList.add('active');
            document.querySelector('[data-section="upload"]').classList.remove('active');
        }, 1500);
    }
}

function simulateUpload(title, year, topics, thumbnail, file) {
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = progressContainer.querySelector('.progress-bar');
    
    // Mostrar progreso
    progressContainer.style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Agregar nuevo PDF a los datos
            const newPdf = {
                id: pdfData.length + 1,
                title: title,
                author: topics,
                category: `#${pdfData.length + 1}`,
                year: parseInt(year),
                thumbnail: thumbnail || '../img/default-thumbnail.png',
                pdfUrl: `../pdf/${file.name}`,
                uploadDate: new Date().toISOString().split('T')[0],
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
            };
            
            pdfData.push(newPdf);
            
            // Resetear formulario
            document.getElementById('uploadForm').reset();
            resetUploadArea();
            progressContainer.style.display = 'none';
            
            // Actualizar estadísticas y lista
            updateStats();
            loadFilesList();
            
            showNotification('¡Edición subida exitosamente!', 'success');
            
            // Cambiar a la sección de gestión después de 1.5 segundos
            setTimeout(() => {
                showSection('manage');
                document.querySelector('[data-section="manage"]').classList.add('active');
                document.querySelector('[data-section="upload"]').classList.remove('active');
            }, 1500);
        }
    }, 100);
}

function resetUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
        <h5>Arrastra tu archivo PDF aquí</h5>
        <p class="text-muted">o haz clic para seleccionar</p>
    `;
}

function cancelEdit() {
    // Resetear estado de edición
    window.isEditing = false;
    window.editingId = null;
    
    // Resetear formulario
    document.getElementById('uploadForm').reset();
    resetUploadArea();
    
    // Restaurar botón y título
    const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Edición';
    }
    
    const uploadTitle = document.querySelector('#upload-section .card-header h5');
    if (uploadTitle) {
        uploadTitle.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Subir Nueva Edición';
    }
    
    showNotification('Edición cancelada', 'info');
}

function loadFilesList() {
    const filesList = document.getElementById('filesList');
    
    if (pdfData.length === 0) {
        filesList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No hay archivos disponibles</h5>
                <p class="text-muted">Sube tu primera edición para comenzar</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = pdfData.map(pdf => `
        <div class="file-item">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="${pdf.thumbnail}" alt="${pdf.title}" class="img-fluid rounded" style="max-height: 80px;">
                </div>
                <div class="col-md-6">
                    <h6 class="mb-1 text-primary">${pdf.title}</h6>
                    <p class="mb-1 text-muted small">${pdf.author}</p>
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>${pdf.uploadDate} | 
                        <i class="fas fa-file-pdf me-1"></i>${pdf.size}
                    </small>
                </div>
                <div class="col-md-4 text-end">
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="previewPdf('${pdf.pdfUrl}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="editPdf(${pdf.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="confirmDelete(${pdf.id}, '${pdf.title}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalPdfs').textContent = pdfData.length;
}

function previewPdf(pdfUrl) {
    window.open(pdfUrl, '_blank');
}

function editPdf(id) {
    const pdf = pdfData.find(p => p.id === id);
    if (pdf) {
        // Llenar formulario con datos existentes
        document.getElementById('editionTitle').value = pdf.title;
        document.getElementById('editionYear').value = pdf.year;
        document.getElementById('editionTopics').value = pdf.author;
        document.getElementById('thumbnailUrl').value = pdf.thumbnail;
        
        // Marcar como edición
        window.isEditing = true;
        window.editingId = id;
        
        // Cambiar texto del botón
        const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Edición';
        }
        
        // Cambiar título de la sección
        const uploadTitle = document.querySelector('#upload-section .card-header h5');
        if (uploadTitle) {
            uploadTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Edición';
        }
        
        // Cambiar a sección de upload
        showSection('upload');
        document.querySelector('[data-section="upload"]').classList.add('active');
        document.querySelector('[data-section="manage"]').classList.remove('active');
        
        showNotification('Datos cargados para edición. Modifica los campos necesarios y guarda los cambios.', 'info');
    }
}

function confirmDelete(id, title) {
    fileToDelete = id;
    document.getElementById('confirmMessage').textContent = 
        `¿Estás seguro de que deseas eliminar "${title}"? Esta acción no se puede deshacer.`;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
    
    document.getElementById('confirmAction').onclick = function() {
        deletePdf(fileToDelete);
        modal.hide();
    };
}

function deletePdf(id) {
    const index = pdfData.findIndex(p => p.id === id);
    if (index !== -1) {
        const deletedPdf = pdfData.splice(index, 1)[0];
        loadFilesList();
        updateStats();
        showNotification(`"${deletedPdf.title}" ha sido eliminado exitosamente.`, 'success');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification slide-in`;
    notification.innerHTML = `
        <i class="fas fa-${getIconForType(type)} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getIconForType(type) {
    const icons = {
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'danger': 'times-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    }
}

// Verificar sesión cada 5 minutos
setInterval(() => {
    const loginTime = sessionStorage.getItem('loginTime');
    if (loginTime) {
        const currentTime = new Date().getTime();
        const sessionDuration = 2 * 60 * 60 * 1000; // 2 horas
        
        if (currentTime - loginTime > sessionDuration) {
            alert('Tu sesión ha expirado. Serás redirigido al login.');
            logout();
        }
    }
}, 5 * 60 * 1000);

