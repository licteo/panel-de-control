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
        // Aplicaciones por defecto (sin duplicados)
        return [
            // Google y utilidades principales
            { id: '1', name: 'Google', url: 'https://www.google.com', icon: 'fab fa-google', category: 'tools', description: 'Motor de búsqueda', createdAt: new Date().toISOString() },
            { id: '2', name: 'YouTube', url: 'https://www.youtube.com', icon: 'fab fa-youtube', category: 'entertainment', description: 'Plataforma de videos', createdAt: new Date().toISOString() },
            { id: '3', name: 'Gmail', url: 'https://mail.google.com/', icon: 'fas fa-envelope', category: 'productivity', description: 'Correo electrónico de Google', createdAt: new Date().toISOString() },
            { id: '4', name: 'Google Drive', url: 'https://drive.google.com/drive/my-drive', icon: 'fab fa-google-drive', category: 'productivity', description: 'Tu almacenamiento en la nube', createdAt: new Date().toISOString() },
            { id: '5', name: 'Google Calendar', url: 'https://calendar.google.com/calendar', icon: 'fas fa-calendar-alt', category: 'productivity', description: 'Calendario de Google', createdAt: new Date().toISOString() },
            { id: '6', name: 'Google Maps', url: 'https://maps.google.com/', icon: 'fas fa-map-marked-alt', category: 'tools', description: 'Mapas de Google', createdAt: new Date().toISOString() },
            { id: '7', name: 'Google Photos', url: 'https://photos.google.com/', icon: 'fas fa-camera-retro', category: 'productivity', description: 'Tus fotos en la nube', createdAt: new Date().toISOString() },
            { id: '8', name: 'Google News', url: 'https://news.google.com/', icon: 'fas fa-newspaper', category: 'productivity', description: 'Noticias de Google', createdAt: new Date().toISOString() },
            { id: '9', name: 'Google Meet', url: 'https://meet.google.com/', icon: 'fas fa-video', category: 'productivity', description: 'Videollamadas de Google', createdAt: new Date().toISOString() },
            { id: '10', name: 'Google Translate', url: 'https://translate.google.com/', icon: 'fas fa-language', category: 'tools', description: 'Traductor de Google', createdAt: new Date().toISOString() },
            { id: '11', name: 'Google Sheets', url: 'https://docs.google.com/spreadsheets/', icon: 'fas fa-table', category: 'productivity', description: 'Hojas de cálculo', createdAt: new Date().toISOString() },
            { id: '12', name: 'Google Docs', url: 'https://docs.google.com/document/', icon: 'fas fa-file-alt', category: 'productivity', description: 'Documentos de Google', createdAt: new Date().toISOString() },
            { id: '13', name: 'Google Slides', url: 'https://docs.google.com/presentation/', icon: 'fas fa-chalkboard', category: 'productivity', description: 'Presentaciones de Google', createdAt: new Date().toISOString() },
            { id: '14', name: 'Google One', url: 'https://one.google.com/', icon: 'fas fa-cloud', category: 'tools', description: 'Almacenamiento y servicios Google', createdAt: new Date().toISOString() },
            { id: '15', name: 'Google Finance', url: 'https://www.google.com/finance', icon: 'fas fa-chart-line', category: 'tools', description: 'Finanzas y bolsa', createdAt: new Date().toISOString() },
            { id: '16', name: 'Google Play', url: 'https://play.google.com/', icon: 'fab fa-google-play', category: 'entertainment', description: 'Tienda de apps y juegos', createdAt: new Date().toISOString() },
            { id: '17', name: 'Google Keep', url: 'https://keep.google.com/', icon: 'fas fa-sticky-note', category: 'productivity', description: 'Notas rápidas', createdAt: new Date().toISOString() },
            { id: '18', name: 'Google My Ad Center', url: 'https://myadcenter.google.com/', icon: 'fas fa-bullhorn', category: 'tools', description: 'Centro de anuncios', createdAt: new Date().toISOString() },
            { id: '19', name: 'Google Classroom', url: 'https://classroom.google.com/', icon: 'fas fa-chalkboard-teacher', category: 'productivity', description: 'Aula virtual', createdAt: new Date().toISOString() },
            { id: '20', name: 'Google Earth', url: 'https://earth.google.com/web/', icon: 'fas fa-globe-americas', category: 'tools', description: 'Explora el mundo', createdAt: new Date().toISOString() },
            { id: '21', name: 'Google Arts & Culture', url: 'https://artsandculture.google.com/', icon: 'fas fa-palette', category: 'entertainment', description: 'Arte y cultura', createdAt: new Date().toISOString() },
            { id: '22', name: 'Google Ads', url: 'https://ads.google.com/ups/routing', icon: 'fas fa-ad', category: 'tools', description: 'Publicidad de Google', createdAt: new Date().toISOString() },
            { id: '23', name: 'Google Forms', url: 'https://docs.google.com/forms/', icon: 'fas fa-poll', category: 'productivity', description: 'Formularios de Google', createdAt: new Date().toISOString() },
            { id: '24', name: 'Chrome Web Store', url: 'https://chrome.google.com/webstore', icon: 'fab fa-chrome', category: 'tools', description: 'Extensiones para Chrome', createdAt: new Date().toISOString() },
            { id: '25', name: 'Google Passwords', url: 'https://passwords.google.com/', icon: 'fas fa-key', category: 'tools', description: 'Gestor de contraseñas', createdAt: new Date().toISOString() },
            { id: '26', name: 'Google Analytics', url: 'https://analytics.google.com/analytics/web', icon: 'fas fa-chart-bar', category: 'tools', description: 'Estadísticas web', createdAt: new Date().toISOString() },
            { id: '27', name: 'Blogger', url: 'https://www.blogger.com/', icon: 'fab fa-blogger', category: 'productivity', description: 'Crea tu blog', createdAt: new Date().toISOString() },
            { id: '28', name: 'Google Wallet', url: 'https://wallet.google.com/', icon: 'fas fa-wallet', category: 'tools', description: 'Pagos y billetera', createdAt: new Date().toISOString() },
            { id: '29', name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: 'fas fa-book', category: 'productivity', description: 'Notas inteligentes de Google', createdAt: new Date().toISOString() },
            { id: '30', name: 'Google Colab', url: 'https://colab.research.google.com/', icon: 'fas fa-flask', category: 'tools', description: 'Python en la nube', createdAt: new Date().toISOString() },
            { id: '31', name: 'Gemini', url: 'https://gemini.google.com/app?hl=es', icon: 'fas fa-gem', category: 'tools', description: 'IA de Google', createdAt: new Date().toISOString() },
            // APIs y herramientas externas
            { id: '32', name: 'API Audacity', url: 'https://apis.google.com/additnow/l?applicationid=112820967478&__ls=ogb&__lu=https%3A%2F%2Fwww.offidocs.com%2Fmedia%2Fsystem%2Faudacitygdrive%2Fgoogle-api-php-client%2Fcore%2Faudacitydownload.php', icon: 'fas fa-microphone', category: 'tools', description: 'API Audacity Google', createdAt: new Date().toISOString() },
            { id: '33', name: 'API GIMP', url: 'https://apis.google.com/additnow/l?applicationid=650527036983&__ls=ogb&__lu=https%3A%2F%2Fwww.offidocs.com%2Fmedia%2Fsystem%2Fgimpgdrive%2Fgoogle-api-php-client%2Fcore%2Fgimpbase.php', icon: 'fas fa-image', category: 'tools', description: 'API GIMP Google', createdAt: new Date().toISOString() },
            { id: '34', name: 'API Movie Studio', url: 'https://apis.google.com/additnow/l?applicationid=785803880206&__ls=ogb&__lu=https%3A%2F%2Fwww.redcoolmedia.net%2Fmedia%2Fsystem%2Fmoviestudiogdrive%2Fgoogle-api-php-client%2Fcore%2Fmoviestudiodownload.php', icon: 'fas fa-film', category: 'tools', description: 'API Movie Studio Google', createdAt: new Date().toISOString() },
            { id: '35', name: 'API Python', url: 'https://apis.google.com/additnow/l?applicationid=807307805212&__ls=ogb&__lu=https%3A%2F%2Fthumbsdb.herokuapp.com%2Fpython%2F', icon: 'fab fa-python', category: 'tools', description: 'API Python Google', createdAt: new Date().toISOString() },
            { id: '36', name: 'API TTS', url: 'https://apis.google.com/additnow/l?applicationid=159159627607&__ls=ogb&__lu=http%3A%2F%2Ftts.softgateon.net%2F', icon: 'fas fa-volume-up', category: 'tools', description: 'API Text-to-Speech Google', createdAt: new Date().toISOString() },
            // Herramientas de desarrollo
            { id: '37', name: 'Replit', url: 'https://replit.com/', icon: 'fas fa-terminal', category: 'tools', description: 'IDE online', createdAt: new Date().toISOString() },
            { id: '38', name: 'CodePen', url: 'https://codepen.io/', icon: 'fas fa-code', category: 'tools', description: 'Editor de código online', createdAt: new Date().toISOString() },
            { id: '39', name: 'WebSim', url: 'https://websim.com/', icon: 'fas fa-microchip', category: 'tools', description: 'Simulador web', createdAt: new Date().toISOString() },
            // Juegos y entretenimiento
            { id: '40', name: 'PlayHop 3D', url: 'https://playhop.com/es/tag/3d_44', icon: 'fas fa-cube', category: 'entertainment', description: 'Colección de juegos 3D', createdAt: new Date().toISOString() },
            { id: '41', name: 'PacoGames 3D', url: 'https://www.pacogames.com/juegos-3d', icon: 'fas fa-gamepad', category: 'entertainment', description: 'Juegos 3D gratis online', createdAt: new Date().toISOString() },
            { id: '42', name: 'Poki 3D', url: 'https://poki.com/es/3d', icon: 'fas fa-cube', category: 'entertainment', description: 'Juegos 3D en Poki', createdAt: new Date().toISOString() },
            { id: '43', name: 'CrazyGames 3D', url: 'https://www.crazygames.com/es/e/3d', icon: 'fas fa-cube', category: 'entertainment', description: 'Juegos 3D en CrazyGames', createdAt: new Date().toISOString() },
            { id: '44', name: 'Long Haul Trucking Simulator', url: 'https://www.minijuegos.com/juego/long-haul-trucking-simulator', icon: 'fas fa-truck', category: 'entertainment', description: 'Simulador de camiones', createdAt: new Date().toISOString() },
            { id: '45', name: 'Official GamezFull', url: 'https://official-gamezfull.pages.dev/', icon: 'fas fa-gamepad', category: 'entertainment', description: 'Descarga juegos', createdAt: new Date().toISOString() },
            { id: '46', name: 'GamesFull', url: 'https://gamesfull.app/categorias/requisitos/bajos', icon: 'fas fa-gamepad', category: 'entertainment', description: 'Juegos para PC de bajos requisitos', createdAt: new Date().toISOString() },
            { id: '47', name: 'BlizzBoyGames', url: 'https://www.blizzboygames.net/', icon: 'fas fa-gamepad', category: 'entertainment', description: 'Descarga juegos gratis', createdAt: new Date().toISOString() },
            // TV, radio y entretenimiento
            { id: '48', name: 'Radio JFK Ibiza', url: 'https://www.radio.es/s/jfkibiza', icon: 'fas fa-broadcast-tower', category: 'entertainment', description: 'Radio online', createdAt: new Date().toISOString() },
            { id: '49', name: 'EnPantallas', url: 'https://enpantallas.com/7jbh13hmw513', icon: 'fas fa-tv', category: 'entertainment', description: 'TV y entretenimiento', createdAt: new Date().toISOString() },
            { id: '50', name: 'TeleGratisHD', url: 'https://links.giveawayoftheday.com/telegratishd.com/', icon: 'fas fa-tv', category: 'entertainment', description: 'TV gratis online', createdAt: new Date().toISOString() },
            { id: '51', name: 'TV Libre Online', url: 'https://tvlibreonline.org/', icon: 'fas fa-tv', category: 'entertainment', description: 'TV libre por internet', createdAt: new Date().toISOString() },
            { id: '52', name: 'TV Libre HD', url: 'https://www.tvlibrehd.com/', icon: 'fas fa-tv', category: 'entertainment', description: 'TV HD gratis', createdAt: new Date().toISOString() },
            { id: '53', name: 'Pluto TV', url: 'https://pluto.tv/latam/on-demand/series/65bd42b9b65b870013b0bd02/season/1', icon: 'fas fa-tv', category: 'entertainment', description: 'TV y series gratis', createdAt: new Date().toISOString() },
            { id: '54', name: 'CX TV en Vivo', url: 'https://www.cxtvenvivo.com/', icon: 'fas fa-tv', category: 'entertainment', description: 'TV en vivo', createdAt: new Date().toISOString() },
            { id: '55', name: 'Canela TV', url: 'https://canela.tv/', icon: 'fas fa-tv', category: 'entertainment', description: 'TV y películas gratis', createdAt: new Date().toISOString() },
            // Herramientas y utilidades varias
            { id: '56', name: 'W3Schools JS', url: 'https://www.w3schools.com/js/default.asp', icon: 'fas fa-code', category: 'tools', description: 'Aprende JavaScript', createdAt: new Date().toISOString() },
            { id: '57', name: 'ChatGPT', url: 'https://chatgpt.com/', icon: 'fas fa-robot', category: 'tools', description: 'Asistente de IA', createdAt: new Date().toISOString() },
            { id: '58', name: 'Replit', url: 'https://replit.com/', icon: 'fas fa-terminal', category: 'tools', description: 'IDE online', createdAt: new Date().toISOString() },
            { id: '59', name: 'CodePen', url: 'https://codepen.io/', icon: 'fas fa-code', category: 'tools', description: 'Editor de código online', createdAt: new Date().toISOString() },
            { id: '60', name: 'WebSim', url: 'https://websim.com/', icon: 'fas fa-microchip', category: 'tools', description: 'Simulador web', createdAt: new Date().toISOString() },
            // Apps personales
            { id: '61', name: 'Programas Mentales', url: 'https://licteo.github.io/programas-mentales/', icon: 'fas fa-brain', category: 'productivity', description: 'Herramientas mentales y de estudio', createdAt: new Date().toISOString() },
            { id: '62', name: 'Web Personal', url: 'https://licteo.github.io/Web-Personal-/', icon: 'fas fa-user', category: 'social', description: 'Sitio web personal', createdAt: new Date().toISOString() },
            { id: '63', name: 'Agenda', url: 'https://licteo.github.io/Agenda/', icon: 'fas fa-calendar-alt', category: 'productivity', description: 'Organiza tus eventos y tareas', createdAt: new Date().toISOString() },
            { id: '64', name: 'Lista de Tareas', url: 'https://licteo.github.io/lista-de-tareas-pwa/', icon: 'fas fa-tasks', category: 'productivity', description: 'Gestor de tareas PWA', createdAt: new Date().toISOString() },
            { id: '65', name: 'Juego 3D', url: 'https://licteo.github.io/juego-3D/', icon: 'fas fa-cube', category: 'entertainment', description: 'Juego interactivo en 3D', createdAt: new Date().toISOString() },
            { id: '66', name: 'Generador de Contraseñas', url: 'https://licteo.github.io/Generador-de-contrase-as/', icon: 'fas fa-key', category: 'tools', description: 'Crea contraseñas seguras', createdAt: new Date().toISOString() },
            { id: '67', name: 'Astrabazaar', url: 'https://licteo.github.io/astrabazaar/', icon: 'fas fa-star', category: 'entertainment', description: 'Explora el bazar de las estrellas', createdAt: new Date().toISOString() }
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