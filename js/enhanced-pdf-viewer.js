// Visor de PDF Profesional y Completo
class EnhancedPDFViewer {
    constructor() {
        this.currentPdf = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.2;
        this.isRendering = false;
        this.canvas = null;
        this.context = null;
        this.modal = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.currentSearchIndex = 0;
        this.isFullscreen = false;
        this.thumbnails = [];
        
        this.init();
    }
    
    init() {
        this.createModal();
        this.bindEvents();
        this.loadPDFJS();
    }
    
    loadPDFJS() {
        // Configurar PDF.js
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }
    
    createModal() {
        const modalHTML = `
            <div id="enhancedPdfModal" class="enhanced-pdf-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="pdfTitle">
                <div class="enhanced-pdf-overlay" onclick="enhancedPdfViewer.close()"></div>
                <div class="enhanced-pdf-container">
                    <!-- Header con controles -->
                    <div class="enhanced-pdf-header">
                        <div class="enhanced-pdf-title-section">
                            <h3 id="pdfTitle" class="enhanced-pdf-title">
                                <i class="fa fa-file-pdf-o"></i>
                                Visor de PDF Profesional
                            </h3>
                            <div class="enhanced-pdf-subtitle">HAGO Noticias - Ediciones</div>
                        </div>
                        
                        <div class="enhanced-pdf-toolbar">
                            <!-- Navegación -->
                            <div class="enhanced-pdf-nav-group">
                                <button id="enhancedPdfFirst" class="enhanced-pdf-btn" title="Primera página" aria-label="Primera página">
                                    <i class="fa fa-step-backward"></i>
                                </button>
                                <button id="enhancedPdfPrev" class="enhanced-pdf-btn" title="Página anterior" aria-label="Página anterior">
                                    <i class="fa fa-chevron-left"></i>
                                </button>
                                <div class="enhanced-pdf-page-input">
                                    <input type="number" id="enhancedPdfPageInput" min="1" value="1" aria-label="Número de página">
                                    <span id="enhancedPdfPageInfo">/ 1</span>
                                </div>
                                <button id="enhancedPdfNext" class="enhanced-pdf-btn" title="Página siguiente" aria-label="Página siguiente">
                                    <i class="fa fa-chevron-right"></i>
                                </button>
                                <button id="enhancedPdfLast" class="enhanced-pdf-btn" title="Última página" aria-label="Última página">
                                    <i class="fa fa-step-forward"></i>
                                </button>
                            </div>
                            
                            <!-- Zoom -->
                            <div class="enhanced-pdf-zoom-group">
                                <button id="enhancedPdfZoomOut" class="enhanced-pdf-btn" title="Reducir zoom" aria-label="Reducir zoom">
                                    <i class="fa fa-search-minus"></i>
                                </button>
                                <select id="enhancedPdfZoomSelect" class="enhanced-pdf-select" aria-label="Nivel de zoom">
                                    <option value="0.5">50%</option>
                                    <option value="0.75">75%</option>
                                    <option value="1">100%</option>
                                    <option value="1.2" selected>120%</option>
                                    <option value="1.5">150%</option>
                                    <option value="2">200%</option>
                                    <option value="fit-width">Ajustar ancho</option>
                                    <option value="fit-page">Ajustar página</option>
                                </select>
                                <button id="enhancedPdfZoomIn" class="enhanced-pdf-btn" title="Aumentar zoom" aria-label="Aumentar zoom">
                                    <i class="fa fa-search-plus"></i>
                                </button>
                            </div>
                            
                            <!-- Búsqueda -->
                            <div class="enhanced-pdf-search-group">
                                <div class="enhanced-pdf-search-input">
                                    <input type="text" id="enhancedPdfSearchInput" placeholder="Buscar en el documento..." aria-label="Buscar texto">
                                    <button id="enhancedPdfSearchBtn" class="enhanced-pdf-search-btn" title="Buscar" aria-label="Buscar">
                                        <i class="fa fa-search"></i>
                                    </button>
                                </div>
                                <div id="enhancedPdfSearchResults" class="enhanced-pdf-search-results" style="display: none;">
                                    <button id="enhancedPdfSearchPrev" class="enhanced-pdf-btn-sm" title="Resultado anterior">
                                        <i class="fa fa-chevron-up"></i>
                                    </button>
                                    <span id="enhancedPdfSearchInfo">0 / 0</span>
                                    <button id="enhancedPdfSearchNext" class="enhanced-pdf-btn-sm" title="Siguiente resultado">
                                        <i class="fa fa-chevron-down"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Herramientas -->
                            <div class="enhanced-pdf-tools-group">
                                <button id="enhancedPdfThumbnails" class="enhanced-pdf-btn" title="Mostrar miniaturas" aria-label="Mostrar miniaturas">
                                    <i class="fa fa-th-large"></i>
                                </button>
                                <button id="enhancedPdfRotate" class="enhanced-pdf-btn" title="Rotar página" aria-label="Rotar página">
                                    <i class="fa fa-rotate-right"></i>
                                </button>
                                <button id="enhancedPdfDownload" class="enhanced-pdf-btn" title="Descargar PDF" aria-label="Descargar PDF">
                                    <i class="fa fa-download"></i>
                                </button>
                                <button id="enhancedPdfFullscreen" class="enhanced-pdf-btn" title="Pantalla completa" aria-label="Pantalla completa">
                                    <i class="fa fa-expand"></i>
                                </button>
                                <button id="enhancedPdfClose" class="enhanced-pdf-btn enhanced-pdf-close" title="Cerrar" aria-label="Cerrar">
                                    <i class="fa fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="enhanced-pdf-main">
                        <!-- Panel lateral de miniaturas -->
                        <div id="enhancedPdfSidebar" class="enhanced-pdf-sidebar" style="display: none;">
                            <div class="enhanced-pdf-sidebar-header">
                                <h4>Miniaturas</h4>
                                <button id="enhancedPdfCloseSidebar" class="enhanced-pdf-btn-sm">
                                    <i class="fa fa-times"></i>
                                </button>
                            </div>
                            <div id="enhancedPdfThumbnailsList" class="enhanced-pdf-thumbnails-list">
                                <!-- Las miniaturas se generarán aquí -->
                            </div>
                        </div>
                        
                        <!-- Área de visualización -->
                        <div class="enhanced-pdf-viewer-area">
                            <div id="enhancedPdfLoading" class="enhanced-pdf-loading">
                                <div class="enhanced-pdf-spinner"></div>
                                <p>Cargando PDF...</p>
                                <div class="enhanced-pdf-progress">
                                    <div id="enhancedPdfProgressBar" class="enhanced-pdf-progress-bar"></div>
                                </div>
                            </div>
                            
                            <div id="enhancedPdfCanvasContainer" class="enhanced-pdf-canvas-container">
                                <canvas id="enhancedPdfCanvas" class="enhanced-pdf-canvas"></canvas>
                                <div id="enhancedPdfTextLayer" class="enhanced-pdf-text-layer"></div>
                            </div>
                            
                            <div id="enhancedPdfError" class="enhanced-pdf-error" style="display: none;">
                                <div class="enhanced-pdf-error-content">
                                    <i class="fa fa-exclamation-triangle"></i>
                                    <h3>Error al cargar el PDF</h3>
                                    <p id="enhancedPdfErrorMessage">Ha ocurrido un error inesperado.</p>
                                    <button id="enhancedPdfRetry" class="enhanced-pdf-btn-primary">
                                        <i class="fa fa-refresh"></i> Reintentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer con información -->
                    <div class="enhanced-pdf-footer">
                        <div class="enhanced-pdf-info">
                            <span id="enhancedPdfDocInfo">Documento cargado</span>
                        </div>
                        <div class="enhanced-pdf-shortcuts">
                            <span>Atajos: ← → (navegar) | Ctrl + (zoom) | Esc (cerrar)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        this.modal = document.getElementById('enhancedPdfModal');
        this.canvas = document.getElementById('enhancedPdfCanvas');
        this.context = this.canvas.getContext('2d');
    }
    
    bindEvents() {
        // Controles de navegación
        document.getElementById('enhancedPdfFirst').addEventListener('click', () => this.goToPage(1));
        document.getElementById('enhancedPdfPrev').addEventListener('click', () => this.previousPage());
        document.getElementById('enhancedPdfNext').addEventListener('click', () => this.nextPage());
        document.getElementById('enhancedPdfLast').addEventListener('click', () => this.goToPage(this.totalPages));
        
        // Input de página
        const pageInput = document.getElementById('enhancedPdfPageInput');
        pageInput.addEventListener('change', (e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= this.totalPages) {
                this.goToPage(page);
            } else {
                e.target.value = this.currentPage;
            }
        });
        
        // Controles de zoom
        document.getElementById('enhancedPdfZoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('enhancedPdfZoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('enhancedPdfZoomSelect').addEventListener('change', (e) => this.setZoom(e.target.value));
        
        // Búsqueda
        document.getElementById('enhancedPdfSearchBtn').addEventListener('click', () => this.search());
        document.getElementById('enhancedPdfSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
        document.getElementById('enhancedPdfSearchPrev').addEventListener('click', () => this.searchPrevious());
        document.getElementById('enhancedPdfSearchNext').addEventListener('click', () => this.searchNext());
        
        // Herramientas
        document.getElementById('enhancedPdfThumbnails').addEventListener('click', () => this.toggleThumbnails());
        document.getElementById('enhancedPdfCloseSidebar').addEventListener('click', () => this.hideThumbnails());
        document.getElementById('enhancedPdfRotate').addEventListener('click', () => this.rotatePage());
        document.getElementById('enhancedPdfDownload').addEventListener('click', () => this.downloadPDF());
        document.getElementById('enhancedPdfFullscreen').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('enhancedPdfClose').addEventListener('click', () => this.close());
        
        // Reintentar
        document.getElementById('enhancedPdfRetry').addEventListener('click', () => this.retry());
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'block') {
                this.handleKeyboard(e);
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
        
        // Arrastrar para mover
        this.setupCanvasDragging();
    }
    
    setupCanvasDragging() {
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;
        
        const container = document.getElementById('enhancedPdfCanvasContainer');
        
        container.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Solo botón izquierdo
                isDragging = true;
                startX = e.pageX - container.offsetLeft;
                startY = e.pageY - container.offsetTop;
                scrollLeft = container.scrollLeft;
                scrollTop = container.scrollTop;
                container.style.cursor = 'grabbing';
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = (x - startX) * 2;
            const walkY = (y - startY) * 2;
            container.scrollLeft = scrollLeft - walkX;
            container.scrollTop = scrollTop - walkY;
        });
        
        container.addEventListener('mouseup', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseleave', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextPage();
                break;
            case 'Home':
                e.preventDefault();
                this.goToPage(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToPage(this.totalPages);
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
            case '+':
            case '=':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.zoomIn();
                }
                break;
            case '-':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.zoomOut();
                }
                break;
            case 'f':
                if (e.ctrlKey) {
                    e.preventDefault();
                    document.getElementById('enhancedPdfSearchInput').focus();
                }
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
    
    async open(pdfUrl, title = 'Documento PDF') {
        try {
            this.showLoading(true);
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Actualizar título
            document.getElementById('pdfTitle').innerHTML = `<i class="fa fa-file-pdf-o"></i> ${title}`;
            
            // Cargar el PDF
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true
            });
            
            // Mostrar progreso de carga
            loadingTask.onProgress = (progress) => {
                if (progress.total > 0) {
                    const percent = (progress.loaded / progress.total) * 100;
                    document.getElementById('enhancedPdfProgressBar').style.width = percent + '%';
                }
            };
            
            this.currentPdf = await loadingTask.promise;
            this.totalPages = this.currentPdf.numPages;
            this.currentPage = 1;
            this.pdfUrl = pdfUrl;
            
            // Actualizar información del documento
            const info = await this.currentPdf.getMetadata();
            this.updateDocumentInfo(info);
            
            await this.renderPage();
            this.updateControls();
            this.showLoading(false);
            
            // Generar miniaturas en segundo plano
            this.generateThumbnails();
            
        } catch (error) {
            console.error('Error al cargar PDF:', error);
            this.showError('Error al cargar el PDF. Verifique que el archivo existe y es válido.');
        }
    }
    
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        
        if (this.currentPdf) {
            this.currentPdf.destroy();
            this.currentPdf = null;
        }
        
        // Limpiar canvas y estado
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.resetState();
        
        // Salir de pantalla completa si está activa
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
    
    resetState() {
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.2;
        this.searchTerm = '';
        this.searchResults = [];
        this.currentSearchIndex = 0;
        this.thumbnails = [];
        
        // Limpiar UI
        document.getElementById('enhancedPdfSearchInput').value = '';
        document.getElementById('enhancedPdfSearchResults').style.display = 'none';
        document.getElementById('enhancedPdfSidebar').style.display = 'none';
        document.getElementById('enhancedPdfError').style.display = 'none';
    }
    
    async renderPage() {
        if (this.isRendering || !this.currentPdf) return;
        
        this.isRendering = true;
        
        try {
            const page = await this.currentPdf.getPage(this.currentPage);
            let viewport = page.getViewport({ scale: this.scale });
            
            // Ajustar escala según el modo seleccionado
            const zoomSelect = document.getElementById('enhancedPdfZoomSelect');
            if (zoomSelect.value === 'fit-width') {
                const container = document.getElementById('enhancedPdfCanvasContainer');
                const containerWidth = container.clientWidth - 40; // Padding
                this.scale = containerWidth / viewport.width;
                viewport = page.getViewport({ scale: this.scale });
            } else if (zoomSelect.value === 'fit-page') {
                const container = document.getElementById('enhancedPdfCanvasContainer');
                const containerWidth = container.clientWidth - 40;
                const containerHeight = container.clientHeight - 40;
                const scaleX = containerWidth / viewport.width;
                const scaleY = containerHeight / viewport.height;
                this.scale = Math.min(scaleX, scaleY);
                viewport = page.getViewport({ scale: this.scale });
            }
            
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;
            
            const renderContext = {
                canvasContext: this.context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Renderizar capa de texto para búsqueda
            await this.renderTextLayer(page, viewport);
            
        } catch (error) {
            console.error('Error al renderizar página:', error);
            this.showError('Error al renderizar la página.');
        } finally {
            this.isRendering = false;
        }
    }
    
    async renderTextLayer(page, viewport) {
        const textLayer = document.getElementById('enhancedPdfTextLayer');
        textLayer.innerHTML = '';
        textLayer.style.width = viewport.width + 'px';
        textLayer.style.height = viewport.height + 'px';
        
        try {
            const textContent = await page.getTextContent();
            
            textContent.items.forEach((item) => {
                const div = document.createElement('div');
                div.textContent = item.str;
                div.style.position = 'absolute';
                div.style.left = item.transform[4] + 'px';
                div.style.top = (viewport.height - item.transform[5]) + 'px';
                div.style.fontSize = Math.abs(item.transform[0]) + 'px';
                div.style.fontFamily = item.fontName;
                div.style.opacity = '0';
                div.style.pointerEvents = 'none';
                textLayer.appendChild(div);
            });
        } catch (error) {
            console.warn('No se pudo renderizar la capa de texto:', error);
        }
    }
    
    // Métodos de navegación
    async goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages && pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            await this.renderPage();
            this.updateControls();
        }
    }
    
    async previousPage() {
        if (this.currentPage > 1) {
            await this.goToPage(this.currentPage - 1);
        }
    }
    
    async nextPage() {
        if (this.currentPage < this.totalPages) {
            await this.goToPage(this.currentPage + 1);
        }
    }
    
    // Métodos de zoom
    async zoomIn() {
        if (this.scale < 3.0) {
            this.scale = Math.min(this.scale * 1.2, 3.0);
            document.getElementById('enhancedPdfZoomSelect').value = this.scale.toFixed(1);
            await this.renderPage();
            this.updateControls();
        }
    }
    
    async zoomOut() {
        if (this.scale > 0.3) {
            this.scale = Math.max(this.scale * 0.8, 0.3);
            document.getElementById('enhancedPdfZoomSelect').value = this.scale.toFixed(1);
            await this.renderPage();
            this.updateControls();
        }
    }
    
    async setZoom(value) {
        if (value === 'fit-width' || value === 'fit-page') {
            await this.renderPage();
        } else {
            this.scale = parseFloat(value);
            await this.renderPage();
        }
        this.updateControls();
    }
    
    // Búsqueda
    async search() {
        const searchInput = document.getElementById('enhancedPdfSearchInput');
        const term = searchInput.value.trim();
        
        if (!term) {
            this.clearSearch();
            return;
        }
        
        this.searchTerm = term.toLowerCase();
        this.searchResults = [];
        this.currentSearchIndex = 0;
        
        // Buscar en todas las páginas
        for (let i = 1; i <= this.totalPages; i++) {
            try {
                const page = await this.currentPdf.getPage(i);
                const textContent = await page.getTextContent();
                const text = textContent.items.map(item => item.str).join(' ').toLowerCase();
                
                if (text.includes(this.searchTerm)) {
                    this.searchResults.push(i);
                }
            } catch (error) {
                console.warn(`Error buscando en página ${i}:`, error);
            }
        }
        
        this.updateSearchResults();
        
        if (this.searchResults.length > 0) {
            await this.goToPage(this.searchResults[0]);
        }
    }
    
    async searchNext() {
        if (this.searchResults.length > 0) {
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
            await this.goToPage(this.searchResults[this.currentSearchIndex]);
            this.updateSearchResults();
        }
    }
    
    async searchPrevious() {
        if (this.searchResults.length > 0) {
            this.currentSearchIndex = this.currentSearchIndex === 0 ? 
                this.searchResults.length - 1 : this.currentSearchIndex - 1;
            await this.goToPage(this.searchResults[this.currentSearchIndex]);
            this.updateSearchResults();
        }
    }
    
    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.currentSearchIndex = 0;
        document.getElementById('enhancedPdfSearchResults').style.display = 'none';
    }
    
    updateSearchResults() {
        const resultsDiv = document.getElementById('enhancedPdfSearchResults');
        const infoSpan = document.getElementById('enhancedPdfSearchInfo');
        
        if (this.searchResults.length > 0) {
            resultsDiv.style.display = 'flex';
            infoSpan.textContent = `${this.currentSearchIndex + 1} / ${this.searchResults.length}`;
        } else if (this.searchTerm) {
            resultsDiv.style.display = 'flex';
            infoSpan.textContent = '0 / 0';
        } else {
            resultsDiv.style.display = 'none';
        }
    }
    
    // Miniaturas
    async generateThumbnails() {
        const thumbnailsList = document.getElementById('enhancedPdfThumbnailsList');
        thumbnailsList.innerHTML = '<div class="enhanced-pdf-thumbnails-loading">Generando miniaturas...</div>';
        
        for (let i = 1; i <= this.totalPages; i++) {
            try {
                const page = await this.currentPdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.2 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                const thumbnailDiv = document.createElement('div');
                thumbnailDiv.className = 'enhanced-pdf-thumbnail';
                thumbnailDiv.innerHTML = `
                    <canvas width="${viewport.width}" height="${viewport.height}"></canvas>
                    <div class="enhanced-pdf-thumbnail-number">${i}</div>
                `;
                
                const thumbnailCanvas = thumbnailDiv.querySelector('canvas');
                const thumbnailContext = thumbnailCanvas.getContext('2d');
                thumbnailContext.drawImage(canvas, 0, 0);
                
                thumbnailDiv.addEventListener('click', () => {
                    this.goToPage(i);
                    this.updateThumbnailSelection();
                });
                
                thumbnailsList.appendChild(thumbnailDiv);
                this.thumbnails.push(thumbnailDiv);
                
            } catch (error) {
                console.warn(`Error generando miniatura para página ${i}:`, error);
            }
        }
        
        // Remover mensaje de carga
        const loadingMsg = thumbnailsList.querySelector('.enhanced-pdf-thumbnails-loading');
        if (loadingMsg) {
            loadingMsg.remove();
        }
        
        this.updateThumbnailSelection();
    }
    
    updateThumbnailSelection() {
        this.thumbnails.forEach((thumbnail, index) => {
            if (index + 1 === this.currentPage) {
                thumbnail.classList.add('active');
            } else {
                thumbnail.classList.remove('active');
            }
        });
    }
    
    toggleThumbnails() {
        const sidebar = document.getElementById('enhancedPdfSidebar');
        if (sidebar.style.display === 'none') {
            sidebar.style.display = 'block';
            if (this.thumbnails.length === 0) {
                this.generateThumbnails();
            }
        } else {
            sidebar.style.display = 'none';
        }
    }
    
    hideThumbnails() {
        document.getElementById('enhancedPdfSidebar').style.display = 'none';
    }
    
    // Otras herramientas
    rotatePage() {
        // Esta funcionalidad requeriría modificar el viewport
        // Por simplicidad, mostraremos un mensaje
        this.showNotification('La rotación de páginas estará disponible en una futura actualización.');
    }
    
    downloadPDF() {
        if (this.pdfUrl) {
            const link = document.createElement('a');
            link.href = this.pdfUrl;
            link.download = 'documento.pdf';
            link.click();
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.modal.requestFullscreen().then(() => {
                this.isFullscreen = true;
                document.getElementById('enhancedPdfFullscreen').innerHTML = '<i class="fa fa-compress"></i>';
            });
        } else {
            document.exitFullscreen().then(() => {
                this.isFullscreen = false;
                document.getElementById('enhancedPdfFullscreen').innerHTML = '<i class="fa fa-expand"></i>';
            });
        }
    }
    
    // Utilidades
    updateControls() {
        document.getElementById('enhancedPdfPageInput').value = this.currentPage;
        document.getElementById('enhancedPdfPageInfo').textContent = `/ ${this.totalPages}`;
        
        // Actualizar botones de navegación
        document.getElementById('enhancedPdfFirst').disabled = this.currentPage <= 1;
        document.getElementById('enhancedPdfPrev').disabled = this.currentPage <= 1;
        document.getElementById('enhancedPdfNext').disabled = this.currentPage >= this.totalPages;
        document.getElementById('enhancedPdfLast').disabled = this.currentPage >= this.totalPages;
        
        // Actualizar zoom
        const zoomSelect = document.getElementById('enhancedPdfZoomSelect');
        if (!['fit-width', 'fit-page'].includes(zoomSelect.value)) {
            zoomSelect.value = this.scale.toFixed(1);
        }
        
        // Actualizar miniaturas
        this.updateThumbnailSelection();
    }
    
    updateDocumentInfo(metadata) {
        const info = metadata.info;
        let infoText = 'Documento cargado';
        
        if (info.Title) {
            infoText = info.Title;
        }
        
        if (info.Author) {
            infoText += ` - ${info.Author}`;
        }
        
        document.getElementById('enhancedPdfDocInfo').textContent = infoText;
    }
    
    showLoading(show) {
        const loading = document.getElementById('enhancedPdfLoading');
        const canvasContainer = document.getElementById('enhancedPdfCanvasContainer');
        const error = document.getElementById('enhancedPdfError');
        
        if (show) {
            loading.style.display = 'flex';
            canvasContainer.style.display = 'none';
            error.style.display = 'none';
        } else {
            loading.style.display = 'none';
            canvasContainer.style.display = 'block';
        }
    }
    
    showError(message) {
        const loading = document.getElementById('enhancedPdfLoading');
        const canvasContainer = document.getElementById('enhancedPdfCanvasContainer');
        const error = document.getElementById('enhancedPdfError');
        const errorMessage = document.getElementById('enhancedPdfErrorMessage');
        
        loading.style.display = 'none';
        canvasContainer.style.display = 'none';
        error.style.display = 'flex';
        errorMessage.textContent = message;
    }
    
    showNotification(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'enhanced-pdf-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    retry() {
        if (this.pdfUrl) {
            this.open(this.pdfUrl);
        }
    }
}

// Inicializar el visor mejorado
const enhancedPdfViewer = new EnhancedPDFViewer();

// Función global para abrir PDFs
window.openEnhancedPDF = function(pdfUrl, title = 'Documento PDF') {
    enhancedPdfViewer.open(pdfUrl, title);
};

// Compatibilidad con el visor anterior
window.openPdfViewer = window.openEnhancedPDF;

