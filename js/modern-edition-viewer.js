// Modern Edition Viewer - Fully Responsive for Mobile and Desktop
class ModernEditionViewer {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.activeFilters = new Set();
        this.searchTerm = '';
        this.isLoading = false;
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.isDesktop = window.innerWidth > 1024;
        
        this.init();
        this.setupResponsiveHandlers();
    }
    
    init() {
        // Solo crear la interfaz si la página tiene el contenedor esperado;
        // en index.html (React) este visor legacy no debe interferir.
        if (!document.getElementById('modernEditionsGrid') && !document.getElementById('modernSearchInput') && !document.getElementById('bookList')) {
            return;
        }
        this.loadBooks();
        this.createModernInterface();
        this.bindEvents();
        this.setupIntersectionObserver();
        this.setupTouchGestures();
    }
    
    setupResponsiveHandlers() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateResponsiveState();
                this.adjustLayoutForDevice();
            }, 250);
        });
        
        // Detect orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateResponsiveState();
                this.adjustLayoutForDevice();
            }, 100);
        });
    }
    
    updateResponsiveState() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.isDesktop = window.innerWidth > 1024;
    }
    
    adjustLayoutForDevice() {
        const grid = document.getElementById('modernEditionsGrid');
        if (!grid) return;
        
        // Adjust grid columns based on device
        if (this.isMobile) {
            grid.style.gridTemplateColumns = '1fr';
        } else if (this.isTablet) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
        }
        
        // Adjust search layout
        const searchContainer = document.querySelector('.modern-search-container');
        if (searchContainer) {
            if (this.isMobile) {
                searchContainer.style.flexDirection = 'column';
                searchContainer.style.gap = '1rem';
            } else {
                searchContainer.style.flexDirection = 'row';
                searchContainer.style.gap = '1.5rem';
            }
        }
    }
    
    loadBooks() {
        // Cargar ediciones desde el archivo centralizado
        // NOTA: Asegúrate de cargar ediciones-data.js antes de este archivo
        this.books = (typeof getEdicionesAsModernBooks === 'function') 
            ? getEdicionesAsModernBooks() 
            : [];
        
        this.filteredBooks = [...this.books];
    }
    
    generateFilterOptions() {
        const categories = [...new Set(this.books.map(book => book.category))];
        categories.sort((a, b) => {
            const numA = parseInt(a.replace('#', '')) || 0;
            const numB = parseInt(b.replace('#', '')) || 0;
            return numA - numB;
        });
        return categories;
    }
    
    generateCategoryChips() {
        const categories = this.generateFilterOptions();
        let chipsHTML = `<button class="modern-chip modern-chip-active" data-category="all">Todas</button>`;
        categories.forEach(category => {
            const editionNum = category.replace('#', '');
            chipsHTML += `<button class="modern-chip" data-category="${category}">Ed. ${editionNum}</button>`;
        });
        return chipsHTML;
    }
    
    createModernInterface() {
        const edicionesSection = document.getElementById('ediciones');
        if (!edicionesSection) return;
        
        let container = edicionesSection.querySelector('.container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'container';
            edicionesSection.appendChild(container);
        }
        
        const existingElements = container.querySelectorAll('.row, #bookList, .mobile-search-container, .mobile-cards-grid');
        existingElements.forEach(el => el.style.display = 'none');
        
        const modernInterface = document.createElement('div');
        modernInterface.className = 'modern-edition-viewer';
        modernInterface.innerHTML = `
            <div class="modern-viewer-container">
                <div class="modern-viewer-header">
                    <h2 class="modern-viewer-title">Biblioteca de <span>Ediciones</span></h2>
                    <p class="modern-viewer-subtitle">
                        Explora nuestras publicaciones institucionales
                    </p>
                </div>
                
                <div class="modern-search-section">
                    <div class="modern-search-container">
                        <div class="modern-search-group">
                            <input type="text" 
                                   class="modern-search-input" 
                                   id="modernSearchInput"
                                   placeholder="Buscar por título, tema o año..."
                                   autocomplete="off">
                            <i class="fas fa-search modern-search-icon"></i>
                            <button class="modern-search-clear" id="modernSearchClear" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <button class="modern-filter-toggle" id="modernFilterToggle" title="Filtrar por edición">
                            <i class="fas fa-sliders"></i>
                        </button>
                    </div>
                    
                    <div class="modern-filter-chips" id="modernFilterChips">
                        ${this.generateCategoryChips()}
                    </div>
                </div>
                
                <div class="text-center">
                    <span class="modern-results-counter" id="modernResultsCounter">
                        ${this.filteredBooks.length} ediciones en la biblioteca
                    </span>
                </div>
                
                <div class="modern-editions-grid" id="modernEditionsGrid"></div>
            </div>
        `;
        
        const title = container.querySelector('h2');
        if (title) {
            title.style.display = 'none';
            title.insertAdjacentElement('afterend', modernInterface);
        } else {
            container.appendChild(modernInterface);
        }
        
        this.adjustLayoutForDevice();
        this.renderCards();
    }
    
    bindEvents() {
        const searchInput = document.getElementById('modernSearchInput');
        const searchClear = document.getElementById('modernSearchClear');
        const filterToggle = document.getElementById('modernFilterToggle');
        const filterChips = document.getElementById('modernFilterChips');
        
        if (filterToggle && filterChips) {
            const chips = filterChips.querySelectorAll('.modern-chip');
            if (chips.length <= 1) {
                filterToggle.style.display = 'none';
            }
            
            filterToggle.addEventListener('click', () => {
                filterChips.classList.toggle('modern-filter-chips-visible');
                filterToggle.classList.toggle('active');
                const isVisible = filterChips.classList.contains('modern-filter-chips-visible');
                filterToggle.querySelector('i').className = isVisible ? 'fas fa-times' : 'fas fa-sliders';
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.toggleClearButton();
                this.debounceFilter();
            });
            
            searchInput.addEventListener('focus', () => {
                if (this.isMobile) {
                    setTimeout(() => {
                        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            });
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.toggleClearButton();
                this.filterBooks();
                searchInput.focus();
            });
        }
        
        const allChips = document.querySelectorAll('.modern-chip');
        allChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const category = chip.dataset.category;
                if (category === 'all') {
                    this.activeFilters.clear();
                } else if (this.activeFilters.has(category)) {
                    this.activeFilters.delete(category);
                } else {
                    this.activeFilters.add(category);
                }
                this.updateChips();
                this.filterBooks();
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        searchInput?.focus();
                        break;
                    case 'k':
                        e.preventDefault();
                        searchInput?.focus();
                        break;
                }
            }
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.blur();
            }
        });
    }
    
    updateChips() {
        const chips = document.querySelectorAll('.modern-chip');
        chips.forEach(chip => {
            const category = chip.dataset.category;
            if (category === 'all') {
                chip.classList.toggle('modern-chip-active', this.activeFilters.size === 0);
            } else {
                chip.classList.toggle('modern-chip-active', this.activeFilters.has(category));
            }
        });
    }
    
    setupTouchGestures() {
        if (!this.isMobile) return;
        
        let startY = 0;
        let startTime = 0;
        
        const grid = document.getElementById('modernEditionsGrid');
        if (!grid) return;
        
        grid.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        grid.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            const deltaY = startY - endY;
            const deltaTime = endTime - startTime;
            
            // Pull to refresh gesture
            if (deltaY < -100 && deltaTime < 500) {
                this.refreshContent();
            }
        }, { passive: true });
    }
    
    refreshContent() {
        const grid = document.getElementById('modernEditionsGrid');
        if (grid) {
            grid.style.opacity = '0.7';
            setTimeout(() => {
                this.renderCards();
                grid.style.opacity = '1';
            }, 300);
        }
    }
    
    toggleClearButton() {
        const clearBtn = document.getElementById('modernSearchClear');
        if (clearBtn) {
            clearBtn.style.display = this.searchTerm ? 'block' : 'none';
        }
    }
    
    debounceFilter() {
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
            this.filterBooks();
        }, 300);
    }
    
    updateFilterTags() {
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
            const matchesSearch = normalizedSearch === '' || 
                this.normalizeText(book.title).includes(normalizedSearch) ||
                this.normalizeText(book.description).includes(normalizedSearch) ||
                this.normalizeText(book.author || '').includes(normalizedSearch) ||
                this.normalizeText(book.year || '').includes(normalizedSearch) ||
                (book.tags || []).some(tag => this.normalizeText(tag).includes(normalizedSearch));
            
            const matchesCategory = this.activeFilters.size === 0 || 
                this.activeFilters.has(book.category);
            
            return matchesSearch && matchesCategory;
        });
        
        this.updateResultsCounter();
        this.renderCards();
    }
    
    updateResultsCounter() {
        const counter = document.getElementById('modernResultsCounter');
        if (counter) {
            const count = this.filteredBooks.length;
            const total = this.books.length;
            counter.textContent = count === total 
                ? `${count} ediciones en la biblioteca`
                : `${count} de ${total} ediciones`;
        }
    }
    
    renderCards() {
        const grid = document.getElementById('modernEditionsGrid');
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
        
        // Trigger animations
        this.animateCards();
    }
    
    createCard(book, index) {
        const card = document.createElement('div');
        card.className = 'modern-edition-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        const isComingSoon = book.comingSoon;
        const isFeatured = book.featured;
        const editionNum = book.category || '';
        const editionLabel = editionNum.replace('#', 'Ed. ');
        const authorText = book.author || book.title || 'HAGO Noticias';
        const yearLabel = book.year || '';
        
        card.innerHTML = `
            <div class="modern-card-image-container">
                <img src="${book.thumbnail}" 
                     alt="${book.title}" 
                     class="modern-card-image"
                     loading="lazy"
                     onerror="this.src='img/default-thumbnail.png'">
                
                ${isComingSoon ? `
                    <div class="modern-card-coming-soon">
                        <i class="fas fa-clock"></i>
                        <span>Próximamente</span>
                    </div>
                ` : ''}
                
                <div class="modern-card-badge ${isFeatured ? 'featured' : ''}">${editionLabel}</div>
            </div>
            
            <div class="modern-card-content">
                <div class="modern-card-author">${authorText}</div>
                <div>
                    <span class="modern-card-category">${editionLabel}</span>
                    <span class="modern-card-year">${yearLabel}</span>
                </div>
            </div>
            
            ${!isComingSoon ? `
                <div class="modern-card-actions-bar">
                    <button class="modern-card-btn-sm modern-card-btn-primary view-pdf-modern" data-pdf="${book.pdfUrl}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <a href="${book.pdfUrl}" download class="modern-card-btn-sm modern-card-btn-secondary" onclick="event.stopPropagation()">
                        <i class="fas fa-download"></i> Descargar
                    </a>
                </div>
            ` : `
                <div class="modern-card-actions-bar">
                    <span class="coming-soon-label"><i class="fas fa-clock"></i> Próximamente</span>
                </div>
            `}
        `;
        
        // Click en tarjeta abre visor PDF
        if (!isComingSoon) {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('a') && !e.target.closest('button')) {
                    this.handleViewPDF(book.pdfUrl, book.title);
                }
            });
        }
        
        // Evento para botón Ver PDF
        const viewBtn = card.querySelector('.view-pdf-modern');
        if (viewBtn && !isComingSoon) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleViewPDF(book.pdfUrl, book.title, e.currentTarget);
            });
        }
        
        return card;
    }
    
    animateCards() {
        const cards = document.querySelectorAll('.modern-edition-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 30);
        });
    }
    
    renderEmptyState(grid) {
        grid.innerHTML = `
            <div class="modern-empty-state" style="grid-column: 1 / -1;">
                <div class="modern-empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="modern-empty-title">No se encontraron ediciones</h3>
                <p class="modern-empty-description">
                    Intenta con otros términos de búsqueda o ajusta los filtros para encontrar lo que buscas
                </p>
                <button class="modern-empty-action" onclick="window.modernViewer && window.modernViewer.clearAllFilters()">
                    <i class="fas fa-refresh me-2"></i>
                    Limpiar filtros
                </button>
            </div>
        `;
    }
    
    handleViewPDF(pdfUrl, title, button = null) {
        if (button) {
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fa fa-spinner fa-spin"></i><span>Cargando...</span>';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.disabled = false;
            }, 2000);
        }
        
        // Use enhanced PDF viewer when available
        if (window.enhancedPdfViewer) {
            const fullPdfUrl = new URL(pdfUrl, window.location.href).href;
            window.enhancedPdfViewer.open(fullPdfUrl, title);
        } else {
            // Fallback - open in new tab
            window.open(pdfUrl, '_blank');
        }
    }
    
    clearAllFilters() {
        this.activeFilters.clear();
        this.searchTerm = '';
        
        const searchInput = document.getElementById('modernSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.toggleClearButton();
        this.updateChips();
        this.filterBooks();
    }
    
    // Public API methods
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
    
    setSearchTerm(term) {
        this.searchTerm = term;
        const searchInput = document.getElementById('modernSearchInput');
        if (searchInput) {
            searchInput.value = term;
        }
        this.toggleClearButton();
        this.filterBooks();
    }
}

// Initialize when DOM is ready
let modernViewer;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        modernViewer = new ModernEditionViewer();
        window.modernViewer = modernViewer;
        
        const oldInterfaces = document.querySelectorAll('.mobile-search-container, .mobile-cards-grid, #bookList');
        oldInterfaces.forEach(el => {
            if (el) el.style.display = 'none';
        });
        
    }, 300);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernEditionViewer;
}


