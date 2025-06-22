# Panel de Aplicaciones - PWA

Una aplicación web progresiva (PWA) para organizar y acceder rápidamente a tus aplicaciones favoritas desde cualquier dispositivo.

## 🚀 Características

- **Diseño Responsive**: Se adapta perfectamente a PC, tablet y móvil
- **PWA Instalable**: Se puede instalar en Android como una aplicación nativa
- **Temas**: Modo claro, oscuro y automático
- **Categorías**: Organiza tus apps por categorías
- **Búsqueda**: Encuentra rápidamente tus aplicaciones
- **Almacenamiento Local**: Tus datos se guardan en tu dispositivo
- **Offline**: Funciona sin conexión a internet
- **Instalación Fácil**: Un solo clic para instalar en Android

## 📱 Instalación en Android

### Método 1: Desde Chrome (Recomendado)

1. Abre la aplicación en **Google Chrome** en tu dispositivo Android
2. Toca el menú de Chrome (tres puntos) en la esquina superior derecha
3. Selecciona **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**
4. Confirma la instalación
5. ¡Listo! La app aparecerá en tu pantalla de inicio

### Método 2: Desde el Navegador

1. Abre cualquier navegador en tu Android
2. Navega a la URL de la aplicación
3. Busca el botón **"Instalar"** o **"Añadir a pantalla de inicio"**
4. Sigue las instrucciones del navegador

### Método 3: Desde el Menú del Navegador

1. Abre la aplicación en tu navegador
2. Toca el menú del navegador
3. Busca la opción **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**
4. Confirma la instalación

## 🖥️ Uso en PC

1. Abre la aplicación en tu navegador
2. Usa el botón **"Agregar App"** para añadir nuevas aplicaciones
3. Organiza tus apps por categorías
4. Usa la barra de búsqueda para encontrar apps rápidamente
5. Personaliza el tema y tamaño de cuadrícula en Configuración

## ⚙️ Configuración

### Temas Disponibles
- **Claro**: Tema claro por defecto
- **Oscuro**: Tema oscuro para uso nocturno
- **Automático**: Se adapta al tema del sistema

### Tamaños de Cuadrícula
- **Pequeño**: Más apps visibles
- **Mediano**: Tamaño equilibrado
- **Grande**: Apps más grandes y fáciles de tocar

## 📊 Gestión de Datos

### Exportar Datos
- Guarda una copia de tus aplicaciones en formato JSON
- Útil para hacer respaldos

### Importar Datos
- Restaura tus aplicaciones desde un archivo JSON
- Perfecto para migrar entre dispositivos

### Limpiar Datos
- Elimina todas las aplicaciones guardadas
- Útil para empezar desde cero

## 🎨 Personalización

### Agregar Aplicaciones
1. Toca **"Agregar App"**
2. Completa los campos:
   - **Nombre**: Nombre de la aplicación
   - **URL**: Enlace a la aplicación web
   - **Icono**: Clase de FontAwesome (ej: `fas fa-chrome`)
   - **Categoría**: Organiza por tipo
   - **Descripción**: Información adicional (opcional)

### Categorías Disponibles
- **Productividad**: Herramientas de trabajo
- **Social**: Redes sociales y comunicación
- **Entretenimiento**: Juegos y multimedia
- **Herramientas**: Utilidades y configuraciones

## 🔧 Requisitos Técnicos

### Navegadores Soportados
- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+

### Dispositivos Soportados
- Android 5.0+
- iOS 11.3+
- Windows 10+
- macOS 10.13+
- Linux (navegadores modernos)

## 📁 Estructura del Proyecto

```
panel-de-aplicaciones/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── manifest.json       # Configuración PWA
├── sw.js              # Service Worker
├── admin-panel.png    # Icono de la aplicación
└── README.md          # Este archivo
```

## 🚀 Despliegue

### Servidor Local
1. Clona o descarga el proyecto
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx serve .
   
   # Con PHP
   php -S localhost:8000
   ```
4. Abre `http://localhost:8000` en tu navegador

### Servidor Web
1. Sube todos los archivos a tu servidor web
2. Asegúrate de que el servidor soporte HTTPS (requerido para PWA)
3. La aplicación estará disponible en tu dominio

## 🔒 Seguridad

- Los datos se almacenan localmente en tu dispositivo
- No se envían datos a servidores externos
- HTTPS requerido para funcionalidades PWA
- Permisos mínimos necesarios

## 🐛 Solución de Problemas

### La app no se instala
- Asegúrate de usar HTTPS
- Verifica que el navegador soporte PWA
- Intenta desde Chrome en Android

### No funciona offline
- Verifica que el Service Worker esté registrado
- Limpia la caché del navegador
- Recarga la página

### Los datos no se guardan
- Verifica que el almacenamiento local esté habilitado
- Comprueba que no estés en modo incógnito
- Revisa la consola del navegador para errores

## 📞 Soporte

Si tienes problemas o sugerencias:
1. Revisa la consola del navegador para errores
2. Verifica que tu navegador esté actualizado
3. Intenta en un navegador diferente

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**¡Disfruta organizando tus aplicaciones favoritas!** 🎉 