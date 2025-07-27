// Script adicional para integración con Supabase
// Este archivo proporciona funciones auxiliares para la integración con Supabase

// Función para verificar el estado de la conexión con Supabase
async function verificarConexionSupabase() {
    try {
        if (!supabase) {
            console.error('Supabase no está inicializado');
            return false;
        }

        // Intentar hacer una consulta simple para verificar la conexión
        const { data, error } = await supabase
            .from('ediciones')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Error al conectar con Supabase:', error);
            return false;
        }

        console.log('Conexión con Supabase exitosa');
        return true;
    } catch (error) {
        console.error('Error en verificarConexionSupabase:', error);
        return false;
    }
}

// Función para sincronizar datos locales con Supabase
async function sincronizarDatos() {
    try {
        if (!edicionesManager) {
            console.error('EdicionesManager no está inicializado');
            return false;
        }

        mostrarAlerta('Sincronizando datos con Supabase...', 'info');

        // Obtener ediciones de Supabase
        const edicionesSupabase = await edicionesManager.obtenerEdiciones();
        
        if (edicionesSupabase.length > 0) {
            // Actualizar datos locales si es necesario
            console.log(`Se encontraron ${edicionesSupabase.length} ediciones en Supabase`);
            mostrarAlerta('Datos sincronizados correctamente', 'success');
            return true;
        } else {
            console.log('No se encontraron ediciones en Supabase');
            mostrarAlerta('No hay datos para sincronizar', 'info');
            return true;
        }
    } catch (error) {
        console.error('Error en sincronizarDatos:', error);
        mostrarAlerta('Error al sincronizar datos', 'danger');
        return false;
    }
}

// Función para migrar datos locales a Supabase (si es necesario)
async function migrarDatosLocales() {
    try {
        if (!edicionesManager || !pdfData) {
            console.error('Datos locales o EdicionesManager no disponibles');
            return false;
        }

        mostrarAlerta('Iniciando migración de datos locales...', 'info');

        for (const pdf of pdfData) {
            const edicionData = {
                titulo: pdf.title,
                autor: pdf.author,
                categoria: pdf.category,
                anio: pdf.year,
                descripcion: pdf.author, // Usando author como descripción
                pdf_url: pdf.pdfUrl,
                thumbnail_url: pdf.thumbnail,
                fecha_publicacion: pdf.uploadDate,
                activo: true,
                orden_visualizacion: pdf.id
            };

            const resultado = await edicionesManager.crearEdicion(edicionData);
            
            if (resultado.success) {
                console.log(`Edición "${pdf.title}" migrada exitosamente`);
            } else {
                console.error(`Error al migrar "${pdf.title}":`, resultado.error);
            }
        }

        mostrarAlerta('Migración completada', 'success');
        return true;
    } catch (error) {
        console.error('Error en migrarDatosLocales:', error);
        mostrarAlerta('Error durante la migración', 'danger');
        return false;
    }
}

// Función para crear backup de datos
async function crearBackup() {
    try {
        if (!edicionesManager) {
            console.error('EdicionesManager no está inicializado');
            return false;
        }

        mostrarAlerta('Creando backup de datos...', 'info');

        const ediciones = await edicionesManager.obtenerEdiciones();
        const backup = {
            fecha: new Date().toISOString(),
            version: '1.0',
            ediciones: ediciones
        };

        // Crear archivo de backup
        const backupJson = JSON.stringify(backup, null, 2);
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Descargar backup
        const a = document.createElement('a');
        a.href = url;
        a.download = `hag-noticias-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarAlerta('Backup creado y descargado exitosamente', 'success');
        return true;
    } catch (error) {
        console.error('Error en crearBackup:', error);
        mostrarAlerta('Error al crear backup', 'danger');
        return false;
    }
}

// Función para restaurar desde backup
async function restaurarBackup(archivoBackup) {
    try {
        if (!edicionesManager) {
            console.error('EdicionesManager no está inicializado');
            return false;
        }

        mostrarAlerta('Restaurando desde backup...', 'info');

        const texto = await archivoBackup.text();
        const backup = JSON.parse(texto);

        if (!backup.ediciones || !Array.isArray(backup.ediciones)) {
            throw new Error('Formato de backup inválido');
        }

        for (const edicion of backup.ediciones) {
            const resultado = await edicionesManager.crearEdicion(edicion);
            
            if (resultado.success) {
                console.log(`Edición "${edicion.titulo}" restaurada exitosamente`);
            } else {
                console.error(`Error al restaurar "${edicion.titulo}":`, resultado.error);
            }
        }

        mostrarAlerta('Restauración completada', 'success');
        
        // Recargar la página para mostrar los datos restaurados
        setTimeout(() => {
            window.location.reload();
        }, 2000);

        return true;
    } catch (error) {
        console.error('Error en restaurarBackup:', error);
        mostrarAlerta('Error durante la restauración', 'danger');
        return false;
    }
}

// Función para validar integridad de datos
async function validarIntegridadDatos() {
    try {
        if (!edicionesManager) {
            console.error('EdicionesManager no está inicializado');
            return false;
        }

        mostrarAlerta('Validando integridad de datos...', 'info');

        const ediciones = await edicionesManager.obtenerEdiciones();
        let errores = [];

        for (const edicion of ediciones) {
            // Validar campos requeridos
            if (!edicion.titulo || !edicion.pdf_url) {
                errores.push(`Edición ID ${edicion.id}: Faltan campos requeridos`);
            }

            // Validar URLs
            if (edicion.pdf_url && !edicion.pdf_url.startsWith('http') && !edicion.pdf_url.startsWith('../')) {
                errores.push(`Edición ID ${edicion.id}: URL de PDF inválida`);
            }

            if (edicion.thumbnail_url && !edicion.thumbnail_url.startsWith('http') && !edicion.thumbnail_url.startsWith('../')) {
                errores.push(`Edición ID ${edicion.id}: URL de thumbnail inválida`);
            }
        }

        if (errores.length === 0) {
            mostrarAlerta('Integridad de datos validada correctamente', 'success');
            return true;
        } else {
            console.error('Errores de integridad encontrados:', errores);
            mostrarAlerta(`Se encontraron ${errores.length} errores de integridad`, 'warning');
            return false;
        }
    } catch (error) {
        console.error('Error en validarIntegridadDatos:', error);
        mostrarAlerta('Error al validar integridad de datos', 'danger');
        return false;
    }
}

// Exportar funciones para uso global
window.verificarConexionSupabase = verificarConexionSupabase;
window.sincronizarDatos = sincronizarDatos;
window.migrarDatosLocales = migrarDatosLocales;
window.crearBackup = crearBackup;
window.restaurarBackup = restaurarBackup;
window.validarIntegridadDatos = validarIntegridadDatos;

// Inicializar funciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Agregar event listeners para botones de utilidades si existen
    const refreshBtn = document.getElementById('refreshStats');
    const exportBtn = document.getElementById('exportData');
    const backupBtn = document.getElementById('backupData');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', sincronizarDatos);
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', crearBackup);
    }

    if (backupBtn) {
        backupBtn.addEventListener('click', crearBackup);
    }
});

