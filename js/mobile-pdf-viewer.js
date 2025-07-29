// Mobile PDF Viewer - Magazine Style
class MobilePDFViewer {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1;
        this.minScale = 0.5;
        this.maxScale = 3;
        this.canvas = null;
        this.ctx = null;
        this.isLoading = false;
        this.isRendering = false;
        this.gestureStartScale = 1;
        this.gestureStartDistance = 0;
        this.lastTouchTime = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.controlsVisible = true;
        this.controlsTimeout = null;
        
        this.init();
    }
    
    init() {
        this.createViewer();
        this.bindEvents();
        this.setupGestures();
    }
    
    createViewer() {
        // Crear el contenedor principal del visor
        const viewer = document.createElement('div');
        viewer.className = 'mobile-pdf-viewer';
        viewer.id = 'mobilePdfViewer';
        
        viewer.innerHTML = `
            <div class="pdf-viewer-header">
                <button class="pdf-viewer-close" id="pdfViewerClose">
                    <i class="fas fa-times"></i>
                </button>
                <h3 class="pdf-viewer-title" id="pdfViewerTitle">Cargando...</h3>
                <button class="pdf-nav-button" id="pdfFullscreenBtn">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
            
            <div class="pdf-viewer-container" id="pdfViewerContainer">
                <div class="pdf-loading" id="pdfLoading">
                    <div class="pdf-loading-spinner"></div>
                    <p>Cargando PDF...</p>
                </div>
                
                <div class="pdf-canvas-container" id="pdfCanvasContainer">
                    <canvas id="pdfCanvas" class="pdf-canvas"></canvas>
                </div>
                
                <div class="pdf-error" id="pdfError" style="display: none;">
                    <div class="pdf-error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="pdf-error-message">Error al cargar el PDF</div>
                    <button class="pdf-error-retry" id="pdfErrorRetry">Reintentar</button>
                </div>
                
                <div class="pdf-zoom-controls" id="pdfZoomControls">
                    <button class="pdf-zoom-button" id="pdfZoomIn">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="pdf-zoom-button" id="pdfZoomOut">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="pdf-zoom-button" id="pdfZoomReset">
                        <i class="fas fa-expand-arrows-alt"></i>
                    </button>
                </div>
                
                <div class="pdf-swipe-indicator left" id="pdfSwipeLeft">
                    <i class="fas fa-chevron-left"></i>
                </div>
                <div class="pdf-swipe-indicator right" id="pdfSwipeRight">
                    <i class="fas fa-chevron-right"></i>
                </div>
                
                <div class="pdf-gesture-hint" id="pdfGestureHint">
                    Desliza para cambiar página • Pellizca para hacer zoom
                </div>
            </div>
            
            <div class="pdf-navigation visible" id="pdfNavigation">
                <button class="pdf-nav-button" id="pdfPrevPage">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="pdf-page-info" id="pdfPageInfo">
                    <span id="pdfCurrentPage">1</span> / <span id="pdfTotalPages">1</span>
                </div>
                
                <button class="pdf-nav-button" id="pdfNextPage">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(viewer);
        
        // Referencias a elementos
        this.viewer = viewer;
        this.container = document.getElementById('pdfViewerContainer');
        this.canvasContainer = document.getElementById('pdfCanvasContainer');
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.loading = document.getElementById('pdfLoading');
        this.error = document.getElementById('pdfError');
        this.navigation = document.getElementById('pdfNavigation');
        this.zoomControls = document.getElementById('pdfZoomControls');
        this.gestureHint = document.getElementById('pdfGestureHint');
    }
    
    bindEvents() {
        // Cerrar visor
        document.getElementById('pdfViewerClose').addEventListener('click', () => {
            this.close();
        });
        
        // Navegación
        document.getElementById('pdfPrevPage').addEventListener('click', () => {
            this.previousPage();
        });
        
        document.getElementById('pdfNextPage').addEventListener('click', () => {
            this.nextPage();
        });
        
        // Zoom
        document.getElementById('pdfZoomIn').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('pdfZoomOut').addEventListener('click', () => {
            this.zoomOut();
        });
        
        document.getElementById('pdfZoomReset').addEventListener('click', () => {
            this.resetZoom();
        });
        
        // Pantalla completa
        document.getElementById('pdfFullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Reintentar carga
        document.getElementById('pdfErrorRetry').addEventListener('click', () => {
            this.retryLoad();
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            if (this.viewer.classList.contains('active')) {
                this.handleKeyboard(e);
            }
        });
        
        // Ocultar controles automáticamente
        this.container.addEventListener('click', () => {
            this.showControls();
        });
        
        // Prevenir scroll del body cuando el visor está activo
        this.viewer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    setupGestures() {
        let touches = [];
        let lastTap = 0;
        
        // Touch start
        this.canvasContainer.addEventListener('touchstart', (e) => {
            touches = Array.from(e.touches);
            this.showControls();
            
            if (touches.length === 1) {
                // Single touch - preparar para drag o swipe
                const touch = touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
                this.isDragging = false;
                this.dragStartX = touch.clientX;
                this.dragStartY = touch.clientY;
                
                // Detectar doble tap
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 500 && tapLength > 0) {
                    this.handleDoubleTap(touch.clientX, touch.clientY);
                }
                lastTap = currentTime;
                
            } else if (touches.length === 2) {
                // Pinch zoom start
                this.gestureStartScale = this.scale;
                this.gestureStartDistance = this.getDistance(touches[0], touches[1]);
            }
        }, { passive: false });
        
        // Touch move
        this.canvasContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            touches = Array.from(e.touches);
            
            if (touches.length === 1) {
                // Single touch - drag o swipe
                const touch = touches[0];
                const deltaX = touch.clientX - this.dragStartX;
                const deltaY = touch.clientY - this.dragStartY;
                
                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    this.isDragging = true;
                    this.canvasContainer.classList.add('dragging');
                    
                    if (this.scale > 1) {
                        // Drag cuando hay zoom
                        this.canvasOffsetX += deltaX;
                        this.canvasOffsetY += deltaY;
                        this.updateCanvasTransform();
                    }
                    
                    this.dragStartX = touch.clientX;
                    this.dragStartY = touch.clientY;
                }
                
            } else if (touches.length === 2) {
                // Pinch zoom
                const distance = this.getDistance(touches[0], touches[1]);
                const scaleChange = distance / this.gestureStartDistance;
                const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.gestureStartScale * scaleChange));
                
                if (newScale !== this.scale) {
                    this.scale = newScale;
                    this.renderCurrentPage();
                }
            }
        }, { passive: false });
        
        // Touch end
        this.canvasContainer.addEventListener('touchend', (e) => {
            const remainingTouches = Array.from(e.touches);
            
            if (remainingTouches.length === 0 && touches.length === 1) {
                // Single touch end - detectar swipe
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - this.touchStartX;
                const deltaY = touch.clientY - this.touchStartY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                this.canvasContainer.classList.remove('dragging');
                
                if (!this.isDragging && distance > 50) {
                    // Swipe detectado
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        if (deltaX > 0) {
                            this.previousPage();
                            this.showSwipeIndicator('left');
                        } else {
                            this.nextPage();
                            this.showSwipeIndicator('right');
                        }
                    }
                }
                
                this.isDragging = false;
            }
            
            touches = remainingTouches;
        });
        
        // Mouse events para desktop
        this.canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.ctrlKey) {
                // Zoom con Ctrl + scroll
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * delta));
                this.renderCurrentPage();
            }
        }, { passive: false });
    }
    
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    handleDoubleTap(x, y) {
        if (this.scale === 1) {
            this.scale = 2;
        } else {
            this.scale = 1;
            this.canvasOffsetX = 0;
            this.canvasOffsetY = 0;
        }
        this.renderCurrentPage();
    }
    
    handleKeyboard(e) {
        switch (e.key) {
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
            case '0':
                e.preventDefault();
                this.resetZoom();
                break;
        }
    }
    
    showControls() {
        this.controlsVisible = true;
        this.navigation.classList.add('visible');
        this.zoomControls.classList.add('visible');
        
        // Auto-hide después de 3 segundos
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = setTimeout(() => {
            this.hideControls();
        }, 3000);
    }
    
    hideControls() {
        this.controlsVisible = false;
        this.navigation.classList.remove('visible');
        this.zoomControls.classList.remove('visible');
    }
    
    showSwipeIndicator(direction) {
        const indicator = document.getElementById(`pdfSwipe${direction === 'left' ? 'Left' : 'Right'}`);
        indicator.classList.add('visible');
        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 1000);
    }
    
    showGestureHint() {
        this.gestureHint.classList.add('visible');
        setTimeout(() => {
            this.gestureHint.classList.remove('visible');
        }, 3000);
    }
    
    updateCanvasTransform() {
        this.canvas.style.transform = `translate(${this.canvasOffsetX}px, ${this.canvasOffsetY}px)`;
    }
    
    async open(pdfUrl, title = 'PDF') {
        this.viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        document.getElementById('pdfViewerTitle').textContent = title;
        this.showLoading();
        this.showGestureHint();
        
        try {
            if (typeof pdfjsLib === 'undefined' || !pdfjsLib.getDocument) {
                console.error('PDF.js library not loaded.');
                this.showError();
                return;
            }
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            this.currentPage = 1;
            
            this.updatePageInfo();
            await this.renderCurrentPage();
            this.hideLoading();
            this.showControls();
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError();
        }
    }
    
    close() {
        this.viewer.classList.remove('active');
        document.body.style.overflow = '';
        
        // Limpiar estado
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        
        // Limpiar canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    async renderCurrentPage() {
        if (!this.pdfDoc || this.isRendering) return;
        
        this.isRendering = true;
        
        try {
            const page = await this.pdfDoc.getPage(this.currentPage);
            
            // Calcular escala basada en el ancho de la pantalla
            const containerWidth = this.container.clientWidth - 40; // padding
            const containerHeight = this.container.clientHeight - 40;
            const viewport = page.getViewport({ scale: 1 });
            
            const scaleX = containerWidth / viewport.width;
            const scaleY = containerHeight / viewport.height;
            const autoScale = Math.min(scaleX, scaleY);
            
            const finalScale = autoScale * this.scale;
            const scaledViewport = page.getViewport({ scale: finalScale });
            
            // Configurar canvas
            this.canvas.width = scaledViewport.width;
            this.canvas.height = scaledViewport.height;
            
            // Renderizar
            const renderContext = {
                canvasContext: this.ctx,
                viewport: scaledViewport
            };
            
            await page.render(renderContext).promise;
            this.updateCanvasTransform();
            
        } catch (error) {
            console.error('Error rendering page:', error);
            this.showError();
        }
        
        this.isRendering = false;
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePageInfo();
            this.renderCurrentPage();
            this.resetPanZoom();
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePageInfo();
            this.renderCurrentPage();
            this.resetPanZoom();
        }
    }
    
    zoomIn() {
        this.scale = Math.min(this.maxScale, this.scale * 1.2);
        this.renderCurrentPage();
    }
    
    zoomOut() {
        this.scale = Math.max(this.minScale, this.scale * 0.8);
        this.renderCurrentPage();
    }
    
    resetZoom() {
        this.scale = 1;
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.renderCurrentPage();
    }
    
    resetPanZoom() {
        this.canvasOffsetX = 0;
        this.canvasOffsetY = 0;
        this.updateCanvasTransform();
    }
    
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.viewer.requestFullscreen();
        }
    }
    
    updatePageInfo() {
        document.getElementById('pdfCurrentPage').textContent = this.currentPage;
        document.getElementById('pdfTotalPages').textContent = this.totalPages;
        
        // Actualizar botones de navegación
        const prevBtn = document.getElementById('pdfPrevPage');
        const nextBtn = document.getElementById('pdfNextPage');
        
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
    }
    
    showLoading() {
        this.loading.style.display = 'block';
        this.error.style.display = 'none';
        this.canvasContainer.style.display = 'none';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
        this.canvasContainer.style.display = 'flex';
    }
    
    showError() {
        this.loading.style.display = 'none';
        this.error.style.display = 'block';
        this.canvasContainer.style.display = 'none';
    }
    
    retryLoad() {
        // Implementar lógica de reintento si es necesario
        this.close();
    }
}

// Inicializar el visor móvil
window.mobilePdfViewer = new MobilePDFViewer();
    
    // Reemplazar los event listeners existentes del visor PDF
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-pdf') || e.target.closest('.view-pdf')) {
            e.preventDefault();
            const button = e.target.classList.contains('view-pdf') ? e.target : e.target.closest('.view-pdf');
            const pdfUrl = button.getAttribute('data-pdf');
            const title = button.closest('.card').querySelector('.card-title')?.textContent || 'PDF';
            
            // Mostrar loading en el botón
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fa fa-spinner fa-spin me-1"></i>Cargando...';
            button.disabled = true;
            
            // Abrir el visor móvil
            mobilePdfViewer.open(pdfUrl, title).finally(() => {
                button.innerHTML = originalContent;
                button.disabled = false;
            });
        }
    });
});

// Exportar para uso global
window.MobilePDFViewer = MobilePDFViewer;

