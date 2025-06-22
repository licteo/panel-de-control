// Configuración PWA para Panel de Aplicaciones

class PWAConfig {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.setupInstallPrompt();
        this.setupAppInstalled();
        this.setupConnectivity();
        this.setupThemeDetection();
        this.setupMobileFeatures();
        this.setupPerformanceOptimizations();
    }

    // Configurar prompt de instalación
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('App puede ser instalada');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });
    }

    // Configurar evento de instalación
    setupAppInstalled() {
        window.addEventListener('appinstalled', (evt) => {
            console.log('App instalada exitosamente');
            this.hideInstallBanner();
            this.showNotification('¡Aplicación instalada exitosamente!', 'success');
            
            // Enviar evento de analytics si está disponible
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install', {
                    'event_category': 'engagement',
                    'event_label': 'app_installed'
                });
            }
        });
    }

    // Configurar detección de conectividad
    setupConnectivity() {
        window.addEventListener('online', () => {
            this.showNotification('Conexión restaurada', 'success');
            document.body.classList.remove('offline');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Sin conexión - Modo offline activado', 'warning');
            document.body.classList.add('offline');
        });
    }

    // Configurar detección de tema del sistema
    setupThemeDetection() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleThemeChange = (e) => {
                if (window.appPanel && window.appPanel.settings.theme === 'auto') {
                    window.appPanel.updateTheme('auto');
                }
            };

            mediaQuery.addListener(handleThemeChange);
        }
    }

    // Configurar características móviles
    setupMobileFeatures() {
        // Prevenir zoom en inputs
        this.preventInputZoom();
        
        // Mejorar experiencia táctil
        this.setupTouchOptimizations();
        
        // Configurar gestos de navegación
        this.setupSwipeNavigation();
        
        // Optimizar para pantallas táctiles
        this.setupTouchScreenOptimizations();
    }

    // Prevenir zoom en inputs en móviles
    preventInputZoom() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        input.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                }
            });
        });
    }

    // Configurar optimizaciones táctiles
    setupTouchOptimizations() {
        // Aumentar área de toque para botones
        const touchTargets = document.querySelectorAll('.btn, .category-btn, .app-card');
        touchTargets.forEach(target => {
            target.style.minHeight = '44px';
            target.style.minWidth = '44px';
        });

        // Mejorar feedback táctil
        document.addEventListener('touchstart', () => {}, { passive: true });
    }

    // Configurar navegación por gestos
    setupSwipeNavigation() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            const threshold = 50;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.handleSwipeLeft();
                } else {
                    this.handleSwipeRight();
                }
            }
        });
    }

    // Manejar swipe izquierda
    handleSwipeLeft() {
        if (window.appPanel) {
            window.appPanel.navigateToNextCategory();
        }
    }

    // Manejar swipe derecha
    handleSwipeRight() {
        if (window.appPanel) {
            window.appPanel.navigateToPreviousCategory();
        }
    }

    // Configurar optimizaciones para pantallas táctiles
    setupTouchScreenOptimizations() {
        // Detectar si es una pantalla táctil
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.body.classList.add('touch-device');
        }

        // Optimizar para dispositivos con pantallas de alta densidad
        if (window.devicePixelRatio >= 2) {
            document.body.classList.add('high-dpi');
        }
    }

    // Configurar optimizaciones de rendimiento
    setupPerformanceOptimizations() {
        // Lazy loading para imágenes
        this.setupLazyLoading();
        
        // Optimizar animaciones
        this.setupAnimationOptimizations();
        
        // Configurar cache
        this.setupCacheOptimizations();
    }

    // Configurar lazy loading
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
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
    }

    // Configurar optimizaciones de animación
    setupAnimationOptimizations() {
        // Reducir animaciones en dispositivos de bajo rendimiento
        if (navigator.hardwareConcurrency <= 2) {
            document.body.classList.add('reduced-motion');
        }

        // Detectar preferencias de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }

    // Configurar optimizaciones de cache
    setupCacheOptimizations() {
        // Precachear recursos importantes
        if ('caches' in window) {
            const resourcesToCache = [
                '/',
                '/index.html',
                '/styles.css',
                '/script.js',
                '/manifest.json'
            ];

            caches.open('panel-apps-v1').then(cache => {
                cache.addAll(resourcesToCache);
            });
        }
    }

    // Mostrar banner de instalación
    showInstallBanner() {
        if (document.getElementById('installBanner')) return;

        const banner = document.createElement('div');
        banner.id = 'installBanner';
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="install-banner-content">
                <i class="fas fa-download"></i>
                <span>Instala esta aplicación para un acceso más rápido</span>
                <button class="btn btn-primary btn-sm" onclick="pwaConfig.installApp()">
                    Instalar
                </button>
                <button class="btn btn-secondary btn-sm" onclick="pwaConfig.hideInstallBanner()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Mostrar banner con animación
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    // Ocultar banner de instalación
    hideInstallBanner() {
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    // Instalar aplicación
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
            
            if (outcome === 'accepted') {
                this.showNotification('Instalando aplicación...', 'info');
            }
            
            this.deferredPrompt = null;
            this.hideInstallBanner();
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Ocultar notificación automáticamente
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Obtener icono para notificación
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Verificar si la app está instalada
    isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    // Obtener información del dispositivo
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            maxTouchPoints: navigator.maxTouchPoints,
            isStandalone: this.isAppInstalled()
        };
    }
}

// Inicializar configuración PWA
let pwaConfig;

document.addEventListener('DOMContentLoaded', () => {
    pwaConfig = new PWAConfig();
});

// Exportar para uso global
window.pwaConfig = pwaConfig; 