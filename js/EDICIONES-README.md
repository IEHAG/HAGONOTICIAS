# 📚 Gestión Centralizada de Ediciones - HAGO Noticias

## 🎯 Propósito

Este sistema centraliza todas las ediciones del periódico en un **solo archivo** (`ediciones-data.js`) para facilitar la gestión y actualización de las ediciones.

## 📝 Cómo Agregar una Nueva Edición

### Paso 1: Abrir el archivo centralizado
Abre el archivo: **`js/ediciones-data.js`**

### Paso 2: Agregar la nueva edición
Agrega un nuevo objeto al array `EDICIONES` con el siguiente formato:

```javascript
{
    id: 6,                    // ID único (siguiente número disponible)
    numero: 6,                 // Número de edición
    titulo: "Edición # 6",     // Título de la edición
    autor: "Temas principales de la edición",  // Autor o temas
    categoria: "#6",           // Categoría (número de edición)
    anio: 2025,                // Año de publicación
    descripcion: "Descripción de la edición",  // Descripción breve
    thumbnail: "URL_de_la_miniatura",          // URL de la imagen pequeña
    thumbnailLarge: "URL_de_la_miniatura_grande", // URL de la imagen grande
    pdfUrl: "pdf/EDICION6.pdf", // Ruta al archivo PDF
    uploadDate: "2025-02-15",  // Fecha de subida (formato: YYYY-MM-DD)
    size: "3.2 MB",            // Tamaño del archivo PDF
    tags: ["tag1", "tag2"],    // Array de etiquetas
    featured: false,           // true si es destacada, false si no
    views: 0,                  // Número de visualizaciones
    downloads: 0               // Número de descargas
}
```

### Ejemplo completo:

```javascript
{
    id: 6,
    numero: 6,
    titulo: "Edición # 6",
    autor: "Día del Estudiante - Festival de Talentos",
    categoria: "#6",
    anio: 2025,
    descripcion: "Sexta edición del periódico institucional",
    thumbnail: "https://drive.google.com/thumbnail?id=XXXXX&sz=w320-h240",
    thumbnailLarge: "https://drive.google.com/thumbnail?id=XXXXX&sz=w500-h400",
    pdfUrl: "pdf/EDICION6.pdf",
    uploadDate: "2025-02-15",
    size: "3.2 MB",
    tags: ["estudiante", "talentos", "festival"],
    featured: true,
    views: 0,
    downloads: 0
}
```

### Paso 3: Guardar el archivo
¡Listo! La nueva edición aparecerá automáticamente en:
- ✅ Página principal (index.html)
- ✅ Visor moderno de ediciones
- ✅ Dashboard administrativo
- ✅ Todos los componentes que muestran ediciones

## 🔄 Archivos que usan las ediciones

Las ediciones se cargan automáticamente en:
1. **js/hagonoticias.js** - Visor principal de ediciones
2. **js/modern-edition-viewer.js** - Visor moderno responsive
3. **admin/dashboard.js** - Dashboard administrativo básico
4. **admin/enhanced-dashboard.js** - Dashboard mejorado

## ⚠️ Importante

- **NO edites** los archivos individuales (hagonoticias.js, modern-edition-viewer.js, etc.)
- **Solo edita** `ediciones-data.js` para agregar o modificar ediciones
- El archivo `ediciones-data.js` debe cargarse **antes** de los otros scripts en los archivos HTML

## 📋 Estructura de Datos

Cada edición contiene:
- **id**: Identificador único numérico
- **numero**: Número de la edición
- **titulo**: Título completo de la edición
- **autor**: Autor o temas principales
- **categoria**: Categoría (número de edición con #)
- **anio**: Año de publicación
- **descripcion**: Descripción breve
- **thumbnail**: URL de imagen pequeña (320x240)
- **thumbnailLarge**: URL de imagen grande (500x400)
- **pdfUrl**: Ruta al archivo PDF
- **uploadDate**: Fecha de subida
- **size**: Tamaño del archivo
- **tags**: Array de etiquetas para búsqueda
- **featured**: Si es destacada o no
- **views**: Contador de visualizaciones
- **downloads**: Contador de descargas

## 🛠️ Funciones de Conversión

El archivo incluye funciones que convierten los datos al formato necesario para cada componente:
- `getEdicionesAsBooks()` - Para hagonoticias.js
- `getEdicionesAsModernBooks()` - Para modern-edition-viewer.js
- `getEdicionesAsPdfData()` - Para dashboard.js
- `getEdicionesAsEnhancedPdfData()` - Para enhanced-dashboard.js
- `getEdicionesAsSQL()` - Para generar INSERTs SQL

## 💡 Consejos

1. **Mantén el orden**: Agrega las ediciones en orden cronológico
2. **IDs únicos**: Asegúrate de que cada edición tenga un ID único
3. **URLs válidas**: Verifica que las URLs de thumbnails y PDFs sean correctas
4. **Fechas consistentes**: Usa el formato YYYY-MM-DD para las fechas
5. **Tamaños reales**: Actualiza el tamaño del archivo cuando subas un nuevo PDF

## 🐛 Solución de Problemas

Si una edición no aparece:
1. Verifica que el archivo `ediciones-data.js` se cargue antes de los otros scripts
2. Revisa la consola del navegador para errores de JavaScript
3. Asegúrate de que el formato del objeto sea correcto (comas, llaves, etc.)
4. Verifica que el ID sea único y no esté duplicado

---

**Última actualización**: Enero 2025
**Mantenido por**: Equipo HAGO Noticias

