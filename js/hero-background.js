// Sistema de fondo rotativo para el hero section
class HeroBackgroundManager {
    constructor() {
        this.backgrounds = document.querySelectorAll('.background-image');
        this.indicators = document.querySelectorAll('.indicator');
        this.currentIndex = 0;
        this.intervalTime = 5000; // 5 segundos
        this.interval = null;
        
        this.init();
    }
    
    init() {
        // Configurar eventos de indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToBackground(index);
            });
        });
        
        // Iniciar rotación automática
        this.startAutoRotation();
        
        // Pausar en hover
        const heroSection = document.querySelector('.hero-section');
        heroSection.addEventListener('mouseenter', () => this.pauseAutoRotation());
        heroSection.addEventListener('mouseleave', () => this.startAutoRotation());
    }
    
    goToBackground(index) {
        // Remover clase active de todos
        this.backgrounds.forEach(bg => bg.classList.remove('active'));
        this.indicators.forEach(ind => ind.classList.remove('active'));
        
        // Activar el seleccionado
        this.backgrounds[index].classList.add('active');
        this.indicators[index].classList.add('active');
        
        this.currentIndex = index;
    }
    
    nextBackground() {
        const nextIndex = (this.currentIndex + 1) % this.backgrounds.length;
        this.goToBackground(nextIndex);
    }
    
    startAutoRotation() {
        this.pauseAutoRotation(); // Limpiar cualquier intervalo existente
        this.interval = setInterval(() => {
            this.nextBackground();
        }, this.intervalTime);
    }
    
    pauseAutoRotation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

// Efectos adicionales para el hero
class HeroEffects {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupParallaxEffect();
        this.setupVideoEffects();
        this.setupTypingEffect();
    }
    
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero-section');
            const backgrounds = document.querySelectorAll('.background-image');
            
            if (heroSection) {
                // Efecto parallax en las imágenes de fondo
                backgrounds.forEach(bg => {
                    const speed = 0.5;
                    bg.style.transform = `translateY(${scrolled * speed}px)`;
                });
                
                // Efecto de fade en el contenido
                const opacity = Math.max(0, 1 - scrolled / window.innerHeight);
                heroSection.style.opacity = opacity;
            }
        });
    }
    
    setupVideoEffects() {
        const video = document.querySelector('.hero-video');
        if (video) {
            // Efecto de hover en el video
            video.addEventListener('mouseenter', () => {
                video.style.transform = 'scale(1.05)';
            });
            
            video.addEventListener('mouseleave', () => {
                video.style.transform = 'scale(1)';
            });
            
            // Controlar reproducción según visibilidad
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            });
            
            observer.observe(video);
        }
    }
    
    setupTypingEffect() {
        const typewriterElement = document.querySelector('.typewriter-text');
        if (typewriterElement) {
            const text = typewriterElement.textContent;
            typewriterElement.textContent = '';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    typewriterElement.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    // Mantener el cursor parpadeando
                    typewriterElement.classList.add('typing-complete');
                }
            }, 100);
        }
    }
}

// Sistema de partículas mejorado
class ParticleSystem {
    constructor() {
        this.container = document.querySelector('.floating-elements');
        this.particles = [];
        this.maxParticles = 20;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        this.createParticles();
        this.animateParticles();
    }
    
    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            // Propiedades aleatorias
            const size = Math.random() * 10 + 5;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 10 + 5;
            const delay = Math.random() * 5;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                animation: float ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
                background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
            `;
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }
    
    animateParticles() {
        // Animación adicional con JavaScript para mayor control
        this.particles.forEach((particle, index) => {
            const baseDelay = index * 200;
            
            setTimeout(() => {
                this.animateParticle(particle);
            }, baseDelay);
        });
    }
    
    animateParticle(particle) {
        const animate = () => {
            const currentTop = parseFloat(particle.style.top) || 0;
            const newTop = currentTop + (Math.random() - 0.5) * 2;
            
            particle.style.top = Math.max(0, Math.min(100, newTop)) + '%';
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistemas del hero
    new HeroBackgroundManager();
    new HeroEffects();
    new ParticleSystem();
    
    // Efecto de entrada del hero
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.opacity = '0';
        heroSection.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            heroSection.style.transition = 'all 1s ease';
            heroSection.style.opacity = '1';
            heroSection.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Optimización de rendimiento
window.addEventListener('resize', () => {
    // Recalcular posiciones en resize
    const particles = document.querySelectorAll('.floating-particle');
    particles.forEach(particle => {
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
    });
});

// Precargar imágenes de fondo para transiciones suaves
function preloadBackgroundImages() {
    const imageUrls = [
        'img/fondo1.jpg',
        'img/fondo2.jpg',
        'img/fondo3.jpg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Ejecutar precarga
preloadBackgroundImages();

