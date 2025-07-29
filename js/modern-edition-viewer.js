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
        this.books = [
            {
                id: 1,
                title: "Edición #1",
                description: "Temas: Día de la democracia, Madres, Maestro, Talentos Abadistas",
                category: "#1",
                year: "Año 2024",
                thumbnail: "https://drive.google.com/thumbnail?id=1UICpZu7v8SyBjJaA29YYYzZa2F97i25m&sz=w400-h300",
                pdfUrl: "pdf/EDICION1.pdf",
                tags: ["democracia", "madres", "maestro", "talentos"],
                featured: true
            },
            {
                id: 2,
                title: "Edición #2",
                description: "Temas: Periodico Institucional - Día de la Antioqueñidad",
                category: "#2",
                year: "Año 2024",
                thumbnail: "https://drive.google.com/thumbnail?id=1UjFe_Jj1lN-_vTAqr3A_MH4sSthQWzPv&sz=w400-h300",
                pdfUrl: "pdf/EDICION2.pdf",
                tags: ["antioqueñidad", "cultura", "tradición", "periodico"],
                featured: false
            },
            {
                id: 3,
                title: "Edición #3",
                description: "Temas: Semana Abadista - Periodico Institucional",
                category: "#3",
                year: "Año 2024",
                thumbnail: "https://drive.google.com/thumbnail?id=1q6lmYNtsZKa1_WPglzVAbG9q0OuEoHy5&sz=w400-h300",
                pdfUrl: "pdf/EDICION3.pdf",
                tags: ["semana abadista", "foro", "museo", "escolar"],
                featured: false
            },
            {
                id: 4,
                title: "Edición #4",
                description: "Temas: La institución de la Inclusión, Gobierno Escolar 2025",
                category: "#4",
                year: "Año 2025",
                thumbnail: "https://drive.google.com/thumbnail?id=13fWBxbiOMp8MMZIsOO-gPyX14VP361Ql&sz=w400-h300",
                pdfUrl: "pdf/EDICION4.pdf",
                tags: ["inclusión", "gobierno escolar", "2025"],
                featured: true
            },
            {
                id: 5,
                title: "Edición #5",
                description: "Temas: Semana Democrática - Periodico Institucional",
                category: "#5",
                year: "Año 2025",
                thumbnail: "img/default-thumbnail.png",
                pdfUrl: "#",
                tags: ["democracia", "semana", "periodico"],
                featured: false,
                comingSoon: true
            }
        ];
        
        this.filteredBooks = [...this.books];
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
        
        // Hide existing interface
        const existingElements = container.querySelectorAll('.row, #bookList, .mobile-search-container, .mobile-cards-grid');
        existingElements.forEach(el => el.style.display = 'none');
        
        // Create modern interface
        const modernInterface = document.createElement('div');
        modernInterface.className = 'modern-edition-viewer';
        modernInterface.innerHTML = `
            <div class="modern-viewer-container">
                <div class="modern-viewer-header">
                    <h2 class="modern-viewer-title">Ediciones HAG Noticias</h2>
                    <p class="modern-viewer-subtitle">
                        Descubre nuestras publicaciones institucionales con contenido de calidad
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
                        
                        <select class="modern-filter-select" id="modernFilterSelect">
                            <option value="">Todas las ediciones</option>
                            <option value="#1">Edición #1</option>
                            <option value="#2">Edición #2</option>
                            <option value="#3">Edición #3</option>
                            <option value="#4">Edición #4</option>
                            <option value="#5">Edición #5</option>
                        </select>
                    </div>
                    
                    <div class="modern-filter-tags" id="modernFilterTags"></div>
                </div>
                
                <div class="text-center">
                    <span class="modern-results-counter" id="modernResultsCounter">
                        ${this.filteredBooks.length} ediciones disponibles
                    </span>
                </div>
                
                <div class="modern-editions-grid" id="modernEditionsGrid">
                    <!-- Cards will be generated here -->
                </div>
            </div>
        `;
        
        // Insert after title
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
        // Search functionality
        const searchInput = document.getElementById('modernSearchInput');
        const searchClear = document.getElementById('modernSearchClear');
        const filterSelect = document.getElementById('modernFilterSelect');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.toggleClearButton();
                this.debounceFilter();
            });
            
            // Enhanced mobile keyboard handling
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
        
        // Keyboard shortcuts
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
        const tagsContainer = document.getElementById('modernFilterTags');
        if (!tagsContainer) return;
        
        tagsContainer.innerHTML = '';
        
        this.activeFilters.forEach(filter => {
            const tag = document.createElement('div');
            tag.className = 'modern-filter-tag';
            tag.innerHTML = `
                <span>Edición ${filter.replace('#', '')}</span>
                <button class="modern-filter-tag-remove" data-filter="${filter}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            const removeBtn = tag.querySelector('.modern-filter-tag-remove');
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
            const matchesSearch = normalizedSearch === '' || 
                this.normalizeText(book.title).includes(normalizedSearch) ||
                this.normalizeText(book.description).includes(normalizedSearch) ||
                this.normalizeText(book.year).includes(normalizedSearch) ||
                book.tags.some(tag => this.normalizeText(tag).includes(normalizedSearch));
            
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
            
            if (count === total) {
                counter.textContent = `${count} ediciones disponibles`;
            } else {
                counter.textContent = `${count} de ${total} ediciones encontradas`;
            }
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
        card.style.animationDelay = `${index * 0.1}s`;
        
        const isComingSoon = book.comingSoon;
        const isFeatured = book.featured;
        
        card.innerHTML = `
            <div class="modern-card-image-container">
                <img src="${book.thumbnail}" 
                     alt="${book.title}" 
                     class="modern-card-image"
                     loading="lazy"
                     onerror="this.src='img/default-thumbnail.png'">
                
                <div class="modern-card-overlay">
                    <div class="modern-card-overlay-content">
                        <h4 style="margin-bottom: 1rem;">${book.title}</h4>
                        <p style="margin-bottom: 1.5rem; opacity: 0.9;">${book.description}</p>
                        ${!isComingSoon ? `
                            <button class="modern-card-button modern-card-button-primary" 
                                    onclick="modernViewer.handleViewPDF('${book.pdfUrl}', '${book.title}')">
                                <i class="fas fa-eye"></i>
                                <span>Ver Ahora</span>
                            </button>
                        ` : `
                            <div style="color: rgba(255,255,255,0.8); font-style: italic;">
                                <i class="fas fa-clock"></i> Próximamente
                            </div>
                        `}
                    </div>
                </div>
                
                <div class="modern-card-badge ${isFeatured ? 'featured' : ''}">${book.category}</div>
                <div class="modern-card-year">
                    <i class="fas fa-calendar me-1"></i>${book.year}
                </div>
                
                ${isComingSoon ? '<div class="coming-soon-badge"><i class="fas fa-clock"></i> Próximamente</div>' : ''}
            </div>
            
            <div class="modern-card-content">
                <h3 class="modern-card-title">${book.title}</h3>
                <p class="modern-card-description">${book.description}</p>
                
                <div class="modern-card-actions">
                    ${!isComingSoon ? `
                        <button class="modern-card-button modern-card-button-primary view-pdf-modern" 
                                data-pdf="${book.pdfUrl}" 
                                data-title="${book.title}">
                            <i class="fas fa-eye"></i>
                            <span>Ver PDF</span>
                        </button>
                        <a href="${book.pdfUrl}" 
                           download 
                           class="modern-card-button modern-card-button-secondary"
                           title="Descargar PDF">
                            <i class="fas fa-download"></i>
                        </a>
                    ` : `
                        <button class="modern-card-button modern-card-button-primary" disabled>
                            <i class="fas fa-clock"></i>
                            <span>Próximamente</span>
                        </button>
                    `}
                </div>
            </div>
        `;
        
        // Bind events
        const viewBtn = card.querySelector('.view-pdf-modern');
        if (viewBtn && !isComingSoon) {
            viewBtn.addEventListener('click', (e) => {
                this.handleViewPDF(book.pdfUrl, book.title, e.currentTarget);
            });
        }
        
        return card;
    }
    
    animateCards() {
        const cards = document.querySelectorAll('.modern-edition-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
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
                <button class="modern-empty-action" onclick="modernViewer.clearAllFilters()">
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
        
        // Use existing PDF viewer
        if (window.mobilePdfViewer) {
            const fullPdfUrl = new URL(pdfUrl, window.location.href).href;
            window.mobilePdfViewer.open(fullPdfUrl, title);
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
        this.updateFilterTags();
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

// Additional CSS for coming soon and featured badges
const additionalStyles = `
<style>
.coming-soon-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
    color: #000;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    z-index: 3;
    box-shadow: 0 2px 10px rgba(255, 193, 7, 0.4);
}

.modern-card-badge.featured {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.modern-card-badge.featured::after {
    content: ' ⭐';
}

.modern-card-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.modern-card-button:disabled:hover {
    transform: none !important;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3) !important;
}

/* Enhanced mobile responsiveness */
@media (max-width: 480px) {
    .modern-card-overlay-content h4 {
        font-size: 1.2rem;
    }
    
    .modern-card-overlay-content p {
        font-size: 0.9rem;
    }
    
    .modern-card-overlay-content .modern-card-button {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
    }
}

/* Tablet optimizations */
@media (min-width: 769px) and (max-width: 1024px) {
    .modern-editions-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 1.5rem;
    }
    
    .modern-search-container {
        justify-content: space-between;
    }
    
    .modern-search-group {
        flex: 1;
        max-width: 60%;
    }
    
    .modern-filter-select {
        max-width: 35%;
    }
}

/* Desktop enhancements */
@media (min-width: 1025px) {
    .modern-editions-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)) !important;
        gap: 2rem;
    }
    
    .modern-edition-card:hover {
        transform: translateY(-15px) scale(1.03);
    }
    
    .modern-search-group {
        max-width: 500px;
    }
}

/* Ultra-wide screens */
@media (min-width: 1400px) {
    .modern-editions-grid {
        grid-template-columns: repeat(4, 1fr) !important;
    }
}
</style>
`;

// Initialize when DOM is ready
let modernViewer;

document.addEventListener('DOMContentLoaded', function() {
    // Add additional styles
    document.head.insertAdjacentHTML('beforeend', additionalStyles);
    
    // Wait for other scripts to load
    setTimeout(() => {
        modernViewer = new ModernEditionViewer();
        window.modernViewer = modernViewer;
        
        // Hide old interfaces
        const oldInterfaces = document.querySelectorAll('.mobile-search-container, .mobile-cards-grid, #bookList');
        oldInterfaces.forEach(el => {
            if (el) el.style.display = 'none';
        });
        
    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernEditionViewer;
}

