// Nuevo visor de PDF moderno y funcional
class ModernPDFViewer {
    constructor() {
        this.currentPdf = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.2;
        this.isRendering = false;
        this.canvas = null;
        this.context = null;
        this.modal = null;
        
        this.init();
    }
    
    init() {
        this.createModal();
        this.bindEvents();
    }
    
    createModal() {
        // Crear el modal del visor de PDF
        const modalHTML = `
            <div id="modernPdfModal" class="modern-pdf-modal" style="display: none;">
                <div class="modern-pdf-overlay" onclick="modernPdfViewer.close()"></div>
                <div class="modern-pdf-container">
                    <div class="modern-pdf-header">
                        <div class="modern-pdf-title">Visor de PDF</div>
                        <div class="modern-pdf-controls">
                            <button id="modernPdfPrev" class="modern-pdf-btn" title="Página anterior">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span id="modernPdfPageInfo" class="modern-pdf-page-info">1 / 1</span>
                            <button id="modernPdfNext" class="modern-pdf-btn" title="Página siguiente">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <div class="modern-pdf-divider"></div>
                            <button id="modernPdfZoomOut" class="modern-pdf-btn" title="Reducir zoom">
                                <i class="fas fa-search-minus"></i>
                            </button>
                            <span id="modernPdfZoomLevel" class="modern-pdf-zoom-info">120%</span>
                            <button id="modernPdfZoomIn" class="modern-pdf-btn" title="Aumentar zoom">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <div class="modern-pdf-divider"></div>
                            <button id="modernPdfFullscreen" class="modern-pdf-btn" title="Pantalla completa">
                                <i class="fas fa-expand"></i>
                            </button>
                            <button id="modernPdfClose" class="modern-pdf-btn modern-pdf-close" title="Cerrar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="modern-pdf-content">
                        <div id="modernPdfLoading" class="modern-pdf-loading">
                            <div class="modern-pdf-spinner"></div>
                            <p>Cargando PDF...</p>
                        </div>
                        <canvas id="modernPdfCanvas" class="modern-pdf-canvas"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        this.modal = document.getElementById('modernPdfModal');
        this.canvas = document.getElementById('modernPdfCanvas');
        this.context = this.canvas.getContext('2d');
    }
    
    bindEvents() {
        // Controles del visor
        document.getElementById('modernPdfPrev').addEventListener('click', () => this.previousPage());
        document.getElementById('modernPdfNext').addEventListener('click', () => this.nextPage());
        document.getElementById('modernPdfZoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('modernPdfZoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('modernPdfFullscreen').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('modernPdfClose').addEventListener('click', () => this.close());
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'block') {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousPage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextPage();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.close();
                        break;
                    case '+':
                    case '=':
                        e.preventDefault();
                        this.zoomIn();
                        break;
                    case '-':
                        e.preventDefault();
                        this.zoomOut();
                        break;
                }
            }
        });
        
        // Scroll para zoom
        this.canvas.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        });
    }
    
    async open(pdfUrl) {
        try {
            this.showLoading(true);
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Cargar el PDF
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            this.currentPdf = await loadingTask.promise;
            this.totalPages = this.currentPdf.numPages;
            this.currentPage = 1;
            
            await this.renderPage();
            this.updateControls();
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error al cargar PDF:', error);
            this.showError('Error al cargar el PDF. Por favor, inténtalo de nuevo.');
        }
    }
    
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        
        if (this.currentPdf) {
            this.currentPdf.destroy();
            this.currentPdf = null;
        }
        
        // Limpiar canvas
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Salir de pantalla completa si está activa
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
    
    async renderPage() {
        if (this.isRendering || !this.currentPdf) return;
        
        this.isRendering = true;
        
        try {
            const page = await this.currentPdf.getPage(this.currentPage);
            const viewport = page.getViewport({ scale: this.scale });
            
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;
            
            const renderContext = {
                canvasContext: this.context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
        } catch (error) {
            console.error('Error al renderizar página:', error);
        } finally {
            this.isRendering = false;
        }
    }
    
    async previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.renderPage();
            this.updateControls();
        }
    }
    
    async nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            await this.renderPage();
            this.updateControls();
        }
    }
    
    async zoomIn() {
        if (this.scale < 3.0) {
            this.scale = Math.min(this.scale * 1.2, 3.0);
            await this.renderPage();
            this.updateControls();
        }
    }
    
    async zoomOut() {
        if (this.scale > 0.5) {
            this.scale = Math.max(this.scale * 0.8, 0.5);
            await this.renderPage();
            this.updateControls();
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.modal.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    updateControls() {
        document.getElementById('modernPdfPageInfo').textContent = `${this.currentPage} / ${this.totalPages}`;
        document.getElementById('modernPdfZoomLevel').textContent = `${Math.round(this.scale * 100)}%`;
        
        document.getElementById('modernPdfPrev').disabled = this.currentPage <= 1;
        document.getElementById('modernPdfNext').disabled = this.currentPage >= this.totalPages;
    }
    
    showLoading(show) {
        const loading = document.getElementById('modernPdfLoading');
        const canvas = this.canvas;
        
        if (show) {
            loading.style.display = 'flex';
            canvas.style.display = 'none';
        } else {
            loading.style.display = 'none';
            canvas.style.display = 'block';
        }
    }
    
    showError(message) {
        const loading = document.getElementById('modernPdfLoading');
        loading.innerHTML = `
            <div class="modern-pdf-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
        loading.style.display = 'flex';
        this.canvas.style.display = 'none';
    }
}

// Inicializar el visor moderno
const modernPdfViewer = new ModernPDFViewer();

// Función global para abrir PDFs
window.openModernPDF = function(pdfUrl) {
    modernPdfViewer.open(pdfUrl);
};

