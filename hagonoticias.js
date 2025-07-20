// Sample book data
const books = [
    {
        title: "Edición # 1",
        author: "Día de la democracia,Madres,        ,Maestro,Talentos Abadistas",
        category: "#1",
        year: 2024,
        thumbnail: "https://drive.google.com/thumbnail?id=1UICpZu7v8SyBjJaA29YYYzZa2F97i25m&sz=w320-h240",
        pdfUrl: "pdf/Edición1.pdf"
    },
    {
        title: "Edición # 2",
        author: "Día de la Antioqueñidad.",
        category: "#2",
        year: 2024,
        thumbnail: "https://drive.google.com/thumbnail?id=1UjFe_Jj1lN-_vTAqr3A_MH4sSthQWzPv&sz=w320-h240",
        pdfUrl: "pdf/Edición2.pdf"
    },
    {
        title: "Edición # 3",
        author: "Semana Abadista-Foro-Museo Escolar",
        category: "#3",
        year: 2024,
        thumbnail: "https://drive.google.com/thumbnail?id=1q6lmYNtsZKa1_WPglzVAbG9q0OuEoHy5&sz=w320-h240",
        pdfUrl: "pdf/Edición3.pdf"
    },
    {
        title: "Edición # 4",
        author: "La institución de la Inclusión,Gobierno Escolar 2025,",
        category: "#4",
        year: 2025,
        thumbnail: "https://drive.google.com/thumbnail?id=1pcX7YXagIywqxi4-r_M6Ia8SvH5p7c_E&sz=w320-h240",
        pdfUrl: "pdf/Edición4.pdf"
    },
    {
        title: "Edición # 5 ",
        author: "Proyecto Períodico institucional",
        category: "#5",
        year: 2025,
        thumbnail: "https://covers.openlibrary.org/b/id/6853269-L.jpg",
        pdfUrl: "pdf/Edición5.pdf.pdf"
    }
];



// PDF viewer state
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;



// DOM Elements
const bookList = document.getElementById('bookList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modal = document.getElementById('pdfModal');
const canvas = document.getElementById('pdfViewer');
const ctx = canvas.getContext('2d');

// PDF viewer controls
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const fullscreenButton = document.getElementById('fullscreen');
const closeButton = document.querySelector('.close-button');



// Función para aplicar la transición de volteo
function flipPage(direction) {
    const pdfViewer = document.getElementById('pdfViewer');
    console.log(`Animación iniciada para la dirección: ${direction}`); // Depuración

    // Aplicar la clase de animación
    pdfViewer.classList.add('flip-page');

    // Esperar a que termine la animación
    setTimeout(() => {
        // Cambiar la página
        if (direction === 'next') {
            console.log("Cambiando a la página siguiente"); // Depuración
            showNextPage();
        } else if (direction === 'prev') {
            console.log("Cambiando a la página anterior"); // Depuración
            showPrevPage();
        }

        // Remover la clase de animación
        pdfViewer.classList.remove('flip-page');
        console.log("Animación finalizada"); // Depuración
    }, 100000); // Duración de la animación (0.10s)
}

// PDF navigation functions
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

// PDF rendering function
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
        console.log(`Página ${num} renderizada`); // Depuración

        if (pageNumPending !== null) {
            console.log(`Renderizando página pendiente: ${pageNumPending}`); // Depuración
            renderPage(pageNumPending);
            pageNumPending = null;
        }
        document.getElementById('pageNum').textContent = num;
    } catch (error) {
        console.error('Error rendering page:', error);
        pageRendering = false;
    }
}

// Queue rendering of the next page
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Event listeners
prevButton.addEventListener('click', () => flipPage('prev'));
nextButton.addEventListener('click', () => flipPage('next'));
zoomInButton.addEventListener('click', zoomIn);
zoomOutButton.addEventListener('click', zoomOut);
fullscreenButton.addEventListener('click', toggleFullscreen);

// Google Translate initialization
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: 'en' },
        'google_translate_element'
    );
}



// Create book card
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
        <img src="${book.thumbnail}" alt="${book.title}" class="book-thumbnail">
        <h3>${book.title}</h3>
        <p>Temas: ${book.author}</p>
        <p>Año: ${book.year}</p>
       <button class="category action-button" 
                onmouseover="showCategoryTopics(event, '${book.category}')"
                onmouseout="hideCategoryTopics()">
            ${book.category}
        </button>
        <div class="book-actions">
            <button class="action-button view-pdf" title="View PDF">
                <i class="fas fa-eye"></i>
            </button>
            <a href="${book.pdfUrl}" download class="action-button" title="Download PDF">
                <i class="fas fa-download"></i>
            </a>
        </div>
    `;

    // Add PDF viewer event listener
    const viewButton = bookCard.querySelector('.view-pdf');
    viewButton.addEventListener('click', () => openPdfViewer(book.pdfUrl));

    return bookCard;
}

// Filter books
function normalizeText(text) {
    return text
        .normalize("NFD") // Normaliza caracteres (elimina acentos)
        .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
        .toLowerCase() // Convierte a minúsculas
        .trim(); // Elimina espacios en blanco al inicio y final
}

function filterBooks() {
    const searchTerm = normalizeText(searchInput.value); // Normaliza el término de búsqueda
    const selectedCategory = categoryFilter.value.toLowerCase(); // Filtro de categoría

    console.log("Término de búsqueda:", searchTerm); // Depuración
    console.log("Categoría seleccionada:", selectedCategory); // Depuración

    const filteredBooks = books.filter(book => {
        const normalizedTitle = normalizeText(book.title); // Normaliza el título del libro
        const normalizedAuthor = normalizeText(book.author); // Normaliza el autor del libro

        console.log("Libro:", normalizedTitle, "-", normalizedAuthor); // Depuración

        // Verifica si el término de búsqueda coincide con el título o el autor
        const matchesSearch = normalizedTitle.includes(searchTerm) || 
                            normalizedAuthor.includes(searchTerm);

        // Verifica si la categoría coincide (si se seleccionó una)
        const matchesCategory = selectedCategory === '' || 
                              book.category.toLowerCase() === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    console.log("Libros filtrados:", filteredBooks); // Depuración
    displayBooks(filteredBooks); // Muestra los libros filtrados
}

// Display books
function displayBooks(booksToDisplay) {
    bookList.innerHTML = '';
    booksToDisplay.forEach(book => {
        bookList.appendChild(createBookCard(book));
    });
}

// PDF rendering function
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
    } catch (error) {
        console.error('Error rendering page:', error);
        pageRendering = false;
    }
}

// Queue rendering of the next page
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// PDF navigation functions
function showPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function showNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    console.log(`Cambiando a la página ${pageNum}`); // Depuración
    queueRenderPage(pageNum);
}

const MIN_SCALE = 0.5; // Zoom mínimo
const MAX_SCALE = 8.0; // Zoom máximo
// Zoom functions
function zoomIn() {
    scale *= 1.2;
    renderPage(pageNum);
}

function zoomOut() {
    scale *= 0.8;
    renderPage(pageNum);
}

// Toggle fullscreen
function toggleFullscreen() {
    modal.classList.toggle('fullscreen');
    fullscreenButton.innerHTML = modal.classList.contains('fullscreen') 
        ? '<i class="fas fa-compress"></i>' 
        : '<i class="fas fa-expand"></i>';
    renderPage(pageNum);
}

// PDF Viewer functions
async function openPdfViewer(pdfUrl) {
    modal.style.display = 'block';
    scale = 1.5;

    const container = document.getElementById('pdfContainer');
    container.innerHTML = '<div class="loading">Cargando PDF...</div>';

    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;

        container.innerHTML = '';
        container.appendChild(canvas);

        document.getElementById('pageCount').textContent = pdfDoc.numPages;
        pageNum = 1;
        await renderPage(pageNum);
        updateNavigationButtons(); // Actualizar botones de navegación
    } catch (error) {
        console.error('Error al cargar el PDF:', error);
        container.innerHTML = '<div class="error">Error al cargar el PDF. Inténtalo de nuevo.</div>';
    }
}

// Event listeners
searchInput.addEventListener('input', filterBooks);
categoryFilter.addEventListener('change', filterBooks);
prevButton.addEventListener('click', showPrevPage);
nextButton.addEventListener('click', showNextPage);
zoomInButton.addEventListener('click', zoomIn);
zoomOutButton.addEventListener('click', zoomOut);
fullscreenButton.addEventListener('click', toggleFullscreen);

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.classList.remove('fullscreen');
    scale = 1.5;
    pdfDoc = null;
});

// Cambio de página con teclado
window.addEventListener('keydown', (event) => {
    if (modal.style.display === 'block') {
        if (event.key === 'ArrowLeft') {
            flipPage('prev');
        } else if (event.key === 'ArrowRight') {
            flipPage('next');
        }
    }
});


// Cambio de página con deslizamiento horizontal
let isDragging = false;
let startX = false;

canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX;
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    const currentX = event.clientX;
    const deltaX = currentX - startX;

    if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            flipPage('prev');
        } else {
            flipPage('next');
        }
        isDragging = false;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});
function updateNavigationButtons() {
    prevButton.disabled = pageNum <= 1;
    nextButton.disabled = pageNum >= pdfDoc.numPages;
}

function showPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
    updateNavigationButtons();
}

function showNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
    updateNavigationButtons();
}

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.classList.remove('fullscreen');
    scale = 5.5;
    pdfDoc = null;
    pageNum = 1; // Reiniciar la página actual
    document.getElementById('pdfContainer').innerHTML = ''; // Limpiar el contenedor
});



// Initial display
displayBooks(books);

