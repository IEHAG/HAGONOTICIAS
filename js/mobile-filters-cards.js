// Mobile Filters and Cards Enhancement
class MobileFiltersCards {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.activeFilters = new Set();
        this.searchTerm = '';
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.loadBooks();
        this.createMobileInterface();
        this.bindEvents();
        this.setupIntersectionObserver();
    }
    
    loadBooks() {
        // Datos de las ediciones (manteniendo compatibilidad)
        this.books = [
            {
                id: 1,
                title: "Edición # 1",
                description: "Día de la democracia, Madres, Maestro, Talentos Abadistas",
                category: "#1",
                year: 2024,
                thumbnail: "https://drive.google.com/thumbnail?id=1UICpZu7v8SyBjJaA29YYYzZa2F97i25m&sz=w320-h240",
                pdfUrl: "pdf/EDICION1.pdf",
                tags: ["democracia", "madres", "maestro", "talentos"]
            },
            {
                id: 2,
                title: "Edición # 2",
                description: "Día de la Antioqueñidad",
                category: "#2",
                year: 2024,
                thumbnail: "https://drive.google.com/thumbnail?id=1UjFe_Jj1lN-_vTAqr3A_MH4sSthQWzPv&sz=w320-h240",
                pdfUrl: "pdf/EDICION2.pdf",
                tags: ["antioqueñidad", "cultura", "tradición"]
            },
            {
                id: 3,
                title: "Edición # 3",
                description: "Semana Abadista - Foro - Museo Escolar",
                category: "#3",
                year: 2024,
                thumbnail: "https://drive.google.com/thumbnail?id=1q6lmYNtsZKa1_WPglzVAbG9q0OuEoHy5&sz=w320-h240",
                pdfUrl: "pdf/EDICION3.pdf",
                tags: ["semana abadista", "foro", "museo", "escolar"]
            },
            {
                id: 4,
                title: "Edición # 4",
                description: "La institución de la Inclusión, Gobierno Escolar 2025",
                category: "#4",
                year: 2025,
                thumbnail: "https://drive.google.com/thumbnail?id=13fWBxbiOMp8MMZIsOO-gPyX14VP361Ql&sz=w320-h240",
                pdfUrl: "pdf/EDICION4.pdf",
                tags: ["inclusión", "gobierno escolar", "2025"]
            }
        ];
        
        this.filteredBooks = [...this.books];
    }
    
    createMobileInterface() {
        const edicionesSection = document.getElementById('ediciones');
        if (!edicionesSection) return;
        
        // Buscar el contenedor existente o crear uno nuevo
        let container = edicionesSection.querySelector('.container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'container';
            edicionesSection.appendChild(container);
        }
        
        // Crear la nueva interfaz móvil
        const mobileInterface = document.createElement('div');
        mobileInterface.innerHTML = `
            <!-- Search and Filters -->
            <div class="mobile-search-container">
                <div class="mobile-search-group">
                    <input type="text" 
                           class="mobile-search-input" 
                           id="mobileSearchInput"
                           placeholder="Buscar ediciones..."
                           autocomplete="off">
                    <i class="fas fa-search mobile-search-icon"></i>
                    <button class="mobile-search-clear" id="mobileSearchClear">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mobile-filter-group">
                    <select class="mobile-filter-select" id="mobileFilterSelect">
                        <option value="">Todas las ediciones</option>
                        <option value="#1">Edición 1</option>
                        <option value="#2">Edición 2</option>
                        <option value="#3">Edición 3</option>
                        <option value="#4">Edición 4</option>
                    </select>
                </div>
                
                <div class="mobile-filter-tags" id="mobileFilterTags"></div>
            </div>
            
            <!-- Results Counter -->
            <div class="text-center">
                <span class="mobile-results-counter" id="mobileResultsCounter">
                    ${this.filteredBooks.length} ediciones encontradas
                </span>
            </div>
            
            <!-- Cards Grid -->
            <div class="mobile-cards-grid" id="mobileCardsGrid">
                <!-- Las tarjetas se generarán aquí -->
            </div>
        `;
        
        // Reemplazar el contenido existente de filtros y tarjetas
        const existingFilters = container.querySelector('.row.mb-4');
        const existingGrid = container.querySelector('#bookList');
        
        if (existingFilters) {
            existingFilters.style.display = 'none';
        }
        if (existingGrid) {
            existingGrid.style.display = 'none';
        }
        
        // Insertar la nueva interfaz después del título
        const title = container.querySelector('h2');
        if (title) {
            title.insertAdjacentElement('afterend', mobileInterface);
        } else {
            container.appendChild(mobileInterface);
        }
        
        this.renderCards();
    }
    
    bindEvents() {
        // Search input
        const searchInput = document.getElementById('mobileSearchInput');
        const searchClear = document.getElementById('mobileSearchClear');
        const filterSelect = document.getElementById('mobileFilterSelect');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.debounceFilter();
            });
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.filterBooks();
            });
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value && !this.activeFilters.has(value)) {
                    this.activeFilters.add(value);
                    this.updateFilterTags();
                    this.filterBooks();
                }
                e.target.value = '';
            });
        }
    }
    
    debounceFilter() {
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
            this.filterBooks();
        }, 300);
    }
    
    updateFilterTags() {
        const tagsContainer = document.getElementById('mobileFilterTags');
        if (!tagsContainer) return;
        
        tagsContainer.innerHTML = '';
        
        this.activeFilters.forEach(filter => {
            const tag = document.createElement('div');
            tag.className = 'mobile-filter-tag';
            tag.innerHTML = `
                <span>Edición ${filter.replace('#', '')}</span>
                <button class="mobile-filter-tag-remove" data-filter="${filter}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            const removeBtn = tag.querySelector('.mobile-filter-tag-remove');
            removeBtn.addEventListener('click', () => {
                this.activeFilters.delete(filter);
                this.updateFilterTags();
                this.filterBooks();
            });
            
            tagsContainer.appendChild(tag);
        });
    }
    
    normalizeText(text) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }
    
    filterBooks() {
        const normalizedSearch = this.normalizeText(this.searchTerm);
        
        this.filteredBooks = this.books.filter(book => {
            // Search filter
            const matchesSearch = normalizedSearch === '' || 
                this.normalizeText(book.title).includes(normalizedSearch) ||
                this.normalizeText(book.description).includes(normalizedSearch) ||
                book.tags.some(tag => this.normalizeText(tag).includes(normalizedSearch));
            
            // Category filter
            const matchesCategory = this.activeFilters.size === 0 || 
                this.activeFilters.has(book.category);
            
            return matchesSearch && matchesCategory;
        });
        
        this.updateResultsCounter();
        this.renderCards();
    }
    
    updateResultsCounter() {
        const counter = document.getElementById('mobileResultsCounter');
        if (counter) {
            const count = this.filteredBooks.length;
            counter.textContent = `${count} ${count === 1 ? 'edición encontrada' : 'ediciones encontradas'}`;
        }
    }
    
    renderCards() {
        const grid = document.getElementById('mobileCardsGrid');
        if (!grid) return;
        
        if (this.filteredBooks.length === 0) {
            this.renderEmptyState(grid);
            return;
        }
        
        grid.innerHTML = '';
        
        this.filteredBooks.forEach((book, index) => {
            const card = this.createCard(book, index);
            grid.appendChild(card);
        });
    }
    
    createCard(book, index) {
        const card = document.createElement('div');
        card.className = 'mobile-edition-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="mobile-card-image-container">
                <img src="${book.thumbnail}" 
                     alt="${book.title}" 
                     class="mobile-card-image"
                     loading="lazy"
                     onerror="this.src='img/default-thumbnail.png'">
                <div class="mobile-card-overlay"></div>
                <div class="mobile-card-badge">${book.category}</div>
                <div class="mobile-card-year">
                    <i class="fas fa-calendar me-1"></i>${book.year}
                </div>
            </div>
            
            <div class="mobile-card-content">
                <h3 class="mobile-card-title">${book.title}</h3>
                <p class="mobile-card-description">
                    <strong>Temas:</strong> ${book.description}
                </p>
                
                <div class="mobile-card-actions">
                    <button class="mobile-card-button mobile-card-button-primary view-pdf-mobile" 
                            data-pdf="${book.pdfUrl}" 
                            data-title="${book.title}">
                        <i class="fas fa-eye"></i>
                        <span>Ver PDF</span>
                    </button>
                    <a href="${book.pdfUrl}" 
                       download 
                       class="mobile-card-button mobile-card-button-secondary"
                       title="Descargar PDF">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            </div>
        `;
        
        // Bind events
        const viewBtn = card.querySelector('.view-pdf-mobile');
        viewBtn.addEventListener('click', (e) => {
            this.handleViewPDF(e, book);
        });
        
        return card;
    }
    
    renderEmptyState(grid) {
        grid.innerHTML = `
            <div class="mobile-empty-state" style="grid-column: 1 / -1;">
                <div class="mobile-empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="mobile-empty-title">No se encontraron ediciones</h3>
                <p class="mobile-empty-description">
                    Intenta con otros términos de búsqueda o ajusta los filtros
                </p>
                <button class="mobile-empty-action" onclick="mobileFiltersCards.clearAllFilters()">
                    Limpiar filtros
                </button>
            </div>
        `;
    }
    
    handleViewPDF(e, book) {
        const button = e.currentTarget;
        const originalContent = button.innerHTML;
        
        // Loading state
        button.innerHTML = '<i class="fa fa-spinner fa-spin"></i><span>Cargando...</span>';
        button.disabled = true;
        
        // Open PDF viewer
        if (window.mobilePdfViewer) {
            const pdfUrl = new URL(button.getAttribute('data-pdf'), window.location.href).href;
            window.mobilePdfViewer.open(pdfUrl, book.title).finally(() => {
                button.innerHTML = originalContent;
                button.disabled = false;
            });
        } else {
            // Fallback to original viewer
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.disabled = false;
            }, 1000);
        }
    }
    
    clearAllFilters() {
        this.activeFilters.clear();
        this.searchTerm = '';
        
        const searchInput = document.getElementById('mobileSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.updateFilterTags();
        this.filterBooks();
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe cards as they're created
        const originalAppendChild = Element.prototype.appendChild;
        const grid = document.getElementById('mobileCardsGrid');
        
        if (grid) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList.contains('mobile-edition-card')) {
                            node.style.opacity = '0';
                            node.style.transform = 'translateY(20px)';
                            node.style.transition = 'all 0.6s ease';
                            
                            setTimeout(() => {
                                node.style.opacity = '1';
                                node.style.transform = 'translateY(0)';
                            }, 100);
                        }
                    });
                });
            });
            
            observer.observe(grid, { childList: true });
        }
    }
    
    // Public methods
    addBook(book) {
        this.books.push(book);
        this.filterBooks();
    }
    
    removeBook(id) {
        this.books = this.books.filter(book => book.id !== id);
        this.filterBooks();
    }
    
    updateBook(id, updatedBook) {
        const index = this.books.findIndex(book => book.id === id);
        if (index !== -1) {
            this.books[index] = { ...this.books[index], ...updatedBook };
            this.filterBooks();
        }
    }
    
    getFilteredBooks() {
        return this.filteredBooks;
    }
    
    getActiveFilters() {
        return Array.from(this.activeFilters);
    }
    
    setSearchTerm(term) {
        this.searchTerm = term;
        const searchInput = document.getElementById('mobileSearchInput');
        if (searchInput) {
            searchInput.value = term;
        }
        this.filterBooks();
    }
}

// Initialize when DOM is ready
let mobileFiltersCards;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure other scripts have loaded
    setTimeout(() => {
        mobileFiltersCards = new MobileFiltersCards();
        
        // Make it globally accessible
        window.mobileFiltersCards = mobileFiltersCards;
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileFiltersCards;
}

