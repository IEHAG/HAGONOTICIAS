// Enhanced Interactions for HAGO Noticias

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all enhanced interactions
    initializeScrollAnimations();
    initializeParallaxEffects();
    initializeHoverEffects();
    initializeLoadingScreen();
    initializeSmoothScrolling();
    initializeImageLazyLoading();
    initializeKeyboardNavigation();
    
    console.log('Enhanced interactions initialized');
});

// Enhanced scroll animations with better performance
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Add staggered animation for child elements
                const children = entry.target.querySelectorAll('.stagger-child');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('revealed');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observe elements with reveal animations
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced parallax with throttling for better performance
function initializeParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// Enhanced hover effects with better performance
function initializeHoverEffects() {
    // Edition cards hover effects
    const editionCards = document.querySelectorAll('.edition-card');
    
    editionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            
            // Add glow effect to buttons
            const buttons = this.querySelectorAll('.btn');
            buttons.forEach(btn => {
                btn.style.boxShadow = '0 8px 25px rgba(0, 123, 255, 0.4)';
            });
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            
            // Remove glow effect from buttons
            const buttons = this.querySelectorAll('.btn');
            buttons.forEach(btn => {
                btn.style.boxShadow = '';
            });
        });
    });
    
    // Navigation links hover effects
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.color = '#007bff';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.color = '';
        });
    });
}

// Enhanced loading screen with progress indication
function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingText = loadingScreen.querySelector('h3');
    const loadingSubtext = loadingScreen.querySelector('p');
    
    // Simulate loading progress
    const loadingSteps = [
        'Cargando recursos...',
        'Preparando contenido...',
        'Optimizando experiencia...',
        'Casi listo...'
    ];
    
    const subtextSteps = [
        'Descargando archivos necesarios.',
        'Configurando la interfaz.',
        'Aplicando mejoras visuales.',
        'Finalizando carga.'
    ];
    
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
            loadingText.textContent = loadingSteps[currentStep];
            loadingSubtext.textContent = subtextSteps[currentStep];
            currentStep++;
        } else {
            clearInterval(progressInterval);
        }
    }, 500);
    
    // Hide loading screen when everything is loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            clearInterval(progressInterval);
        }, 2000);
    });
}

// Enhanced smooth scrolling with easing
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced image lazy loading with fade-in effect
function initializeImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Create a new image to preload
                    const newImg = new Image();
                    newImg.onload = function() {
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                    };
                    newImg.src = img.dataset.src || img.src;
                    
                    imageObserver.unobserve(img);
                }
            });
        });

        // Observe all images
        document.querySelectorAll('img').forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }
}

// Enhanced keyboard navigation
function initializeKeyboardNavigation() {
    // Add keyboard support for edition cards
    const editionCards = document.querySelectorAll('.edition-card');
    
    editionCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Edición ${index + 1}`);
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const viewButton = this.querySelector('.btn-primary');
                if (viewButton) {
                    viewButton.click();
                }
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Alt + H: Go to home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            document.querySelector('#home').scrollIntoView({ behavior: 'smooth' });
        }
        
        // Alt + E: Go to editions
        if (e.altKey && e.key === 'e') {
            e.preventDefault();
            document.querySelector('#ediciones').scrollIntoView({ behavior: 'smooth' });
        }
        
        // Escape: Close any open modals or overlays
        if (e.key === 'Escape') {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
                loadingScreen.classList.add('hidden');
            }
        }
    });
}

// Enhanced error handling
function initializeErrorHandling() {
    // Global error handler for images
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.src = 'img/default-thumbnail.png';
            e.target.alt = 'Imagen no disponible';
            console.warn('Image failed to load:', e.target.src);
        }
    }, true);
    
    // Global error handler for videos
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'VIDEO') {
            const container = e.target.parentElement;
            if (container) {
                container.innerHTML = '<div class="video-error">Video no disponible</div>';
            }
            console.warn('Video failed to load:', e.target.src);
        }
    }, true);
}

// Performance monitoring
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
            
            // Log performance metrics
            if (loadTime > 3000) {
                console.warn('Page load time is slow:', loadTime + 'ms');
            }
        }
    });
    
    // Monitor scroll performance
    let scrollCount = 0;
    window.addEventListener('scroll', function() {
        scrollCount++;
        if (scrollCount % 100 === 0) {
            console.log('Scroll events processed:', scrollCount);
        }
    }, { passive: true });
}

// Initialize error handling and performance monitoring
document.addEventListener('DOMContentLoaded', function() {
    initializeErrorHandling();
    initializePerformanceMonitoring();
});

// Utility functions
const Utils = {
    // Debounce function for performance optimization
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    
    // Throttle function for scroll events
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Export utilities for use in other scripts
window.HagoUtils = Utils;

