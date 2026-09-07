/**
 * MAIN.JS — Portal Público
 * HAGO Noticias — I.E. Héctor Abad Gómez
 * Desarrollo: Ing. Víctor Cañola
 *
 * Funcionalidades compartidas: navegación, búsqueda,
 * filtros, PDF viewer, utilidades.
 */

// ════════════════════════════════════════════════
//  UTILIDADES
// ════════════════════════════════════════════════
function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ════════════════════════════════════════════════
//  NAVEGACIÓN
// ════════════════════════════════════════════════
function initNavigation() {
    const toggle = document.querySelector('.mobile-toggle');
    const menu   = document.querySelector('.mobile-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            const isOpen = menu.classList.contains('open');
            toggle.innerHTML = `<i class="fas fa-${isOpen ? 'times' : 'bars'}"></i>`;
            toggle.setAttribute('aria-expanded', isOpen);
        });

        // Cerrar menú al hacer clic en un enlace
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    // Scroll activo en nav
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    const id = entry.target.id;
                    const link = document.querySelector(`.nav-link[href="#${id}"]`);
                    if (link) link.classList.add('active');
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(s => observer.observe(s));
    }
}

// ════════════════════════════════════════════════
//  BÚSQUEDA
// ════════════════════════════════════════════════
function initSearch(inputId, clearBtnId, callback) {
    const input = document.getElementById(inputId);
    const clear = document.getElementById(clearBtnId);
    if (!input) return;

    input.addEventListener('input', debounce(() => {
        const value = input.value.trim().toLowerCase();
        if (clear) clear.classList.toggle('visible', value.length > 0);
        if (callback) callback(value);
    }, 200));

    if (clear) {
        clear.addEventListener('click', () => {
            input.value = '';
            clear.classList.remove('visible');
            if (callback) callback('');
            input.focus();
        });
    }
}

// ════════════════════════════════════════════════
//  FILTROS
// ════════════════════════════════════════════════
function initFilters(containerSelector, callback) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const wasActive = chip.classList.contains('active');
            container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            if (!wasActive) chip.classList.add('active');
            const filter = wasActive ? null : chip.dataset.filter;
            if (callback) callback(filter);
        });
    });
}

// ════════════════════════════════════════════════
//  PDF VIEWER (iframe fallback)
// ════════════════════════════════════════════════
function openPdfViewer(url, title) {
    if (!url) return;

    // Si hay enhancedPdfViewer disponible, usarlo
    if (window.enhancedPdfViewer && typeof window.enhancedPdfViewer.open === 'function') {
        window.enhancedPdfViewer.open(url, title);
        return;
    }

    // Fallback: abrir en nueva pestaña
    window.open(url, '_blank', 'noopener');
}

function closePdfViewer() {
    if (window.enhancedPdfViewer && typeof window.enhancedPdfViewer.close === 'function') {
        window.enhancedPdfViewer.close();
    }
}

// ════════════════════════════════════════════════
//  VIDEO PLAYER
// ════════════════════════════════════════════════
function playYouTubeVideo(videoId, title) {
    if (!videoId) return;

    const modal = document.querySelector('.video-modal');
    if (!modal) return;

    const container = modal.querySelector('.video-container');
    if (!container) return;

    // Crear iframe
    container.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
            title="${escapeHtml(title || 'Video')}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
            style="width:100%;aspect-ratio:16/9;border:none;border-radius:8px"
        ></iframe>
    `;

    modal.classList.add('open');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    if (!modal) return;

    const container = modal.querySelector('.video-container');
    if (container) container.innerHTML = '';

    modal.classList.remove('open');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ════════════════════════════════════════════════
//  INICIALIZACIÓN GLOBAL
// ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();

    // Cerrar modales con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeVideoModal();
            closePdfViewer();
        }
    });

    // Cerrar modal video al hacer clic fuera
    const videoModal = document.querySelector('.video-modal');
    if (videoModal) {
        videoModal.addEventListener('click', e => {
            if (e.target === videoModal) closeVideoModal();
        });
    }

    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// ════════════════════════════════════════════════
//  EXPORTAR FUNCIONES GLOBALES
// ════════════════════════════════════════════════
window.HAGO = {
    escapeHtml,
    formatDate,
    debounce,
    openPdfViewer,
    closePdfViewer,
    playYouTubeVideo,
    closeVideoModal,
    initSearch,
    initFilters,
};
