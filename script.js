// Clase principal del Panel de Aplicaciones
class AppPanel {
    constructor() {
        this.apps = this.loadApps();
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.editingAppId = null;
        this.settings = this.loadSettings();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderApps();
        this.applySettings();
        this.showEmptyStateIfNeeded();
    }

    // Event Listeners
    setupEventListeners() {
        // Botones principales
        document.getElementById('addAppBtn').addEventListener('click', () => this.openModal());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());
        
        // Búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderApps();
        });

        // Categorías
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.updateCategoryButtons();
                this.renderApps();
            });
        });

        // Modal de aplicación
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('appForm').addEventListener('submit', (e) => this.handleAppSubmit(e));

        // Modal de configuración
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.closeSettingsModal());
        
        // Configuración
        document.getElementById('themeSelect').addEventListener('change', (e) => this.updateTheme(e.target.value));
        document.getElementById('gridSize').addEventListener('change', (e) => this.updateGridSize(e.target.value));
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('importData').addEventListener('click', () => this.importData());
        document.getElementById('clearData').addEventListener('click', () => this.clearData());

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeSettingsModal();
            }
        });

        // Cerrar modales haciendo clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    // Gestión de aplicaciones
    addApp(appData) {
        const app = {
            id: Date.now().toString(),
            name: appData.name,
            url: appData.url,
            icon: appData.icon,
            category: appData.category,
            description: appData.description || '',
            createdAt: new Date().toISOString()
        };

        this.apps.push(app);
        this.saveApps();
        this.renderApps();
        this.closeModal();
        this.showNotification('Aplicación agregada exitosamente', 'success');
    }

    updateApp(appId, appData) {
        const index = this.apps.findIndex(app => app.id === appId);
        if (index !== -1) {
            this.apps[index] = {
                ...this.apps[index],
                ...appData,
                updatedAt: new Date().toISOString()
            };
            this.saveApps();
            this.renderApps();
            this.closeModal();
            this.showNotification('Aplicación actualizada exitosamente', 'success');
        }
    }

    deleteApp(appId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta aplicación?')) {
            this.apps = this.apps.filter(app => app.id !== appId);
            this.saveApps();
            this.renderApps();
            this.showNotification('Aplicación eliminada exitosamente', 'success');
        }
    }

    editApp(appId) {
        const app = this.apps.find(app => app.id === appId);
        if (app) {
            this.editingAppId = appId;
            this.fillModalWithApp(app);
            this.openModal();
        }
    }

    // Renderizado
    renderApps() {
        const appsGrid = document.getElementById('appsGrid');
        const filteredApps = this.getFilteredApps();

        if (filteredApps.length === 0) {
            appsGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        appsGrid.innerHTML = filteredApps.map(app => this.getAppCardHTML(app)).join('');
        
        // Agregar event listeners a las tarjetas
        filteredApps.forEach(app => {
            this.setupAppCardListeners(app.id);
        });
    }

    getFilteredApps() {
        let filtered = this.apps;

        // Filtrar por categoría
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(app => app.category === this.currentCategory);
        }

        // Filtrar por búsqueda
        if (this.searchTerm) {
            filtered = filtered.filter(app => 
                app.name.toLowerCase().includes(this.searchTerm) ||
                app.description.toLowerCase().includes(this.searchTerm)
            );
        }

        return filtered;
    }

    getAppCardHTML(app) {
        return `
            <div class="app-card" data-app-id="${app.id}">
                <div class="app-icon">
                    <i class="${app.icon}"></i>
                </div>
                <div class="app-name">${app.name}</div>
                ${app.description ? `<div class="app-description">${app.description}</div>` : ''}
                <div class="app-actions">
                    <button class="btn btn-primary btn-sm" onclick="appPanel.openApp('${app.id}')">
                        <i class="fas fa-external-link-alt"></i> Abrir
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="appPanel.editApp('${app.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="appPanel.deleteApp('${app.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <i class="fas fa-th-large"></i>
                <h3>No hay aplicaciones</h3>
                <p>${this.searchTerm || this.currentCategory !== 'all' ? 'No se encontraron aplicaciones con los filtros actuales.' : 'Comienza agregando tu primera aplicación.'}</p>
                ${!this.searchTerm && this.currentCategory === 'all' ? '<button class="btn btn-primary" onclick="appPanel.openModal()"><i class="fas fa-plus"></i> Agregar Primera App</button>' : ''}
            </div>
        `;
    }

    setupAppCardListeners(appId) {
        const card = document.querySelector(`[data-app-id="${appId}"]`);
        if (card) {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.app-actions')) {
                    this.openApp(appId);
                }
            });
        }
    }

    // Modal
    openModal() {
        const modal = document.getElementById('appModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (this.editingAppId) {
            modalTitle.textContent = 'Editar Aplicación';
        } else {
            modalTitle.textContent = 'Agregar Nueva Aplicación';
            this.clearModalForm();
        }
        
        modal.classList.add('show');
        document.getElementById('appName').focus();
    }

    closeModal() {
        document.getElementById('appModal').classList.remove('show');
        this.editingAppId = null;
        this.clearModalForm();
    }

    clearModalForm() {
        document.getElementById('appForm').reset();
    }

    fillModalWithApp(app) {
        document.getElementById('appName').value = app.name;
        document.getElementById('appUrl').value = app.url;
        document.getElementById('appIcon').value = app.icon;
        document.getElementById('appCategory').value = app.category;
        document.getElementById('appDescription').value = app.description || '';
    }

    handleAppSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('appName').value.trim(),
            url: document.getElementById('appUrl').value.trim(),
            icon: document.getElementById('appIcon').value.trim(),
            category: document.getElementById('appCategory').value,
            description: document.getElementById('appDescription').value.trim()
        };

        if (this.editingAppId) {
            this.updateApp(this.editingAppId, formData);
        } else {
            this.addApp(formData);
        }
    }

    // Configuración
    openSettingsModal() {
        document.getElementById('settingsModal').classList.add('show');
        this.loadSettingsToForm();
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    loadSettingsToForm() {
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('gridSize').value = this.settings.gridSize;
    }

    updateTheme(theme) {
        this.settings.theme = theme;
        this.saveSettings();
        this.applySettings();
    }

    updateGridSize(size) {
        this.settings.gridSize = size;
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        // Aplicar tema
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Aplicar tamaño de cuadrícula
        const appsGrid = document.getElementById('appsGrid');
        appsGrid.className = `apps-grid grid-${this.settings.gridSize}`;
    }

    // Utilidades
    openApp(appId) {
        const app = this.apps.find(app => app.id === appId);
        if (app) {
            window.open(app.url, '_blank');
        }
    }

    updateCategoryButtons() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${this.currentCategory}"]`).classList.add('active');
    }

    showEmptyStateIfNeeded() {
        if (this.apps.length === 0) {
            this.renderApps();
        }
    }

    // Notificaciones
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Persistencia de datos
    saveApps() {
        localStorage.setItem('appPanel_apps', JSON.stringify(this.apps));
    }

    loadApps() {
        const saved = localStorage.getItem('appPanel_apps');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Aplicaciones por defecto
        return [
            {
                id: '1',
                name: 'Google',
                url: 'https://www.google.com',
                icon: 'fab fa-google',
                category: 'tools',
                description: 'Motor de búsqueda',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'YouTube',
                url: 'https://www.youtube.com',
                icon: 'fab fa-youtube',
                category: 'entertainment',
                description: 'Plataforma de videos',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'GitHub',
                url: 'https://github.com',
                icon: 'fab fa-github',
                category: 'productivity',
                description: 'Plataforma de desarrollo',
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                name: 'LinkedIn',
                url: 'https://www.linkedin.com',
                icon: 'fab fa-linkedin',
                category: 'social',
                description: 'Red social profesional',
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveSettings() {
        localStorage.setItem('appPanel_settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('appPanel_settings');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            theme: 'light',
            gridSize: 'medium'
        };
    }

    // Exportar/Importar datos
    exportData() {
        const data = {
            apps: this.apps,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-panel-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Datos exportados exitosamente', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.apps) {
                            this.apps = data.apps;
                            this.saveApps();
                        }
                        if (data.settings) {
                            this.settings = data.settings;
                            this.saveSettings();
                        }
                        this.renderApps();
                        this.applySettings();
                        this.showNotification('Datos importados exitosamente', 'success');
                    } catch (error) {
                        this.showNotification('Error al importar datos', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    clearData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('appPanel_apps');
            localStorage.removeItem('appPanel_settings');
            this.apps = [];
            this.settings = this.getDefaultSettings();
            this.renderApps();
            this.applySettings();
            this.showNotification('Todos los datos han sido eliminados', 'success');
        }
    }

    // Funcionalidades PWA
    initPWA() {
        // Detectar si la app está instalada
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('App puede ser instalada');
            this.showInstallPrompt(e);
        });

        // Detectar cuando la app se instala
        window.addEventListener('appinstalled', (evt) => {
            console.log('App instalada exitosamente');
            this.showNotification('¡Aplicación instalada exitosamente!', 'success');
        });

        // Detectar cambios en la conectividad
        window.addEventListener('online', () => {
            this.showNotification('Conexión restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Sin conexión - Modo offline activado', 'warning');
        });

        // Detectar cambios en el tema del sistema
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                if (this.settings.theme === 'auto') {
                    this.updateTheme('auto');
                }
            });
        }

        // Mejoras para móviles
        this.initMobileFeatures();
    }

    showInstallPrompt(e) {
        // Guardar el evento para usarlo más tarde
        this.deferredPrompt = e;
        
        // Mostrar un banner de instalación personalizado
        this.showInstallBanner();
    }

    showInstallBanner() {
        // Crear banner de instalación si no existe
        if (!document.getElementById('installBanner')) {
            const banner = document.createElement('div');
            banner.id = 'installBanner';
            banner.className = 'install-banner';
            banner.innerHTML = `
                <div class="install-banner-content">
                    <i class="fas fa-download"></i>
                    <span>Instala esta aplicación para un acceso más rápido</span>
                    <button class="btn btn-primary btn-sm" onclick="appPanel.installApp()">
                        Instalar
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="appPanel.dismissInstallBanner()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            document.body.appendChild(banner);
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
            this.deferredPrompt = null;
            this.dismissInstallBanner();
        }
    }

    dismissInstallBanner() {
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.remove();
        }
    }

    initMobileFeatures() {
        // Prevenir zoom en inputs en móviles
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            });
        });

        // Mejorar la experiencia táctil
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        });

        // Agregar soporte para gestos de navegación
        this.initSwipeNavigation();
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe hacia arriba
                this.handleSwipeUp();
            } else {
                // Swipe hacia abajo
                this.handleSwipeDown();
            }
        }
    }

    handleSwipeUp() {
        // Implementar funcionalidad de swipe hacia arriba
        console.log('Swipe hacia arriba detectado');
    }

    handleSwipeDown() {
        // Implementar funcionalidad de swipe hacia abajo
        console.log('Swipe hacia abajo detectado');
    }

    initSwipeNavigation() {
        // Navegación por gestos entre categorías
        let startX = 0;
        let currentX = 0;

        const categoriesContainer = document.querySelector('.categories-container');
        if (categoriesContainer) {
            categoriesContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            categoriesContainer.addEventListener('touchmove', (e) => {
                currentX = e.touches[0].clientX;
            });

            categoriesContainer.addEventListener('touchend', () => {
                const diff = startX - currentX;
                const threshold = 50;

                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        // Swipe izquierda - siguiente categoría
                        this.navigateToNextCategory();
                    } else {
                        // Swipe derecha - categoría anterior
                        this.navigateToPreviousCategory();
                    }
                }
            });
        }
    }

    navigateToNextCategory() {
        const categories = ['all', 'productivity', 'social', 'entertainment', 'tools'];
        const currentIndex = categories.indexOf(this.currentCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        this.currentCategory = categories[nextIndex];
        this.updateCategoryButtons();
        this.renderApps();
    }

    navigateToPreviousCategory() {
        const categories = ['all', 'productivity', 'social', 'entertainment', 'tools'];
        const currentIndex = categories.indexOf(this.currentCategory);
        const prevIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
        this.currentCategory = categories[prevIndex];
        this.updateCategoryButtons();
        this.renderApps();
    }

    // Mejoras de rendimiento
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Optimizar búsqueda con debounce
    setupOptimizedSearch() {
        const searchInput = document.getElementById('searchInput');
        const debouncedSearch = this.debounce((value) => {
            this.searchTerm = value.toLowerCase();
            this.renderApps();
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    // Mejorar la experiencia de carga
    showLoadingState() {
        const appsGrid = document.getElementById('appsGrid');
        appsGrid.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando aplicaciones...</p>
            </div>
        `;
    }

    // Inicializar todas las funcionalidades
    init() {
        this.setupEventListeners();
        this.setupOptimizedSearch();
        this.initPWA();
        this.renderApps();
        this.applySettings();
        this.showEmptyStateIfNeeded();
    }
}

// Estilos para notificaciones
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1rem 1.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        max-width: 300px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid var(--success-color);
    }
    
    .notification-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .notification i {
        font-size: 1.25rem;
    }
    
    .notification-success i {
        color: var(--success-color);
    }
    
    .notification-error i {
        color: var(--danger-color);
    }
`;

// Agregar estilos de notificación al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Inicializar la aplicación
let appPanel;
document.addEventListener('DOMContentLoaded', () => {
    appPanel = new AppPanel();
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registrado exitosamente:', registration);
            })
            .catch((error) => {
                console.log('Error al registrar Service Worker:', error);
            });
    });
}

// Hacer disponible globalmente para los onclick
window.appPanel = appPanel; 