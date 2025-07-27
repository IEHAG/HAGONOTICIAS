// Interacciones y efectos visuales avanzados

class InteractiveEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.setupTypingEffect();
        this.setupParticleSystem();
        this.setupSmoothScrolling();
        this.setupLazyLoading();
        this.setupCounterAnimations();
    }

    // Animaciones al hacer scroll
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Animaciones específicas por tipo de elemento
                    if (entry.target.classList.contains('card')) {
                        this.animateCard(entry.target);
                    }
                    
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observar elementos que necesitan animación
        document.querySelectorAll('.card, .hero-content, .section-title, .stat-number').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    // Efectos parallax
    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-element');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Efectos hover mejorados
    setupHoverEffects() {
        // Efecto de inclinación 3D para tarjetas
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });

        // Efecto de seguimiento del cursor
        this.setupCursorFollower();
    }

    // Efecto de escritura automática
    setupTypingEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter-text');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid #007bff';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    // Efecto de parpadeo del cursor
                    setInterval(() => {
                        element.style.borderRight = element.style.borderRight === 'none' ? '2px solid #007bff' : 'none';
                    }, 500);
                }
            }, 100);
        });
    }

    // Sistema de partículas
    setupParticleSystem() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const particleContainer = document.createElement('div');
        particleContainer.className = 'floating-particles';
        heroSection.appendChild(particleContainer);

        // Crear partículas
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.width = (Math.random() * 10 + 5) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            
            particleContainer.appendChild(particle);
        }
    }

    // Scroll suave mejorado
    setupSmoothScrolling() {
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

    // Carga perezosa de imágenes
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Animaciones de contador
    setupCounterAnimations() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 segundos
            const increment = target / (duration / 16); // 60 FPS
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Iniciar cuando el elemento sea visible
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
            
            observer.observe(counter);
        });
    }

    // Seguidor de cursor personalizado
    setupCursorFollower() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(0, 123, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
            display: none;
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            cursor.style.display = 'block';
        });

        // Efectos especiales en elementos interactivos
        document.querySelectorAll('a, button, .clickable').forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(2)';
                cursor.style.background = 'rgba(255, 107, 107, 0.7)';
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'rgba(0, 123, 255, 0.5)';
            });
        });
    }

    // Animación de tarjetas
    animateCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.9)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 100);
    }

    // Animación de contador
    animateCounter(element) {
        const target = parseInt(element.textContent);
        let current = 0;
        const increment = target / 60; // 1 segundo a 60fps
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current);
            
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    }
}

// Efectos de loading
class LoadingEffects {
    static showPageLoader() {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="d-flex align-items-center justify-content-center mb-4">
                    <img src="img/LOGOHAGONOTICIAS.png" alt="HAG Noticias" style="height: 80px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));">
                </div>
                <div class="loading-spinner mb-3"></div>
                <h3 class="mt-3 text-primary fw-bold">Cargando HAG Noticias...</h3>
                <p class="text-dark fw-semibold">Preparando el mejor contenido periodístico para ti</p>
                <div class="progress mt-3" style="height: 6px; border-radius: 10px;">
                    <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" 
                         role="progressbar" style="width: 0%; transition: width 2s ease;"></div>
                </div>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95) url('img/loading_background.jpg') no-repeat center center;
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        document.body.appendChild(loader);
        
        // Animar la barra de progreso
        setTimeout(() => {
            const progressBar = loader.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }, 500);
        
        // Remover después de que la página cargue
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (loader.parentNode) {
                        loader.remove();
                    }
                }, 500);
            }, 2000); // Aumentado para mostrar el efecto completo
        });
    }

    static showElementLoader(element) {
        const loader = document.createElement('div');
        loader.className = 'element-loader';
        loader.innerHTML = '<div class="loading-spinner"></div>';
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
        `;
        
        element.style.position = 'relative';
        element.appendChild(loader);
        
        return loader;
    }
}

// Efectos de notificación
class NotificationSystem {
    static show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)} me-2"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remover
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
    
    static getIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar loader de página
    LoadingEffects.showPageLoader();
    
    // Inicializar efectos interactivos
    new InteractiveEffects();
    
    // Configurar eventos globales
    setupGlobalEvents();
});

function setupGlobalEvents() {
    // Efecto de ripple en botones
    document.addEventListener('click', function(e) {
        if (e.target.matches('button, .btn')) {
            createRippleEffect(e);
        }
    });
    
    // Mostrar/ocultar botón de scroll to top
    const scrollTopBtn = createScrollTopButton();
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
}

function createRippleEffect(e) {
    const button = e.target;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function createScrollTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-top-btn';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #007bff, #0056b3);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    `;
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
    return button;
}

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification-content {
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        margin-left: auto;
        cursor: pointer;
        opacity: 0.7;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .loader-content {
        text-align: center;
    }
`;
document.head.appendChild(style);

