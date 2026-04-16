/**
 * ARCHIVO CENTRALIZADO DE EDICIONES - HAGO Noticias
 * 
 * Este archivo contiene todas las ediciones del periódico en un solo lugar.
 * Para agregar una nueva edición, simplemente agrega un nuevo objeto al array EDICIONES.
 * 
 * IMPORTANTE: Este es el único archivo que debes editar para agregar nuevas ediciones.
 */

// Array centralizado con todas las ediciones
const EDICIONES = [
    {
        id: 1,
        numero: 1,
        titulo: "Edición # 1",
        autor: "Día de la democracia, Madres, Maestro, Talentos Abadistas",
        categoria: "#1",
        anio: 2024,
        descripcion: "Primera edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1djewK_gQm5d9-bQzXA1W-xYLEuctmjfX&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1djewK_gQm5d9-bQzXA1W-xYLEuctmjfX&sz=w500-h400",
        pdfUrl: "pdf/EDICION1.pdf",
        uploadDate: "2024-01-15",
        size: "2.5 MB",
        tags: ["democracia", "madres", "maestro", "talentos"],
        featured: true,
        views: 450,
        downloads: 180,
        comingSoon: false
    },
    {
        id: 2,
        numero: 2,
        titulo: "Edición # 2",
        autor: "Día de la Antioqueñidad",
        categoria: "#2",
        anio: 2024,
        descripcion: "Segunda edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1AkZ9JBY8Hgavcj3KJVtzWd5gsScmft_b&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1AkZ9JBY8Hgavcj3KJVtzWd5gsScmft_b&sz=w500-h400",
        pdfUrl: "pdf/EDICION2.pdf",
        uploadDate: "2024-03-20",
        size: "3.1 MB",
        tags: ["antioqueñidad", "cultura", "tradición", "periodico"],
        featured: false,
        views: 380,
        downloads: 150,
        comingSoon: false
    },
    {
        id: 3,
        numero: 3,
        titulo: "Edición # 3",
        autor: "Semana Abadista - Foro - Museo Escolar",
        categoria: "#3",
        anio: 2024,
        descripcion: "Tercera edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1xWfZ7J-7k1fFps5UG9Dkz3k8S2yaW_Hu&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1xWfZ7J-7k1fFps5UG9Dkz3k8S2yaW_Hu&sz=w500-h400",
        pdfUrl: "pdf/EDICION3.pdf",
        uploadDate: "2024-06-10",
        size: "2.8 MB",
        tags: ["semana abadista", "foro", "museo", "escolar"],
        featured: false,
        views: 320,
        downloads: 125,
        comingSoon: false
    },
    {
        id: 4,
        numero: 4,
        titulo: "Edición # 4",
        autor: "La institución de la Inclusión, Gobierno Escolar 2025",
        categoria: "#4",
        anio: 2025,
        descripcion: "Cuarta edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1D818JI97Qk-jfqmCktdSXF-84XfyJ1OD&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1D818JI97Qk-jfqmCktdSXF-84XfyJ1OD&sz=w500-h400",
        pdfUrl: "pdf/EDICION4.pdf",
        uploadDate: "2025-01-15",
        size: "3.5 MB",
        tags: ["inclusión", "gobierno escolar", "2025"],
        featured: true,
        views: 312,
        downloads: 123,
        comingSoon: false
    },
    {
        id: 5,
        numero: 5,
        titulo: "Edición # 5",
        autor: "Celebramos el corazón que educa y la dedicación que sostiene, ¡Los profes tuvieron su doble por un día!, Murales que hablan historias que inspiran, Voces que Construyen Colegio, Después de un merecido descanso ¡Regresamos con Energía y Nuevos Retos!, Cuando la Cultura Nos Une: Así Vivimos la Feria de la Antioqueñidad 2025",
        categoria: "#5",
        anio: 2025,
        descripcion: "Quinta edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=15emMmadoHN3SOx-U9xOn8oUw38u0v1vu&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=15emMmadoHN3SOx-U9xOn8oUw38u0v1vu&sz=w500-h400",
        pdfUrl: "pdf/EDICION5.pdf",
        uploadDate: "2025-01-15",
        size: "3.5 MB",
        tags: ["corazón que educa", "profes", "murales", "voces que construyen", "regreso con energía", "feria de la antioqueñidad", "2025"],
        featured: true,
        views: 0,
        downloads: 0,
        comingSoon: false
    },
    {
        id: 6,
        numero: 6,
        titulo: "Edición # 6",
        autor: "La Institución de la Inclusión, Gobierno Escolar 2026, Mujeres que inspiran, Proyectos pedagógicos que transforman, Inteligencia Artificial en el aula, Cultura de participación ética.",
        categoria: "#6",
        anio: 2026,
        descripcion: "Sexta edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1ZyDq2gXX7bEUZqxpNzQA6EnNyXFJX-hS&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1ZyDq2gXX7bEUZqxpNzQA6EnNyXFJX-hS&sz=w500-h400",
        pdfUrl: "pdf/EDICION6.pdf",
        uploadDate: "2026-04-15",
        size: "3.5 MB",
        tags: ["inclusión", "gobierno escolar 2026", "mujeres que inspiran", "proyectos", "inteligencia artificial", "ética", "2026"],
        featured: true,
        views: 0,
        downloads: 0,
        comingSoon: false
    },
    {
        id: 7,
        numero: 7,
        titulo: "Edición # 7",
        autor: "Nueva Edición",
        categoria: "#7",
        anio: 2026,
        descripcion: "Séptima edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w500-h400",
        pdfUrl: "https://drive.google.com/file/d/1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-/view?usp=sharing",
        uploadDate: "2026-04-15",
        size: "Link Externo",
        tags: ["2026"],
        featured: false,
        views: 0,
        downloads: 0,
        comingSoon: false
    },
    {
        id: 8,
        numero: 8,
        titulo: "Edición # 8",
        autor: "Nueva Edición",
        categoria: "#8",
        anio: 2026,
        descripcion: "Octava edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w500-h400",
        pdfUrl: "https://drive.google.com/file/d/1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-/view?usp=sharing",
        uploadDate: "2026-04-15",
        size: "Link Externo",
        tags: ["2026"],
        featured: false,
        views: 0,
        downloads: 0,
        comingSoon: false
    },
    {
        id: 9,
        numero: 9,
        titulo: "Edición # 9",
        autor: "Nueva Edición",
        categoria: "#9",
        anio: 2026,
        descripcion: "Novena edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w500-h400",
        pdfUrl: "https://drive.google.com/file/d/1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-/view?usp=sharing",
        uploadDate: "2026-04-15",
        size: "Link Externo",
        tags: ["2026"],
        featured: false,
        views: 0,
        downloads: 0,
        comingSoon: false
    },
    {
        id: 10,
        numero: 10,
        titulo: "Edición # 10",
        autor: "Nueva Edición",
        categoria: "#10",
        anio: 2026,
        descripcion: "Décima edición del periódico institucional",
        thumbnail: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w320-h240",
        thumbnailLarge: "https://drive.google.com/thumbnail?id=1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-&sz=w500-h400",
        pdfUrl: "https://drive.google.com/file/d/1XX2ffXU4iuamI8d-hkOK9uuJ4qjk7kG-/view?usp=sharing",
        uploadDate: "2026-04-15",
        size: "Link Externo",
        tags: ["2026"],
        featured: false,
        views: 0,
        downloads: 0,
        comingSoon: false
    }
];

/**
 * Funciones de conversión para adaptar los datos a diferentes formatos
 */

// Convertir a formato para hagonoticias.js (books)
function getEdicionesAsBooks() {
    return EDICIONES.map(ed => ({
        title: ed.titulo,
        author: ed.autor,
        category: ed.categoria,
        year: ed.anio,
        thumbnail: ed.thumbnail,
        pdfUrl: ed.pdfUrl
    }));
}

// Convertir a formato para modern-edition-viewer.js
function getEdicionesAsModernBooks() {
    return EDICIONES.map(ed => ({
        id: ed.id,
        title: ed.titulo.replace('# ', '#'),
        description: `Temas: ${ed.autor}`,
        category: ed.categoria,
        year: `Año ${ed.anio}`,
        thumbnail: ed.thumbnailLarge || ed.thumbnail,
        pdfUrl: ed.pdfUrl,
        tags: ed.tags || [],
        featured: ed.featured || false,
        comingSoon: ed.comingSoon || false
    }));
}

// Convertir a formato para dashboard.js (pdfData)
function getEdicionesAsPdfData() {
    return EDICIONES.map(ed => ({
        id: ed.id,
        title: ed.titulo,
        author: ed.autor,
        category: ed.categoria,
        year: ed.anio,
        thumbnail: ed.thumbnail,
        pdfUrl: ed.pdfUrl,
        uploadDate: ed.uploadDate,
        size: ed.size
    }));
}

// Convertir a formato para enhanced-dashboard.js
function getEdicionesAsEnhancedPdfData() {
    return EDICIONES.map(ed => ({
        id: ed.id,
        title: ed.titulo,
        author: ed.autor,
        category: ed.categoria,
        year: ed.anio,
        thumbnail: ed.thumbnail,
        pdfUrl: ed.pdfUrl,
        uploadDate: ed.uploadDate,
        size: ed.size,
        views: ed.views || 0,
        downloads: ed.downloads || 0
    }));
}

// Convertir a formato para SQL (INSERT statements)
function getEdicionesAsSQL() {
    return EDICIONES.map(ed => 
        `('${ed.titulo}', '${ed.autor}', '${ed.categoria}', ${ed.anio}, '${ed.descripcion}', '${ed.pdfUrl}', '${ed.thumbnail}', ${ed.numero})`
    ).join(',\n');
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.EDICIONES = EDICIONES;
    window.getEdicionesAsBooks = getEdicionesAsBooks;
    window.getEdicionesAsModernBooks = getEdicionesAsModernBooks;
    window.getEdicionesAsPdfData = getEdicionesAsPdfData;
    window.getEdicionesAsEnhancedPdfData = getEdicionesAsEnhancedPdfData;
    window.getEdicionesAsSQL = getEdicionesAsSQL;
}
