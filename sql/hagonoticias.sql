-- ============================================================
-- HAGO NOTICIAS — Base de Datos MySQL (XAMPP)
-- Institución Educativa Héctor Abad Gómez
-- Desarrollo: Ing. Víctor Cañola
-- ============================================================

CREATE DATABASE IF NOT EXISTS hagonoticias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hagonoticias;

-- ------------------------------------------------------------
-- TABLA: usuarios
-- ------------------------------------------------------------
DROP TABLE IF EXISTS logs_actividad;
DROP TABLE IF EXISTS configuracion;
DROP TABLE IF EXISTS ediciones;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    nombre_completo VARCHAR(255)  DEFAULT NULL,
    rol             ENUM('admin','editor') DEFAULT 'editor',
    activo          TINYINT(1)    DEFAULT 1,
    intentos_fallidos INT         DEFAULT 0,
    bloqueado_hasta  DATETIME     DEFAULT NULL,
    ultimo_acceso   DATETIME      DEFAULT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLA: ediciones
-- ------------------------------------------------------------
CREATE TABLE ediciones (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    titulo              VARCHAR(255) NOT NULL,
    autor               VARCHAR(255) DEFAULT NULL,
    categoria           VARCHAR(50)  DEFAULT NULL,
    anio                INT          DEFAULT NULL,
    descripcion         TEXT         DEFAULT NULL,
    pdf_url             VARCHAR(500) NOT NULL,
    thumbnail_url       VARCHAR(500) DEFAULT NULL,
    fecha_publicacion   DATE         DEFAULT (CURRENT_DATE),
    fecha_actualizacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo              TINYINT(1)   DEFAULT 1,
    orden_visualizacion INT          DEFAULT 0,
    vistas              INT          DEFAULT 0,
    descargas           INT          DEFAULT 0,
    INDEX idx_categoria (categoria),
    INDEX idx_anio (anio),
    INDEX idx_fecha (fecha_publicacion DESC),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLA: logs_actividad
-- ------------------------------------------------------------
CREATE TABLE logs_actividad (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT          DEFAULT NULL,
    accion     VARCHAR(100) NOT NULL,
    detalles   TEXT         DEFAULT NULL,
    ip_address VARCHAR(45)  DEFAULT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha_log (created_at DESC),
    CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLA: configuracion
-- ------------------------------------------------------------
CREATE TABLE configuracion (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    clave      VARCHAR(100) NOT NULL,
    valor      TEXT         DEFAULT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_clave (clave)
) ENGINE=InnoDB;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Usuario administrador (password: HagoAdmin2026*)
-- Generado con PHP password_hash('HagoAdmin2026*', PASSWORD_BCRYPT)
INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol, activo)
VALUES (
    'admin',
    'admin@hagonoticias.edu.co',
    '$2y$10$hMYQuQLpyT0s7wjrgdPaMOqQwPQiTnkzMCfRkrNWPrEhUyISUZmVW',
    'Ing. Víctor Cañola',
    'admin',
    1
);

-- Ediciones iniciales
INSERT INTO ediciones (titulo, autor, categoria, anio, descripcion, pdf_url, thumbnail_url, fecha_publicacion, orden_visualizacion, vistas, descargas) VALUES
('Edición # 1', 'Día de la democracia, Madres, Maestro, Talentos Abadistas', '#1', 2024, 'Primera edición del periódico institucional', 'pdf/EDICION1.pdf', 'https://drive.google.com/thumbnail?id=1djewK_gQm5d9-bQzXA1W-xYLEuctmjfX&sz=w320-h240', '2024-01-15', 1, 450, 180),
('Edición # 2', 'Día de la Antioqueñidad', '#2', 2024, 'Segunda edición del periódico institucional', 'pdf/EDICION2.pdf', 'https://drive.google.com/thumbnail?id=1AkZ9JBY8Hgavcj3KJVtzWd5gsScmft_b&sz=w320-h240', '2024-03-20', 2, 380, 150),
('Edición # 3', 'Semana Abadista - Foro - Museo Escolar', '#3', 2024, 'Tercera edición del periódico institucional', 'pdf/EDICION3.pdf', 'https://drive.google.com/thumbnail?id=1xWfZ7J-7k1fFps5UG9Dkz3k8S2yaW_Hu&sz=w320-h240', '2024-06-10', 3, 520, 210),
('Edición # 4', 'La institución de la Inclusión, Gobierno Escolar 2025', '#4', 2025, 'Cuarta edición del periódico institucional', 'pdf/EDICION4.pdf', 'https://drive.google.com/thumbnail?id=1D818JI97Qk-jfqmCktdSXF-84XfyJ1OD&sz=w320-h240', '2025-02-15', 4, 290, 120),
('Edición # 5', 'Celebramos el corazón que educa y la dedicación que sostiene', '#5', 2025, 'Quinta edición del periódico institucional', 'pdf/EDICION5.pdf', 'https://drive.google.com/thumbnail?id=15emMmadoHN3SOx-U9xOn8oUw38u0v1vu&sz=w320-h240', '2025-06-01', 5, 310, 130),
('Edición # 6', 'La Institución de la Inclusión, Gobierno Escolar 2026', '#6', 2026, 'Sexta edición del periódico institucional', 'pdf/EDICION6.pdf', 'https://drive.google.com/thumbnail?id=1ZyDq2gXX7bEUZqxpNzQA6EnNyXFJX-hS&sz=w320-h240', '2026-03-01', 6, 180, 75);

-- Configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('site_name', 'HAGO Noticias', 'Nombre del sitio'),
('site_description', 'Periódico Institucional — I.E. Héctor Abad Gómez', 'Descripción del sitio'),
('site_author', 'Ing. Víctor Cañola', 'Autor del desarrollo'),
('max_upload_pdf', '52428800', 'Tamaño máximo upload PDF (50MB)'),
('max_upload_image', '2097152', 'Tamaño máximo upload imagen (2MB)'),
('editions_per_page', '12', 'Ediciones por página'),
('allow_registration', '0', 'Permitir registro de usuarios');

-- ============================================================
-- VISTA: resumen ediciones (para el dashboard)
-- ============================================================
CREATE OR REPLACE VIEW v_resumen_ediciones AS
SELECT
    e.id,
    e.titulo,
    e.autor,
    e.categoria,
    e.anio,
    e.descripcion,
    e.pdf_url,
    e.thumbnail_url,
    e.fecha_publicacion,
    e.activo,
    e.orden_visualizacion,
    e.vistas,
    e.descargas,
    e.fecha_actualizacion,
    u.nombre_completo AS autor_registro
FROM ediciones e
LEFT JOIN usuarios u ON u.id = (
    SELECT l.usuario_id FROM logs_actividad l
    WHERE l.accion = 'crear_edicion' AND l.detalles LIKE CONCAT('%"', e.id, '%')
    ORDER BY l.created_at DESC LIMIT 1
)
ORDER BY e.orden_visualizacion ASC, e.fecha_publicacion DESC;
