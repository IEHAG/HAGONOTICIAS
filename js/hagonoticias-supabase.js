// HAGO Noticias - Versión con Supabase
// Este archivo reemplaza la funcionalidad estática con integración a Supabase

// Variables globales
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let edicionesData = []; // Array para almacenar las ediciones de Supabase
window.edicionesData = edicionesData; // Hacer edicionesData globalmente accesible

// Elementos del DOM
const bookList = document.getElementById('bookList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modal = new bootstrap.Modal(document.getElementById('pdfModal'));
const canvas = document.getElementById('pdfViewer');
const ctx = canvas.getContext('2d');

// Controles del visor PDF
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const fullscreenButton = document.getElementById('fullscreen');

// Función para cargar ediciones desde Supabase
async function cargarEdicionesDesdeSupabase() {
    try {
        // Mostrar indicador de carga
        mostrarIndicadorCarga(true);
        
        if (!edicionesManager) {
            console.error('EdicionesManager no está inicializado');
            // Fallback a datos estáticos si Supabase no está disponible
            return cargarDatosEstaticos();
        }

        const ediciones = await edicionesManager.obtenerEdiciones();
        
        if (ediciones && ediciones.length > 0) {
            // Convertir formato de Supabase al formato esperado por la aplicación
            edicionesData = ediciones.map(edicion => ({
                id: edicion.id,
                title: edicion.titulo,
                author: edicion.autor || edicion.descripcion || '',
                category: edicion.categoria,
                year: edicion.anio,
                thumbnail: edicion.thumbnail_url,
                pdfUrl: edicion.pdf_url,
                description: edicion.descripcion || '',
                fechaPublicacion: edicion.fecha_publicacion
            }));
            
            console.log(`Cargadas ${edicionesData.length} ediciones desde Supabase`);
        } else {
            console.warn('No se encontraron ediciones en Supabase, usando datos estáticos');
            cargarDatosEstaticos();
        }
        
    } catch (error) {
        console.error('Error al cargar ediciones desde Supabase:', error);
        // Fallback a datos estáticos en caso de error
        cargarDatosEstaticos();
    } finally {
        mostrarIndicadorCarga(false);
    }
}

// Función fallback para cargar datos estáticos
function cargarDatosEstaticos() {
    edicionesData = [
        {
            id: '1',
            title: "Edición # 1",
            author: "Día de la democracia, Madres, Maestro, Talentos Abadistas",
            category: "#1",
            year: 2024,
            thumbnail: "https://drive.google.com/thumbnail?id=1UICpZu7v8SyBjJaA29YYYzZa2F97i25m&sz=w320-h240",
            pdfUrl: "pdf/EDICION2.pdf"
        },
        {
            id: '2',
            title: "Edición # 2",
            author: "Día de la Antioqueñidad",
            category: "#2",
            year: 2024,
            thumbnail: "https://drive.google.com/thumbnail?id=1UjFe_Jj1lN-_vTAqr3A_MH4sSthQWzPv&sz=w320-h240",
            pdfUrl: "pdf/EDICION2.pdf"
        },
        {
            id: '3',
            title: "Edición # 3",
            author: "Semana Abadista - Foro - Museo Escolar",
            category: "#3",
            year: 2024,
            thumbnail: "https://drive.google.com/thumbnail?id=1q6lmYNtsZKa1_WPglzVAbG9q0OuEoHy5&sz=w320-h240",
            pdfUrl: "pdf/EDICION3.pdf"
        },
        {
            id: '4',
            title: "Edición # 4",
            author: "La institución de la Inclusión, Gobierno Escolar 2025",
            category: "#4",
            year: 2025,
            thumbnail: "https://drive.google.com/thumbnail?id=13fWBxbiOMp8MMZIsOO-gPyX14VP361Ql&sz=w320-h240",
            pdfUrl: "pdf/EDICION4.pdf"
        }
    ];
    
    // Actualizar la referencia global
    window.edicionesData = edicionesData;
    console.log('Datos estáticos cargados como fallback');
}

// Función para mostrar/ocultar indicador de carga
function mostrarIndicadorCarga(mostrar) {
    const bookList = document.getElementById('bookList');
    if (mostrar) {
        bookList.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <h4 class="text-muted">Cargando ediciones...</h4>
                <p class="text-muted">Por favor espera mientras obtenemos las últimas ediciones</p>
            </div>
        `;
    }
}

// Función para crear tarjeta de edición (actualizada para Supabase)
function createBookCard(book) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 col-xl-3';
    
    // Asegurar que la URL del thumbnail sea válida
    const thumbnailUrl = book.thumbnail || 'img/default-thumbnail.png';
    
    col.innerHTML = `
        <div class="edition-card h-100 shadow-lg border-0 book-card hover-lift glass" 
             style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border-radius: 15px; overflow: hidden; transition: all 0.3s ease;">
            <div class="position-relative overflow-hidden">
                <img src="${thumbnailUrl}" class="card-img-top hover-scale" alt="${book.title}" 
                     style="height: 280px; object-fit: cover; transition: transform 0.3s ease;"
                     onerror="this.src='img/default-thumbnail.png'">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-primary animate-pulse fs-6 px-3 py-2" 
                          style="border-radius: 20px; font-weight: bold;">${book.category}</span>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div class="text-white">
                        <small><i class="fas fa-calendar me-1"></i>${book.year}</small>
                    </div>
                </div>
            </div>
            <div class="card-body d-flex flex-column text-white p-4">
                <h5 class="card-title text-white fw-bold mb-3 text-center" style="font-size: 1.2rem;">${book.title}</h5>
                <p class="card-text flex-grow-1 text-light text-center mb-3" style="font-size: 0.9rem; line-height: 1.4;">
                    <strong class="text-warning">Temas:</strong><br>
                    ${book.author}
                </p>
                ${book.description ? `<p class="card-text text-light small text-center mb-3">${book.description}</p>` : ''}
                <div class="d-flex gap-2 mt-auto">
                    <button class="btn btn-light flex-fill view-pdf btn-animated hover-glow fw-bold" 
                            data-pdf="${book.pdfUrl}" style="border-radius: 25px; transition: all 0.3s ease;">
                        <i class="fas fa-eye me-1"></i>Ver
                    </button>
                    <a href="${book.pdfUrl}" download 
                       class="btn btn-outline-light btn-animated hover-lift fw-bold" 
                       title="Descargar PDF" style="border-radius: 25px; transition: all 0.3s ease;">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Agregar clase reveal para animación de entrada
    col.style.opacity = '1';
    col.style.transform = 'translateY(0)';

    // Agregar evento para ver PDF
    const viewButton = col.querySelector('.view-pdf');
    viewButton.addEventListener('click', () => {
        // Efecto de loading en el botón
        const originalText = viewButton.innerHTML;
        viewButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Cargando...';
        viewButton.disabled = true;
        
        setTimeout(() => {
            // Usar el nuevo visor moderno
            openModernPDF(book.pdfUrl);
            viewButton.innerHTML = originalText;
            viewButton.disabled = false;
        }, 500);
    });

    return col;
}

// Función para normalizar texto (eliminar acentos)
function normalizeText(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Función para filtrar ediciones (actualizada para usar Supabase)
async function filterBooks() {
    const searchTerm = normalizeText(searchInput.value);
    const selectedCategory = categoryFilter.value.toLowerCase();

    try {
        let filteredBooks;

        // Si tenemos edicionesManager, usar filtrado de Supabase
        if (edicionesManager && (searchTerm || selectedCategory)) {
            const filtros = {};
            
            if (selectedCategory && selectedCategory !== '') {
                filtros.categoria = selectedCategory;
            }
            
            if (searchTerm) {
                filtros.busqueda = searchTerm;
            }

            const edicionesFiltradas = await edicionesManager.filtrarEdiciones(filtros);
            filteredBooks = edicionesFiltradas.map(edicion => ({
                id: edicion.id,
                title: edicion.titulo,
                author: edicion.autor || edicion.descripcion || '',
                category: edicion.categoria,
                year: edicion.anio,
                thumbnail: edicion.thumbnail_url,
                pdfUrl: edicion.pdf_url,
                description: edicion.descripcion || ''
            }));
        } else {
            // Filtrado local como fallback
            filteredBooks = edicionesData.filter(book => {
                const normalizedTitle = normalizeText(book.title);
                const normalizedAuthor = normalizeText(book.author);

                const matchesSearch = normalizedTitle.includes(searchTerm) || 
                                    normalizedAuthor.includes(searchTerm);
                const matchesCategory = selectedCategory === '' || 
                                      book.category.toLowerCase() === selectedCategory;

                return matchesSearch && matchesCategory;
            });
        }

        displayBooks(filteredBooks);
    } catch (error) {
        console.error('Error al filtrar ediciones:', error);
        // Fallback a filtrado local
        const filteredBooks = edicionesData.filter(book => {
            const normalizedTitle = normalizeText(book.title);
            const normalizedAuthor = normalizeText(book.author);

            const matchesSearch = normalizedTitle.includes(searchTerm) || 
                                normalizedAuthor.includes(searchTerm);
            const matchesCategory = selectedCategory === '' || 
                                  book.category.toLowerCase() === selectedCategory;

            return matchesSearch && matchesCategory;
        });
        displayBooks(filteredBooks);
    }
}

// Función para mostrar ediciones
function displayBooks(booksToDisplay) {
    bookList.innerHTML = '';
    
    if (booksToDisplay.length === 0) {
        bookList.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No se encontraron ediciones</h4>
                <p class="text-muted">Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    booksToDisplay.forEach(book => {
        bookList.appendChild(createBookCard(book));
    });
}

// Función para actualizar las opciones del filtro de categorías
function actualizarFiltroCategoria() {
    const categorias = [...new Set(edicionesData.map(book => book.category))].sort();
    
    categoryFilter.innerHTML = '<option value="">Todas las ediciones</option>';
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.toLowerCase();
        option.textContent = `Edición ${categoria.replace('#', '')}`;
        categoryFilter.appendChild(option);
    });
}

// Función para recargar ediciones desde Supabase
async function recargarEdiciones() {
    await cargarEdicionesDesdeSupabase();
    actualizarFiltroCategoria();
    displayBooks(edicionesData);
}

// Funciones del visor PDF (sin cambios)
async function renderPage(num) {
    pageRendering = true;
    
    try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        pageRendering = false;

        if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
        }
        
        document.getElementById('pageNum').textContent = num;
        updateNavigationButtons();
    } catch (error) {
        console.error('Error rendering page:', error);
        pageRendering = false;
    }
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function showPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function showNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

function zoomIn() {
    scale = Math.min(scale * 1.2, 3.0);
    renderPage(pageNum);
}

function zoomOut() {
    scale = Math.max(scale * 0.8, 0.5);
    renderPage(pageNum);
}

function toggleFullscreen() {
    const modalDialog = document.querySelector('#pdfModal .modal-dialog');
    modalDialog.classList.toggle('modal-fullscreen');
    
    setTimeout(() => {
        renderPage(pageNum);
    }, 300);
}

function updateNavigationButtons() {
    if (pdfDoc) {
        prevButton.disabled = pageNum <= 1;
        nextButton.disabled = pageNum >= pdfDoc.numPages;
    }
}

async function openPdfViewer(pdfUrl) {
    modal.show();
    scale = 1.5;
    
    const container = document.getElementById('pdfContainer');
    container.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center text-white">
            <div class="loading-spinner mb-3"></div>
            <h4 class="text-primary">Cargando PDF...</h4>
            <p class="text-muted">Por favor espera mientras cargamos el documento</p>
        </div>
    `;

    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;

        container.innerHTML = '';
        container.appendChild(canvas);

        document.getElementById('pageCount').textContent = pdfDoc.numPages;
        pageNum = 1;
        await renderPage(pageNum);
    } catch (error) {
        console.error('Error al cargar el PDF:', error);
        container.innerHTML = `
            <div class="text-center text-white">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4>Error al cargar el PDF</h4>
                <p>Por favor, inténtalo de nuevo más tarde.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh me-2"></i>Reintentar
                </button>
            </div>
        `;
    }
}

// Función moderna para abrir PDF (alias)
function openModernPDF(pdfUrl) {
    return openPdfViewer(pdfUrl);
}

// Event Listeners
searchInput.addEventListener('input', filterBooks);
categoryFilter.addEventListener('change', filterBooks);
prevButton.addEventListener('click', showPrevPage);
nextButton.addEventListener('click', showNextPage);
zoomInButton.addEventListener('click', zoomIn);
zoomOutButton.addEventListener('click', zoomOut);
fullscreenButton.addEventListener('click', toggleFullscreen);

// Navegación con teclado
document.addEventListener('keydown', (event) => {
    const modalElement = document.getElementById('pdfModal');
    if (modalElement.classList.contains('show')) {
        if (event.key === 'ArrowLeft') {
            showPrevPage();
        } else if (event.key === 'ArrowRight') {
            showNextPage();
        } else if (event.key === 'Escape') {
            modal.hide();
        }
    }
});

// Limpiar al cerrar modal
document.getElementById('pdfModal').addEventListener('hidden.bs.modal', function () {
    pdfDoc = null;
    pageNum = 1;
    scale = 1.5;
    document.getElementById('pdfContainer').innerHTML = '';
});

// Smooth scrolling para navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Función para inicializar la aplicación
async function inicializarAplicacion() {
    console.log('Inicializando aplicación HAGO Noticias...');
    
    // Verificar configuración de Supabase
    if (!validarConfiguracion()) {
        console.warn('Usando modo offline - las ediciones no se sincronizarán con Supabase');
    }
    
    // Inicializar sistema de Supabase
    await inicializarSistema();
    
    // Cargar ediciones
    await cargarEdicionesDesdeSupabase();
    
    // Actualizar filtros y mostrar ediciones
    actualizarFiltroCategoria();
    displayBooks(edicionesData);
    
    // Configurar animaciones de entrada
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observar tarjetas cuando se crean
    // const originalAppendChild = bookList.appendChild;
    // bookList.appendChild = function(child) {
    //     child.style.opacity = '0';
    //     child.style.transform = 'translateY(20px)';
    //     child.style.transition = 'all 0.6s ease';
    //     observer.observe(child);
    //     return originalAppendChild.call(this, child);
    // };
    
    console.log('Aplicación inicializada correctamente');
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", inicializarAplicacion);

// Función global para recargar ediciones (útil para el dashboard)
window.recargarEdiciones = recargarEdiciones;

