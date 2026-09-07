# HAGO Noticias — Portal de Periódico Institucional

Portal oficial de noticias de la **Institución Educativa Héctor Abad Gómez**.
Desarrollado por **Ing. Víctor Cañola** (Docente).

---

## Requisitos

- **XAMPP** (Apache + MySQL + PHP 8.0+)
- Navegador web moderno

## Instalación

### 1. Copiar el proyecto
Copia la carpeta `HAGONOTICIAS` dentro de `C:\xampp\htdocs\`.

### 2. Crear la base de datos
1. Abre **phpMyAdmin**: http://localhost/phpmyadmin
2. Pestaña "Importar" → selecciona `sql/hagonoticias.sql`
3. Clic en "Continuar" / "Go"

### 3. Configurar la base de datos (opcional)
Si tu MySQL tiene contraseña, edita `api/config.php`:
```php
define('DB_PASS', 'tu contraseña');
```

### 4. Iniciar Apache
En el panel de control de XAMPP, inicia **Apache**.

### 5. Acceder
- **Portal**: http://localhost/HAGONOTICIAS/
- **Admin**: http://localhost/HAGONOTICIAS/admin/login.php

### Credenciales por defecto
| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `HagoAdmin2026*` |

> Cambia la contraseña después del primer login.

---

## Estructura del Proyecto

```
HAGONOTICIAS/
├── index.html              Portal principal
├── videos.html             Página de videos
├── podcast.html            HAGO Radio
├── pages/
│   └── galeria-ediciones.html  Galería de ediciones
│
├── api/                    Backend PHP
│   ├── config.php          Conexión MySQL + helpers
│   ├── auth.php            Login/logout/session
│   ├── ediciones.php       CRUD ediciones
│   ├── upload.php          Subida de archivos
│   └── stats.php           Estadísticas dashboard
│
├── admin/                  Panel administrativo
│   ├── login.php           Login
│   ├── dashboard.php       Dashboard CRUD
│   ├── logout.php          Cerrar sesión
│   └── uploads/            Archivos subidos
│
├── css/                    Estilos
│   ├── main.css            Theme dark unificado
│   ├── admin.css           Estilos admin
│   └── tailwind.css        Tailwind compilado
│
├── js/                     JavaScript
│   ├── main.js             Utilidades del portal
│   ├── admin.js            Lógica del dashboard
│   ├── ediciones-data.js   Datos de ediciones
│   └── enhanced-pdf-viewer.js  Visor PDF
│
├── sql/
│   └── hagonoticias.sql    Schema MySQL
│
├── img/                    Imágenes
├── pdf/                    Ediciones PDF
├── campus/podcast/         Audios
├── video/                  Videos
└── LICENSE                 Licencia
```

## Funcionalidades

### Portal Público
- Galería de ediciones con búsqueda y filtros
- Visor de PDF integrado
- HAGO Radio (reproductor de audio)
- Página de videos (YouTube)
- Diseño responsive dark theme

### Panel Administrativo
- Login seguro con bcrypt
- CRUD de ediciones (crear, editar, eliminar)
- Subida de PDFs e imágenes
- Estadísticas (vistas, descargas)
- Logs de actividad
- Backup/restore en JSON

## Seguridad

- Contraseñas con `password_hash()` (bcrypt)
- Sesiones PHP con timeout de 2 horas
- Bloqueo de cuenta tras 5 intentos fallidos
- Prepared statements PDO (prevención SQL injection)
- Headers de seguridad (X-Content-Type-Options, X-Frame-Options)
- CSRF token en formularios

## Tecnologías

- HTML5 / CSS3 / JavaScript ES6+
- PHP 8.0+ con PDO
- MySQL 5.7+ / MariaDB
- Tailwind CSS 4 (compilado local)
- Font Awesome 6.5
- PDF.js 3.11
- React 18 (solo portal principal, createElement sin JSX)

## Licencia

© 2024-2026 Institución Educativa Héctor Abad Gómez.
Desarrollo: **Ing. Víctor Cañola**. Todos los derechos reservados.

Ver [LICENSE](LICENSE) para detalles.
