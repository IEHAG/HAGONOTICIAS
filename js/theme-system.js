// Theme System - Light and Dark Mode
class ThemeSystem {
    constructor() {
        this.currentTheme = 'light';
        this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.storageKey = 'hagonoticias-theme';
        this.transitionDuration = 300;
        
        this.init();
    }
    
    init() {
        this.loadSavedTheme();
        this.createThemeToggle();
        this.bindEvents();
        this.applyTheme(this.currentTheme, false);
        this.setupSystemThemeListener();
    }
    
    loadSavedTheme() {
        // Check for saved theme in localStorage
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // Use system preference if no saved theme
            this.currentTheme = this.prefersDark.matches ? 'dark' : 'light';
        }
    }
    
    createThemeToggle() {
        // Check if toggle already exists
        if (document.getElementById('themeToggle')) return;
        
        const toggle = document.createElement('button');
        toggle.id = 'themeToggle';
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Cambiar tema');
        toggle.setAttribute('data-tooltip', 'Cambiar tema');
        
        toggle.innerHTML = `
            <i class="fas fa-sun icon icon-sun"></i>
            <i class="fas fa-moon icon icon-moon"></i>
        `;
        
        document.body.appendChild(toggle);
        
        // Add click event
        toggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Add keyboard support
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    bindEvents() {
        // Listen for storage changes (theme changes in other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue !== this.currentTheme) {
                this.currentTheme = e.newValue || 'light';
                this.applyTheme(this.currentTheme, false);
                this.updateToggleState();
            }
        });
        
        // Listen for system theme changes
        this.prefersDark.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a theme
            if (!localStorage.getItem(this.storageKey)) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.currentTheme, true);
                this.updateToggleState();
            }
        });
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Refresh theme when page becomes visible
                this.applyTheme(this.currentTheme, false);
            }
        });
    }
    
    setupSystemThemeListener() {
        // Create a more robust system theme listener
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleSystemThemeChange = (e) => {
                // Only respond to system changes if no manual theme is set
                if (!localStorage.getItem(this.storageKey)) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    if (newTheme !== this.currentTheme) {
                        this.currentTheme = newTheme;
                        this.applyTheme(this.currentTheme, true);
                        this.updateToggleState();
                        this.showThemeIndicator(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} (automático)`);
                    }
                }
            };
            
            // Use both addEventListener and addListener for broader compatibility
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleSystemThemeChange);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleSystemThemeChange);
            }
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, true);
    }
    
    setTheme(theme, animate = true) {
        if (theme === this.currentTheme) return;
        
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.applyTheme(theme, animate);
        this.updateToggleState();
        this.showThemeIndicator(`Tema ${theme === 'dark' ? 'oscuro' : 'claro'}`);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: theme }
        }));
    }
    
    applyTheme(theme, animate = true) {
        const root = document.documentElement;
        
        if (animate) {
            this.addTransitionOverlay();
        }
        
        // Remove existing theme classes
        root.removeAttribute('data-theme');
        
        // Apply new theme
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        }
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Update favicon if needed
        this.updateFavicon(theme);
        
        if (animate) {
            setTimeout(() => {
                this.removeTransitionOverlay();
            }, this.transitionDuration);
        }
    }
    
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        metaThemeColor.content = color;
    }
    
    updateFavicon(theme) {
        // Optional: Update favicon based on theme
        // This would require having different favicon files for light/dark themes
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon && theme === 'dark') {
            // favicon.href = 'favicon-dark.ico';
        } else if (favicon) {
            // favicon.href = 'favicon.ico';
        }
    }
    
    updateToggleState() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;
        
        const tooltip = this.currentTheme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
        toggle.setAttribute('data-tooltip', tooltip);
        toggle.setAttribute('aria-label', tooltip);
    }
    
    addTransitionOverlay() {
        let overlay = document.getElementById('themeTransitionOverlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'themeTransitionOverlay';
            overlay.className = 'theme-transition-overlay';
            document.body.appendChild(overlay);
        }
        
        // Force reflow
        overlay.offsetHeight;
        overlay.classList.add('active');
    }
    
    removeTransitionOverlay() {
        const overlay = document.getElementById('themeTransitionOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
    
    showThemeIndicator(message) {
        let indicator = document.getElementById('themeIndicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'themeIndicator';
            indicator.className = 'theme-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = message;
        indicator.classList.add('show');
        
        // Hide after 2 seconds
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
    
    saveTheme(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (e) {
            console.warn('Could not save theme to localStorage:', e);
        }
    }
    
    // Public methods
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
    
    isLightMode() {
        return this.currentTheme === 'light';
    }
    
    resetToSystemTheme() {
        localStorage.removeItem(this.storageKey);
        const systemTheme = this.prefersDark.matches ? 'dark' : 'light';
        this.setTheme(systemTheme, true);
        this.showThemeIndicator('Tema sincronizado con el sistema');
    }
    
    // Utility methods for other components
    getThemeColors() {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        return {
            primary: computedStyle.getPropertyValue('--color-primary').trim(),
            background: computedStyle.getPropertyValue('--bg-primary').trim(),
            text: computedStyle.getPropertyValue('--text-primary').trim(),
            border: computedStyle.getPropertyValue('--border-color').trim()
        };
    }
    
    // Method to update CSS custom properties dynamically
    updateCustomProperty(property, value) {
        document.documentElement.style.setProperty(property, value);
    }
    
    // Method to get CSS custom property value
    getCustomProperty(property) {
        return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    }
    
    // Accessibility helpers
    announceThemeChange(theme) {
        // Create or update screen reader announcement
        let announcement = document.getElementById('themeAnnouncement');
        
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'themeAnnouncement';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            document.body.appendChild(announcement);
        }
        
        announcement.textContent = `Tema cambiado a ${theme === 'dark' ? 'oscuro' : 'claro'}`;
    }
    
    // Performance optimization
    preloadThemeAssets() {
        // Preload any theme-specific assets
        const themes = ['light', 'dark'];
        themes.forEach(theme => {
            // Preload theme-specific images or fonts if needed
            // This is a placeholder for future enhancements
        });
    }
    
    // Debug methods
    debugThemeInfo() {
        console.group('Theme System Debug Info');
        console.log('Current Theme:', this.currentTheme);
        console.log('System Preference:', this.prefersDark.matches ? 'dark' : 'light');
        console.log('Saved Theme:', localStorage.getItem(this.storageKey));
        console.log('Theme Colors:', this.getThemeColors());
        console.groupEnd();
    }
}

// Auto-initialize theme system
let themeSystem;

document.addEventListener('DOMContentLoaded', function() {
    themeSystem = new ThemeSystem();
    
    // Make it globally accessible
    window.themeSystem = themeSystem;
    
    // Add keyboard shortcut (Ctrl/Cmd + Shift + T)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            themeSystem.toggleTheme();
        }
    });
    
    // Add double-tap to toggle theme on mobile
    let lastTap = 0;
    document.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
            // Double tap detected on theme toggle area
            const toggle = document.getElementById('themeToggle');
            if (toggle) {
                const rect = toggle.getBoundingClientRect();
                const touch = e.changedTouches[0];
                
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    themeSystem.toggleTheme();
                }
            }
        }
        lastTap = currentTime;
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeSystem;
}

// Global utility functions
window.setTheme = function(theme) {
    if (window.themeSystem) {
        window.themeSystem.setTheme(theme);
    }
};

window.toggleTheme = function() {
    if (window.themeSystem) {
        window.themeSystem.toggleTheme();
    }
};

window.getCurrentTheme = function() {
    return window.themeSystem ? window.themeSystem.getCurrentTheme() : 'light';
};

