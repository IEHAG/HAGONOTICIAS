// Modern Navbar Functionality
class ModernNavbar {
    constructor() {
        this.navbar = document.querySelector('.modern-navbar');
        this.toggler = document.querySelector('.modern-navbar-toggler');
        this.collapse = document.querySelector('.navbar-collapse');
        this.themeToggle = document.getElementById('themeToggleBtn');
        this.isMenuOpen = false;
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupScrollEffect();
        this.initializeTheme();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
    }
    
    setupEventListeners() {
        // Toggle menu
        if (this.toggler) {
            this.toggler.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }
        
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    setTimeout(() => this.closeMenu(), 300);
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992 && this.isMenuOpen) {
                this.closeMenu();
            }
        });
        
        // Prevent body scroll when menu is open on mobile
        this.collapse?.addEventListener('shown.bs.collapse', () => {
            if (window.innerWidth < 992) {
                document.body.style.overflow = 'hidden';
            }
        });
        
        this.collapse?.addEventListener('hidden.bs.collapse', () => {
            document.body.style.overflow = '';
        });
    }
    
    setupScrollEffect() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 50) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll (mobile only)
            if (window.innerWidth <= 768) {
                if (scrollY > lastScrollY && scrollY > 100) {
                    // Scrolling down
                    this.navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    this.navbar.style.transform = 'translateY(0)';
                }
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }
    
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.isMenuOpen = true;
        this.toggler?.setAttribute('aria-expanded', 'true');
        this.collapse?.classList.add('show');
        
        // Add animation class
        this.collapse?.classList.add('collapsing');
        setTimeout(() => {
            this.collapse?.classList.remove('collapsing');
        }, 300);
        
        // Animate hamburger to X
        this.animateToggler(true);
        
        // Focus management
        setTimeout(() => {
            const firstNavLink = this.collapse?.querySelector('.nav-link');
            firstNavLink?.focus();
        }, 300);
    }
    
    closeMenu() {
        this.isMenuOpen = false;
        this.toggler?.setAttribute('aria-expanded', 'false');
        this.collapse?.classList.remove('show');
        
        // Animate X back to hamburger
        this.animateToggler(false);
        
        // Return focus to toggler
        this.toggler?.focus();
    }
    
    animateToggler(isOpen) {
        const lines = this.toggler?.querySelectorAll('.modern-toggler-line');
        if (!lines) return;
        
        if (isOpen) {
            lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            lines[1].style.opacity = '0';
            lines[1].style.transform = 'scale(0)';
            lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            lines[0].style.transform = 'rotate(0) translate(0, 0)';
            lines[1].style.opacity = '1';
            lines[1].style.transform = 'scale(1)';
            lines[2].style.transform = 'rotate(0) translate(0, 0)';
        }
    }
    
    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
        
        // Add visual feedback
        this.themeToggle?.classList.add('theme-changing');
        setTimeout(() => {
            this.themeToggle?.classList.remove('theme-changing');
        }, 400);
    }
    
    updateThemeIcon() {
        const lightIcon = this.themeToggle?.querySelector('.theme-icon-light');
        const darkIcon = this.themeToggle?.querySelector('.theme-icon-dark');
        
        if (this.currentTheme === 'dark') {
            lightIcon?.style.setProperty('opacity', '0');
            lightIcon?.style.setProperty('transform', 'rotate(-180deg) scale(0.5)');
            darkIcon?.style.setProperty('opacity', '1');
            darkIcon?.style.setProperty('transform', 'rotate(0deg) scale(1)');
        } else {
            lightIcon?.style.setProperty('opacity', '1');
            lightIcon?.style.setProperty('transform', 'rotate(0deg) scale(1)');
            darkIcon?.style.setProperty('opacity', '0');
            darkIcon?.style.setProperty('transform', 'rotate(180deg) scale(0.5)');
        }
    }
    
    setupKeyboardNavigation() {
        // Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
        
        // Tab navigation within menu
        this.collapse?.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = this.collapse.querySelectorAll('.nav-link');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
        
        // Arrow key navigation
        this.collapse?.addEventListener('keydown', (e) => {
            const navLinks = Array.from(this.collapse.querySelectorAll('.nav-link'));
            const currentIndex = navLinks.indexOf(document.activeElement);
            
            if (e.key === 'ArrowDown' && currentIndex < navLinks.length - 1) {
                e.preventDefault();
                navLinks[currentIndex + 1].focus();
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault();
                navLinks[currentIndex - 1].focus();
            }
        });
    }
    
    setupTouchGestures() {
        if (!('ontouchstart' in window)) return;
        
        let startX = 0;
        let startY = 0;
        let isSwipeGesture = false;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeGesture = false;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Check if it's a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                isSwipeGesture = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!isSwipeGesture || !startX) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            // Swipe right to open menu (from left edge)
            if (diffX < -100 && startX < 50 && !this.isMenuOpen) {
                this.openMenu();
            }
            // Swipe left to close menu
            else if (diffX > 100 && this.isMenuOpen) {
                this.closeMenu();
            }
            
            startX = 0;
            startY = 0;
            isSwipeGesture = false;
        }, { passive: true });
    }
    
    // Public API methods
    getTheme() {
        return this.currentTheme;
    }
    
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.updateThemeIcon();
        }
    }
    
    isMenuVisible() {
        return this.isMenuOpen;
    }
    
    forceCloseMenu() {
        this.closeMenu();
    }
}

// Additional CSS for theme changing animation
const additionalNavbarStyles = `
<style>
.theme-changing {
    animation: themeChangeRotate 0.4s ease-in-out;
}

@keyframes themeChangeRotate {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(0.8) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
}

/* Enhanced mobile navbar transitions */
.modern-navbar {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                background 0.3s ease,
                box-shadow 0.3s ease;
}

/* Smooth collapse animation */
.navbar-collapse.collapsing {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus styles for better accessibility */
.nav-link:focus-visible {
    outline: 2px solid #007bff;
    outline-offset: 2px;
    border-radius: 8px;
}

/* Mobile swipe indicator */
@media (max-width: 991.98px) {
    .modern-navbar::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(to bottom, transparent, rgba(0, 123, 255, 0.5), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }
    
    .modern-navbar:hover::before {
        opacity: 1;
    }
}

/* High performance GPU acceleration */
.modern-navbar,
.modern-navbar-toggler,
.theme-toggle-btn,
.navbar-collapse {
    will-change: transform;
    transform: translateZ(0);
}
</style>
`;

// Initialize when DOM is ready
let modernNavbar;

document.addEventListener('DOMContentLoaded', function() {
    // Add additional styles
    document.head.insertAdjacentHTML('beforeend', additionalNavbarStyles);
    
    // Initialize modern navbar
    modernNavbar = new ModernNavbar();
    
    // Make it globally accessible
    window.modernNavbar = modernNavbar;
    
    // Listen for theme changes from other components
    window.addEventListener('themeChanged', (e) => {
        console.log('Theme changed to:', e.detail.theme);
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernNavbar;
}

