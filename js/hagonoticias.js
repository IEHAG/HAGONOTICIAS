// Datos de las ediciones
const books = [
    {
        title: "Edición # 1",
        author: "Día de la democracia, Madres, Maestro, Talentos Abadistas",
        category: "#1",
        year: 2024,
        thumbnail: "https://drive.google.com/thumbnail?id=1UICpZu7v8SyBjJaA29YYYzZa2F97i25m&sz=w320-h240",
        pdfUrl: "pdf/EDICION1.pdf"
    },
    {
        title: "Edición # 2",
        author: "Día de la Antioqueñidad",
        category: "#2",
        year: 2024,
        thumbnail: "https://drive.google.com/thumbnail?id=1UjFe_Jj1lN-_vTAqr3A_MH4sSthQWzPv&sz=w320-h240",
        pdfUrl: "pdf/EDICION2.pdf"
    },
    {
        title: "Edición # 3",
        author: "Semana Abadista - Foro - Museo Escolar",
        category: "#3",
        year: 2024,
        thumbnail: "https://drive.google.com/thumbnail?id=1q6lmYNtsZKa1_WPglzVAbG9q0OuEoHy5&sz=w320-h240",
        pdfUrl: "pdf/EDICION3.pdf"
    },
    {
        title: "Edición # 4",
        author: "La institución de la Inclusión, Gobierno Escolar 2025",
        category: "#4",
        year: 2025,
        thumbnail: "https://drive.google.com/thumbnail?id=13fWBxbiOMp8MMZIsOO-gPyX14VP361Ql&sz=w320-h240",
        pdfUrl: "pdf/EDICION4.pdf"
    }
];

// Variables del visor PDF
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

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

// Función para crear tarjeta de edición
function createBookCard(book) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm border-0 book-card hover-lift glass" style="transition: all 0.3s ease;">
            <div class="position-relative overflow-hidden">
                <img src="${book.thumbnail}" class="card-img-top hover-scale" alt="${book.title}" style="height: 250px; object-fit: cover; transition: transform 0.3s ease;">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-primary animate-pulse">${book.category}</span>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <div class="text-white">
                        <small><i class="fas fa-calendar me-1"></i>${book.year}</small>
                    </div>
                </div>
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title text-primary fw-bold mb-3">${book.title}</h5>
                <p class="card-text flex-grow-1 text-muted">
                    <strong class="text-dark">Temas:</strong> ${book.author}
                </p>
                <div class="d-flex gap-2 mt-auto">
                    <button class="btn btn-primary flex-fill view-pdf btn-animated hover-glow" data-pdf="${book.pdfUrl}">
                        <i class="fas fa-eye me-1"></i>Ver PDF
                    </button>
                    <a href="${book.pdfUrl}" download class="btn btn-outline-primary btn-animated hover-lift" title="Descargar PDF">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Agregar clase reveal para animación de entrada
    col.classList.add('reveal');

    // Agregar evento para ver PDF
    const viewButton = col.querySelector('.view-pdf');
    viewButton.addEventListener('click', () => {
        // Efecto de loading en el botón
        const originalText = viewButton.innerHTML;
        viewButton.innerHTML = '<i class="fa fa-spinner fa-spin me-1"></i>Cargando...';
        viewButton.disabled = true;
        
        setTimeout(() => {
            // Usar el nuevo visor mejorado
            if (typeof enhancedPdfViewer !== 'undefined') {
                enhancedPdfViewer.open(book.pdfUrl, book.title);
            } else {
                // Fallback al visor anterior
                openPdfViewer(book.pdfUrl);
            }
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

// Función para filtrar ediciones
function filterBooks() {
    const searchTerm = normalizeText(searchInput.value);
    const selectedCategory = categoryFilter.value.toLowerCase();

    const filteredBooks = books.filter(book => {
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

// Funciones del visor PDF
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
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando PDF...</p>
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
            </div>
        `;
    }
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

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    displayBooks(books);
    
    // Animación de entrada para las tarjetas
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observar tarjetas cuando se crean
    const originalAppendChild = bookList.appendChild;
    bookList.appendChild = function(child) {
        child.style.opacity = '0';
        child.style.transform = 'translateY(20px)';
        child.style.transition = 'all 0.6s ease';
        observer.observe(child);
        return originalAppendChild.call(this, child);
    };
});

