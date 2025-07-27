-- Esquema de Base de Datos para HAG Noticias - Supabase
-- Este archivo contiene las definiciones de tablas y configuraciones necesarias

-- Habilitar la extensión UUID para generar identificadores únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal para almacenar las ediciones
CREATE TABLE IF NOT EXISTS ediciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255),
    categoria VARCHAR(50),
    anio INTEGER,
    thumbnail_url TEXT,
    pdf_url TEXT NOT NULL,
    descripcion TEXT,
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE,
    orden_visualizacion INTEGER DEFAULT 0
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_ediciones_categoria ON ediciones(categoria);
CREATE INDEX IF NOT EXISTS idx_ediciones_anio ON ediciones(anio);
CREATE INDEX IF NOT EXISTS idx_ediciones_fecha_publicacion ON ediciones(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_ediciones_activo ON ediciones(activo);

-- Función para actualizar automáticamente la fecha de actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente la fecha de actualización
CREATE TRIGGER trigger_actualizar_fecha_ediciones
    BEFORE UPDATE ON ediciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Habilitar Row Level Security (RLS) para controlar el acceso
ALTER TABLE ediciones ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública de ediciones activas
CREATE POLICY "Lectura pública de ediciones activas" ON ediciones
    FOR SELECT USING (activo = TRUE);

-- Política para permitir todas las operaciones a usuarios autenticados
-- (En un entorno real, esto se restringiría a roles específicos)
CREATE POLICY "Administradores pueden gestionar ediciones" ON ediciones
    FOR ALL USING (auth.role() = 'authenticated');

-- Configuración de Storage Buckets
-- Bucket para almacenar archivos PDF
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para almacenar miniaturas/thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para PDFs
CREATE POLICY "Lectura pública de PDFs" ON storage.objects
    FOR SELECT USING (bucket_id = 'pdfs');

CREATE POLICY "Subida de PDFs para usuarios autenticados" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Actualización de PDFs para usuarios autenticados" ON storage.objects
    FOR UPDATE USING (bucket_id = 'pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Eliminación de PDFs para usuarios autenticados" ON storage.objects
    FOR DELETE USING (bucket_id = 'pdfs' AND auth.role() = 'authenticated');

-- Políticas de Storage para Thumbnails
CREATE POLICY "Lectura pública de thumbnails" ON storage.objects
    FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Subida de thumbnails para usuarios autenticados" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Actualización de thumbnails para usuarios autenticados" ON storage.objects
    FOR UPDATE USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Eliminación de thumbnails para usuarios autenticados" ON storage.objects
    FOR DELETE USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

-- Datos de ejemplo (opcional, para testing)
INSERT INTO ediciones (titulo, autor, categoria, anio, descripcion, pdf_url, thumbnail_url, orden_visualizacion) VALUES
('Edición # 1', 'Día de la democracia, Madres, Maestro, Talentos Abadistas', '#1', 2024, 'Primera edición del periódico institucional', 'pdf/Edición1.pdf', 'https://drive.google.com/thumbnail?id=1UICpZu7v8SyBjJaA29YYYzZa2F97i25m&sz=w320-h240', 1),
('Edición # 2', 'Día de la Antioqueñidad', '#2', 2024, 'Segunda edición del periódico institucional', 'pdf/Edición2.pdf', 'https://drive.google.com/thumbnail?id=1UjFe_Jj1lN-_vTAqr3A_MH4sSthQWzPv&sz=w320-h240', 2),
('Edición # 3', 'Semana Abadista - Foro - Museo Escolar', '#3', 2024, 'Tercera edición del periódico institucional', 'pdf/Edición3.pdf', 'https://drive.google.com/thumbnail?id=1q6lmYNtsZKa1_WPglzVAbG9q0OuEoHy5&sz=w320-h240', 3),
('Edición # 4', 'La institución de la Inclusión, Gobierno Escolar 2025', '#4', 2025, 'Cuarta edición del periódico institucional', 'pdf/Edición4.pdf', 'https://drive.google.com/thumbnail?id=13fWBxbiOMp8MMZIsOO-gPyX14VP361Ql&sz=w320-h240', 4)
ON CONFLICT (id) DO NOTHING;

-- Comentarios sobre el esquema:
-- 1. La tabla 'ediciones' almacena toda la información de las ediciones del periódico
-- 2. Se incluyen campos adicionales como 'activo' para soft delete y 'orden_visualizacion' para controlar el orden
-- 3. Las políticas RLS aseguran que solo usuarios autenticados puedan modificar datos
-- 4. Los buckets de Storage permiten almacenar archivos PDF y thumbnails de forma segura
-- 5. Los índices mejoran el rendimiento de las consultas más comunes
-- 6. El trigger actualiza automáticamente la fecha de modificación

