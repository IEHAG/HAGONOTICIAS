// Configuración de Supabase para HAGO Noticias
// IMPORTANTE: Reemplaza estas credenciales con las de tu proyecto Supabase

// Configuración de Supabase
const SUPABASE_URL = 'TU_SUPABASE_URL_AQUI'; // Ejemplo: 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY_AQUI'; // Tu clave pública de Supabase

// Variable global de Supabase
let supabase = null;
let edicionesManager = null;

// Función para validar que la configuración esté completa
function validarConfiguracion() {
    if (!SUPABASE_URL || SUPABASE_URL === 'TU_SUPABASE_URL_AQUI' || 
        !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'TU_SUPABASE_ANON_KEY_AQUI') {
        console.error('Configuración de Supabase incompleta');
        return false;
    }
    return true;
}

// Función para inicializar el sistema de Supabase
function inicializarSistema() {
    try {
        if (!validarConfiguracion()) {
            console.error('No se puede inicializar: configuración incompleta');
            return false;
        }

        // Inicializar cliente de Supabase
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Crear instancia del manager de ediciones
        edicionesManager = new EdicionesManager(supabase);
        
        console.log('Sistema de Supabase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar sistema:', error);
        return false;
    }
}

// Clase para gestionar las ediciones en Supabase
class EdicionesManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    // Obtener todas las ediciones
    async obtenerEdiciones() {
        try {
            const { data, error } = await this.supabase
                .from('ediciones')
                .select('*')
                .order('fecha_publicacion', { ascending: false });

            if (error) {
                console.error('Error al obtener ediciones:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Error en obtenerEdiciones:', error);
            throw error;
        }
    }

    // Obtener una edición por ID
    async obtenerEdicionPorId(id) {
        try {
            const { data, error } = await this.supabase
                .from('ediciones')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error al obtener edición:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error en obtenerEdicionPorId:', error);
            throw error;
        }
    }

    // Crear una nueva edición
    async crearEdicion(edicionData) {
        try {
            // Validar que tenga PDF URL
            if (!edicionData.pdf_url) {
                throw new Error('Se requiere una URL de PDF para crear la edición');
            }

            const { data, error } = await this.supabase
                .from('ediciones')
                .insert([edicionData])
                .select()
                .single();

            if (error) {
                console.error('Error al crear edición:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data };
        } catch (error) {
            console.error('Error en crearEdicion:', error);
            return { success: false, error: error.message };
        }
    }

    // Actualizar una edición existente
    async actualizarEdicion(id, edicionData) {
        try {
            const { data, error } = await this.supabase
                .from('ediciones')
                .update(edicionData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error al actualizar edición:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data };
        } catch (error) {
            console.error('Error en actualizarEdicion:', error);
            return { success: false, error: error.message };
        }
    }

    // Eliminar una edición
    async eliminarEdicion(id) {
        try {
            const { error } = await this.supabase
                .from('ediciones')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error al eliminar edición:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error en eliminarEdicion:', error);
            return { success: false, error: error.message };
        }
    }

    // Subir archivo a Supabase Storage
    async subirArchivo(bucket, archivo, nombreArchivo) {
        try {
            console.log(`Subiendo archivo al bucket ${bucket}: ${nombreArchivo}`);

            // Subir el archivo
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(bucket)
                .upload(nombreArchivo, archivo, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Error al subir archivo:', uploadError);
                // Si el archivo ya existe, intentar con upsert
                if (uploadError.message.includes('already exists')) {
                    const { data: upsertData, error: upsertError } = await this.supabase.storage
                        .from(bucket)
                        .update(nombreArchivo, archivo, {
                            cacheControl: '3600',
                            upsert: true
                        });
                    
                    if (upsertError) {
                        throw new Error(`Error al actualizar archivo: ${upsertError.message}`);
                    }
                    
                    // Obtener URL pública
                    const { data: urlData } = this.supabase.storage
                        .from(bucket)
                        .getPublicUrl(nombreArchivo);
                    
                    return { success: true, publicUrl: urlData.publicUrl };
                }
                throw new Error(`Error al subir archivo: ${uploadError.message}`);
            }

            // Obtener URL pública del archivo
            const { data: urlData } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(nombreArchivo);

            if (!urlData || !urlData.publicUrl) {
                throw new Error('No se pudo obtener la URL pública del archivo');
            }

            console.log('Archivo subido exitosamente:', urlData.publicUrl);
            return { success: true, publicUrl: urlData.publicUrl };
        } catch (error) {
            console.error('Error en subirArchivo:', error);
            return { success: false, error: error.message };
        }
    }

    // Eliminar archivo de Supabase Storage
    async eliminarArchivo(bucket, nombreArchivo) {
        try {
            const { error } = await this.supabase.storage
                .from(bucket)
                .remove([nombreArchivo]);

            if (error) {
                console.error('Error al eliminar archivo:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Error en eliminarArchivo:', error);
            return { success: false, error: error.message };
        }
    }
}

// Hacer funciones y variables disponibles globalmente
window.supabase = window.supabase || null;
window.edicionesManager = edicionesManager;
window.validarConfiguracion = validarConfiguracion;
window.inicializarSistema = inicializarSistema;

