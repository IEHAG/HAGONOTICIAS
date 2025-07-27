// Dashboard Mejorado - HAG Noticias
class EnhancedDashboard {
    constructor() {
        this.pdfData = [
            {
                id: 1,
                title: "Edición # 1",
                author: "Día de la democracia, Madres, Maestro, Talentos Abadistas",
                category: "#1",
                year: 2024,
                thumbnail: "https://drive.google.com/thumbnail?id=1UICpZu7v8SyBjJaA29YYYzZa2F97i25m&sz=w320-h240",
                pdfUrl: "pdf/EDICION1.pdf",
                uploadDate: "2024-01-15",
                size: "2.5 MB",
                views: 234,
                downloads: 89
            },
            {
                id: 2,
                title: "Edición # 2",
                author: "Día de la Antioqueñidad",
                category: "#2",
                year: 2024,
                thumbnail: "https://drive.google.com/thumbnail?id=1UjFe_Jj1lN-_vTAqr3A_MH4sSthQWzPv&sz=w320-h240",
                pdfUrl: "pdf/EDICION2.pdf",
                uploadDate: "2024-03-20",
                size: "3.1 MB",
                views: 189,
                downloads: 67
            },
            {
                id: 3,
                title: "Edición # 3",
                author: "Semana Abadista - Foro - Museo Escolar",
                category: "#3",
                year: 2024,
                thumbnail: "https://drive.google.com/thumbnail?id=1q6lmYNtsZKa1_WPglzVAbG9q0OuEoHy5&sz=w320-h240",
                pdfUrl: "pdf/EDICION3.pdf",
                uploadDate: "2024-06-10",
                size: "2.8 MB",
                views: 156,
                downloads: 45
            },
            {
                id: 4,
                title: "Edición # 4",
                author: "La institución de la Inclusión, Gobierno Escolar 2025",
                category: "#4",
                year: 2025,
                thumbnail: "https://drive.google.com/thumbnail?id=13fWBxbiOMp8MMZIsOO-gPyX14VP361Ql&sz=w320-h240",
                pdfUrl: "pdf/EDICION4.pdf",
                uploadDate: "2025-01-15",
                size: "3.5 MB",
                views: 312,
                downloads: 123
            }
        ];
        
        this.currentSection = 'dashboard';
        this.fileToDelete = null;
        this.editingPdf = null;
        this.stats = {
            totalViews: 0,
            totalDownloads: 0,
            totalSize: 0
        };
        
        this.init();
    }
    
    init() {
        this.calculateStats();
        this.setupEventListeners();
        this.initializeDashboard();
        this.loadFilesList();
        this.updateStats();
        this.setupAutoSave();
    }
    
    calculateStats() {
        this.stats.totalViews = this.pdfData.reduce((sum, pdf) => sum + pdf.views, 0);
        this.stats.totalDownloads = this.pdfData.reduce((sum, pdf) => sum + pdf.downloads, 0);
        this.stats.totalSize = this.pdfData.reduce((sum, pdf) => {
            const size = parseFloat(pdf.size.replace(' MB', ''));
            return sum + size;
        }, 0);
    }
    
    initializeDashboard() {
        // Mostrar fecha de último acceso
        const loginTime = sessionStorage.getItem('loginTime');
        if (loginTime) {
            const date = new Date(parseInt(loginTime));
            document.getElementById('lastLogin').textContent = date.toLocaleString('es-ES');
        } else {
            document.getElementById('lastLogin').textContent = new Date().toLocaleString('es-ES');
        }
        
        // Configurar navegación
        this.setupNavigation();
        
        // Cargar configuraciones guardadas
        this.loadSettings();
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.sidebar .nav-link[data-section]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                // Actualizar estado activo
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
    
    showSection(sectionName) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
            
            // Cargar datos específicos de la sección
            switch(sectionName) {
                case 'manage':
                    this.loadFilesList();
                    break;
                case 'settings':
                    this.loadSettings();
                    break;
                case 'dashboard':
                    this.updateDashboardCharts();
                    break;
            }
        }
    }
    
    setupEventListeners() {
        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('pdfFile');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // Upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }
        
        // Búsqueda en gestión de archivos
        const searchInput = document.getElementById('searchFiles');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterFiles(e.target.value));
        }
        
        // Filtro por año
        const yearFilter = document.getElementById('yearFilter');
        if (yearFilter) {
            yearFilter.addEventListener('change', (e) => this.filterByYear(e.target.value));
        }
        
        // Configuraciones
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.saveSettings(e));
        }
        
        // Botones de acción rápida
        this.setupQuickActions();
    }
    
    setupQuickActions() {
        // Botón de actualizar estadísticas
        const refreshStatsBtn = document.getElementById('refreshStats');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => {
                this.updateStats();
                this.showNotification('Estadísticas actualizadas', 'success');
            });
        }
        
        // Botón de exportar datos
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        // Botón de backup
        const backupBtn = document.getElementById('backupData');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.createBackup());
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            document.getElementById('pdfFile').files = files;
            this.updateUploadArea(files[0]);
        } else {
            this.showNotification('Por favor, selecciona un archivo PDF válido.', 'warning');
        }
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                this.updateUploadArea(file);
            } else {
                this.showNotification('Solo se permiten archivos PDF.', 'warning');
                e.target.value = '';
            }
        }
    }
    
    updateUploadArea(file) {
        const uploadArea = document.getElementById('uploadArea');
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        uploadArea.innerHTML = `
            <i class="fa fa-file-pdf-o fa-3x text-success mb-3"></i>
            <h5 class="text-success">Archivo seleccionado</h5>
            <p class="text-muted">${file.name}</p>
            <p class="text-muted">${fileSize} MB</p>
            <small class="text-muted">Haz clic para cambiar el archivo</small>
        `;
    }
    
    handleUpload(e) {
        e.preventDefault();
        
        const title = document.getElementById('editionTitle').value.trim();
        const year = document.getElementById('editionYear').value;
        const topics = document.getElementById('editionTopics').value.trim();
        const thumbnail = document.getElementById('thumbnailUrl').value.trim();
        const file = document.getElementById('pdfFile').files[0];
        
        // Validaciones
        if (!title) {
            this.showNotification('El título es obligatorio.', 'warning');
            return;
        }
        
        if (!topics) {
            this.showNotification('Los temas principales son obligatorios.', 'warning');
            return;
        }
        
        if (!file && !this.editingPdf) {
            this.showNotification('Por favor, selecciona un archivo PDF.', 'warning');
            return;
        }
        
        // Verificar si es edición o nuevo archivo
        if (this.editingPdf) {
            this.updatePdf(this.editingPdf, title, year, topics, thumbnail, file);
        } else {
            this.uploadNewPdf(title, year, topics, thumbnail, file);
        }
    }
    
    uploadNewPdf(title, year, topics, thumbnail, file) {
        this.simulateUpload(title, year, topics, thumbnail, file, false);
    }
    
    updatePdf(id, title, year, topics, thumbnail, file) {
        const pdf = this.pdfData.find(p => p.id === id);
        if (pdf) {
            pdf.title = title;
            pdf.year = parseInt(year);
            pdf.author = topics;
            if (thumbnail) pdf.thumbnail = thumbnail;
            if (file) {
                pdf.pdfUrl = `../pdf/${file.name}`;
                pdf.size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
            }
            
            this.loadFilesList();
            this.updateStats();
            this.resetUploadForm();
            this.showNotification('Edición actualizada exitosamente!', 'success');
            
            setTimeout(() => {
                this.showSection('manage');
                document.querySelector('[data-section="manage"]').classList.add('active');
                document.querySelector('[data-section="upload"]').classList.remove('active');
            }, 1500);
        }
    }
    
    simulateUpload(title, year, topics, thumbnail, file, isUpdate = false) {
        const progressContainer = document.getElementById('uploadProgress');
        const progressBar = progressContainer.querySelector('.progress-bar');
        
        progressContainer.style.display = 'block';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                
                if (!isUpdate) {
                    // Agregar nuevo PDF
                    const newPdf = {
                        id: Math.max(...this.pdfData.map(p => p.id)) + 1,
                        title: title,
                        author: topics,
                        category: `#${this.pdfData.length + 1}`,
                        year: parseInt(year),
                        thumbnail: thumbnail || 'https://via.placeholder.com/320x240?text=PDF',
                        pdfUrl: `../pdf/${file.name}`,
                        uploadDate: new Date().toISOString().split('T')[0],
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                        views: 0,
                        downloads: 0
                    };
                    
                    this.pdfData.push(newPdf);
                }
                
                this.resetUploadForm();
                progressContainer.style.display = 'none';
                
                this.calculateStats();
                this.updateStats();
                this.loadFilesList();
                
                this.showNotification(
                    isUpdate ? 'Edición actualizada exitosamente!' : '¡Edición subida exitosamente!', 
                    'success'
                );
                
                setTimeout(() => {
                    this.showSection('manage');
                    document.querySelector('[data-section="manage"]').classList.add('active');
                    document.querySelector('[data-section="upload"]').classList.remove('active');
                }, 1500);
            }
        }, 100);
    }
    
    resetUploadForm() {
        document.getElementById('uploadForm').reset();
        this.resetUploadArea();
        this.editingPdf = null;
        
        // Cambiar texto del botón
        const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa fa-upload me-2"></i>Subir Edición';
        }
    }
    
    resetUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.innerHTML = `
            <i class="fa fa-cloud-upload fa-3x text-primary mb-3"></i>
            <h5>Arrastra tu archivo PDF aquí</h5>
            <p class="text-muted">o haz clic para seleccionar</p>
            <small class="text-muted">Archivos PDF únicamente</small>
        `;
    }
    
    loadFilesList() {
        const filesList = document.getElementById('filesList');
        
        if (!filesList) return;
        
        if (this.pdfData.length === 0) {
            filesList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fa fa-folder-open fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay archivos disponibles</h5>
                    <p class="text-muted">Sube tu primera edición para comenzar</p>
                    <button class="btn btn-primary" onclick="enhancedDashboard.showSection('upload')">
                        <i class="fa fa-plus me-2"></i>Subir Primera Edición
                    </button>
                </div>
            `;
            return;
        }
        
        filesList.innerHTML = this.pdfData.map(pdf => `
            <div class="file-item" data-id="${pdf.id}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${pdf.thumbnail}" alt="${pdf.title}" 
                             class="img-fluid rounded shadow-sm" 
                             style="max-height: 80px; object-fit: cover;">
                    </div>
                    <div class="col-md-6">
                        <h6 class="mb-1 text-primary fw-bold">${pdf.title}</h6>
                        <p class="mb-1 text-muted small">${pdf.author}</p>
                        <div class="d-flex gap-3">
                            <small class="text-muted">
                                <i class="fa fa-calendar me-1"></i>${this.formatDate(pdf.uploadDate)}
                            </small>
                            <small class="text-muted">
                                <i class="fa fa-file-pdf-o me-1"></i>${pdf.size}
                            </small>
                            <small class="text-muted">
                                <i class="fa fa-eye me-1"></i>${pdf.views} vistas
                            </small>
                            <small class="text-muted">
                                <i class="fa fa-download me-1"></i>${pdf.downloads} descargas
                            </small>
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="enhancedDashboard.previewPdf('${pdf.pdfUrl}', '${pdf.title}')"
                                    title="Ver documento">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-info btn-sm" 
                                    onclick="enhancedDashboard.editPdf(${pdf.id})"
                                    title="Editar">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-success btn-sm" 
                                    onclick="enhancedDashboard.downloadPdf('${pdf.pdfUrl}', '${pdf.title}')"
                                    title="Descargar">
                                <i class="fa fa-download"></i>
                            </button>
                            <button class="btn btn-outline-warning btn-sm" 
                                    onclick="enhancedDashboard.duplicatePdf(${pdf.id})"
                                    title="Duplicar">
                                <i class="fa fa-copy"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="enhancedDashboard.confirmDelete(${pdf.id}, '${pdf.title}')"
                                    title="Eliminar">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updateStats() {
        this.calculateStats();
        
        const totalPdfsEl = document.getElementById('totalPdfs');
        if (totalPdfsEl) totalPdfsEl.textContent = this.pdfData.length;
        
        // Actualizar estadísticas adicionales si existen
        const totalViewsEl = document.querySelector('.stat-number:nth-of-type(2)');
        if (totalViewsEl) totalViewsEl.textContent = this.stats.totalViews.toLocaleString();
        
        const totalDownloadsEl = document.querySelector('.stat-number:nth-of-type(3)');
        if (totalDownloadsEl) totalDownloadsEl.textContent = this.stats.totalDownloads.toLocaleString();
        
        const totalSizeEl = document.querySelector('.stat-number:nth-of-type(4)');
        if (totalSizeEl) totalSizeEl.textContent = this.stats.totalSize.toFixed(1) + ' MB';
    }
    
    previewPdf(pdfUrl, title) {
        // Incrementar contador de vistas
        const pdf = this.pdfData.find(p => p.pdfUrl === pdfUrl);
        if (pdf) {
            pdf.views++;
            this.updateStats();
            this.loadFilesList();
        }
        
        // Abrir en el visor mejorado si está disponible
        if (typeof enhancedPdfViewer !== 'undefined') {
            enhancedPdfViewer.open(pdfUrl, title);
        } else {
            // Fallback: abrir en nueva ventana
            window.open(pdfUrl, '_blank');
        }
        
        this.showNotification(`Abriendo "${title}"`, 'info');
    }
    
    downloadPdf(pdfUrl, title) {
        // Incrementar contador de descargas
        const pdf = this.pdfData.find(p => p.pdfUrl === pdfUrl);
        if (pdf) {
            pdf.downloads++;
            this.updateStats();
            this.loadFilesList();
        }
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${title}.pdf`;
        link.click();
        
        this.showNotification(`Descargando "${title}"`, 'success');
    }
    
    editPdf(id) {
        const pdf = this.pdfData.find(p => p.id === id);
        if (pdf) {
            this.editingPdf = id;
            
            // Llenar formulario con datos existentes
            document.getElementById('editionTitle').value = pdf.title;
            document.getElementById('editionYear').value = pdf.year;
            document.getElementById('editionTopics').value = pdf.author;
            document.getElementById('thumbnailUrl').value = pdf.thumbnail;
            
            // Cambiar texto del botón
            const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fa fa-save me-2"></i>Actualizar Edición';
            }
            
            // Cambiar a sección de upload
            this.showSection('upload');
            document.querySelector('[data-section="upload"]').classList.add('active');
            document.querySelector('[data-section="manage"]').classList.remove('active');
            
            this.showNotification('Datos cargados para edición', 'info');
        }
    }
    
    duplicatePdf(id) {
        const pdf = this.pdfData.find(p => p.id === id);
        if (pdf) {
            const newPdf = {
                ...pdf,
                id: Math.max(...this.pdfData.map(p => p.id)) + 1,
                title: pdf.title + ' (Copia)',
                uploadDate: new Date().toISOString().split('T')[0],
                views: 0,
                downloads: 0
            };
            
            this.pdfData.push(newPdf);
            this.calculateStats();
            this.updateStats();
            this.loadFilesList();
            
            this.showNotification(`"${pdf.title}" duplicado exitosamente`, 'success');
        }
    }
    
    confirmDelete(id, title) {
        this.fileToDelete = id;
        
        const confirmModal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        
        if (confirmMessage) {
            confirmMessage.textContent = 
                `¿Estás seguro de que deseas eliminar "${title}"? Esta acción no se puede deshacer.`;
        }
        
        if (confirmModal) {
            const modal = new bootstrap.Modal(confirmModal);
            modal.show();
            
            const confirmBtn = document.getElementById('confirmAction');
            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    this.deletePdf(this.fileToDelete);
                    modal.hide();
                };
            }
        }
    }
    
    deletePdf(id) {
        const index = this.pdfData.findIndex(p => p.id === id);
        if (index !== -1) {
            const deletedPdf = this.pdfData.splice(index, 1)[0];
            this.calculateStats();
            this.loadFilesList();
            this.updateStats();
            this.showNotification(`"${deletedPdf.title}" ha sido eliminado exitosamente.`, 'success');
        }
    }
    
    filterFiles(searchTerm) {
        const fileItems = document.querySelectorAll('.file-item');
        const term = searchTerm.toLowerCase();
        
        fileItems.forEach(item => {
            const title = item.querySelector('h6').textContent.toLowerCase();
            const author = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(term) || author.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    filterByYear(year) {
        const fileItems = document.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            const id = parseInt(item.dataset.id);
            const pdf = this.pdfData.find(p => p.id === id);
            
            if (!year || pdf.year.toString() === year) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.pdfData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `hag-noticias-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Datos exportados exitosamente', 'success');
    }
    
    createBackup() {
        const backup = {
            data: this.pdfData,
            stats: this.stats,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const backupStr = JSON.stringify(backup, null, 2);
        const backupBlob = new Blob([backupStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(backupBlob);
        link.download = `hag-noticias-full-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Backup creado exitosamente', 'success');
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('hagNoticiasSettings') || '{}');
        
        // Cargar configuraciones en el formulario
        const siteName = document.getElementById('siteName');
        if (siteName) siteName.value = settings.siteName || 'HAG Noticias';
        
        const siteDescription = document.getElementById('siteDescription');
        if (siteDescription) siteDescription.value = settings.siteDescription || 'Portal de Noticias Institucional';
        
        const maxFileSize = document.getElementById('maxFileSize');
        if (maxFileSize) maxFileSize.value = settings.maxFileSize || '10';
        
        const autoBackup = document.getElementById('autoBackup');
        if (autoBackup) autoBackup.checked = settings.autoBackup || false;
    }
    
    saveSettings(e) {
        e.preventDefault();
        
        const settings = {
            siteName: document.getElementById('siteName').value,
            siteDescription: document.getElementById('siteDescription').value,
            maxFileSize: document.getElementById('maxFileSize').value,
            autoBackup: document.getElementById('autoBackup').checked,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('hagNoticiasSettings', JSON.stringify(settings));
        this.showNotification('Configuraciones guardadas exitosamente', 'success');
    }
    
    setupAutoSave() {
        // Guardar datos automáticamente cada 5 minutos
        setInterval(() => {
            localStorage.setItem('hagNoticiasData', JSON.stringify(this.pdfData));
        }, 5 * 60 * 1000);
        
        // Cargar datos guardados al iniciar
        const savedData = localStorage.getItem('hagNoticiasData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    this.pdfData = parsedData;
                    this.calculateStats();
                }
            } catch (error) {
                console.warn('Error cargando datos guardados:', error);
            }
        }
    }
    
    updateDashboardCharts() {
        // Aquí se pueden agregar gráficos con Chart.js o similar
        // Por ahora, solo actualizamos las estadísticas
        this.updateStats();
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show notification slide-in`;
        notification.innerHTML = `
            <i class="fa fa-${this.getIconForType(type)} me-2"></i>
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
    
    getIconForType(type) {
        const icons = {
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'danger': 'times-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    logout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('loginTime');
            localStorage.removeItem('hagNoticiasData');
            window.location.href = 'login.html';
        }
    }
}

// Función global para logout
function logout() {
    if (window.enhancedDashboard) {
        window.enhancedDashboard.logout();
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // Crear instancia del dashboard mejorado
    window.enhancedDashboard = new EnhancedDashboard();
    
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
});

