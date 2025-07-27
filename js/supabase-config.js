// Configuración de Supabase para HAG Noticias
// Este archivo contiene la configuración y funciones para interactuar con Supabase

// IMPORTANTE: Estas credenciales deben ser reemplazadas con las reales de tu proyecto Supabase
const SUPABASE_URL = 'https://samqmbyhtnyehrackmfr.supabase.co'; // Reemplazar con tu URL de Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbXFtYnlodG55ZWhyYWNrbWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODIyOTgsImV4cCI6MjA2OTE1ODI5OH0.nL9kMii7IemE2mkD5wbK0XmvpyvGFrgSgE0Lzr-Fd54'; // Reemplazar con tu clave anónima de Supabase

// Inicializar el cliente de Supabase
// Nota: Asegúrate de incluir la librería de Supabase en tu HTML antes de este script
let supabase;

// Función para inicializar Supabase
function initSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            console.error('La librería de Supabase no está cargada. Asegúrate de incluir el script de Supabase.');
            return false;
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar Supabase:', error);
        return false;
    }
}

// Clase para gestionar las ediciones con Supabase
class EdicionesManager {
    constructor() {
        this.tableName = 'ediciones';
    }

    // Obtener todas las ediciones activas
    async obtenerEdiciones() {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('activo', true)
                .order('orden_visualizacion', { ascending: true });

            if (error) {
                console.error('Error al obtener ediciones:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error en obtenerEdiciones:', error);
            return [];
        }
    }

    // Obtener una edición por ID
    async obtenerEdicionPorId(id) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error al obtener edición por ID:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error en obtenerEdicionPorId:', error);
            return null;
        }
    }

    // Crear una nueva edición
    async crearEdicion(edicionData) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert([edicionData])
                .select();

            if (error) {
                console.error('Error al crear edición:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error en crearEdicion:', error);
            return { success: false, error: error.message };
        }
    }

    // Actualizar una edición existente
    async actualizarEdicion(id, edicionData) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .update(edicionData)
                .eq('id', id)
                .select();

            if (error) {
                console.error('Error al actualizar edición:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error en actualizarEdicion:', error);
            return { success: false, error: error.message };
        }
    }

    // Eliminar una edición (soft delete)
    async eliminarEdicion(id) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({ activo: false })
                .eq('id', id)
                .select();

            if (error) {
                console.error('Error al eliminar edición:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error en eliminarEdicion:', error);
            return { success: false, error: error.message };
        }
    }

    // Subir archivo a Supabase Storage
    async subirArchivo(bucket, archivo, nombreArchivo) {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(nombreArchivo, archivo, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('Error al subir archivo:', error);
                return { success: false, error: error.message };
            }

            // Obtener la URL pública del archivo
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(nombreArchivo);

            return { 
                success: true, 
                data: data,
                publicUrl: urlData.publicUrl
            };
        } catch (error) {
            console.error('Error en subirArchivo:', error);
            return { success: false, error: error.message };
        }
    }

    // Eliminar archivo de Supabase Storage
    async eliminarArchivo(bucket, nombreArchivo) {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .remove([nombreArchivo]);

            if (error) {
                console.error('Error al eliminar archivo:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data };
        } catch (error) {
            console.error('Error en eliminarArchivo:', error);
            return { success: false, error: error.message };
        }
    }

    // Filtrar ediciones por criterios
    async filtrarEdiciones(filtros = {}) {
        try {
            let query = supabase
                .from(this.tableName)
                .select('*')
                .eq('activo', true);

            // Aplicar filtros
            if (filtros.categoria && filtros.categoria !== '') {
                query = query.eq('categoria', filtros.categoria);
            }

            if (filtros.anio) {
                query = query.eq('anio', filtros.anio);
            }

            if (filtros.busqueda && filtros.busqueda.trim() !== '') {
                const busqueda = filtros.busqueda.trim();
                query = query.or(`titulo.ilike.%${busqueda}%,autor.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
            }

            // Ordenar por orden de visualización
            query = query.order('orden_visualizacion', { ascending: true });

            const { data, error } = await query;

            if (error) {
                console.error('Error al filtrar ediciones:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error en filtrarEdiciones:', error);
            return [];
        }
    }
}

// Instancia global del manager de ediciones
let edicionesManager;

// Función para inicializar todo el sistema
async function inicializarSistema() {
    if (initSupabase()) {
        edicionesManager = new EdicionesManager();
        window.edicionesManager = edicionesManager; // Hacerlo global después de la inicialización
        console.log("Sistema de ediciones inicializado correctamente");
        return true;
    } else {
        console.error("No se pudo inicializar el sistema de ediciones");
        return false;
    }
}


// Función de utilidad para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Esta función puede ser personalizada según el sistema de notificaciones que uses
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    
    // Ejemplo de implementación con alert (reemplazar por un sistema más elegante)
    if (tipo === 'error') {
        alert(`Error: ${mensaje}`);
    } else if (tipo === 'success') {
        alert(`Éxito: ${mensaje}`);
    }
}

// Función para validar la configuración de Supabase
function validarConfiguracion() {
    if (SUPABASE_URL === 'https://tu-proyecto.supabase.co' || 
        SUPABASE_ANON_KEY === 'tu-anon-key-aqui') {
        console.warn('⚠️ ADVERTENCIA: Las credenciales de Supabase no han sido configuradas correctamente.');
        console.warn('Por favor, actualiza SUPABASE_URL y SUPABASE_ANON_KEY con tus credenciales reales.');
        return false;
    }
    return true;
}

// Exportar funciones para uso global
window.EdicionesManager = EdicionesManager;
window.inicializarSistema = inicializarSistema;
window.mostrarNotificacion = mostrarNotificacion;
window.validarConfiguracion = validarConfiguracion;


