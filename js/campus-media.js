// DATOS DE CONTENIDO - Reemplaza con tus archivos
const contentData = {
    videos: {
        director: { 
            title: 'Entrevista al Director General', 
            file: 'videos/director-interview.mp4',
            description: 'Acompaña a nuestro director en un día completo de actividades desde las 7:00 AM hasta las reuniones estudiantiles.'
        },
        hackathon: { 
            title: 'Hackathon 2024 - Completo', 
            file: 'videos/hackathon-2024.mp4',
            description: 'Descubre cómo nuestros estudiantes crearon una aplicación educativa innovadora en solo 48 horas.'
        },
        graduacion: { 
            title: 'Graduación 2024 - Momentos Inolvidables', 
            file: 'videos/graduacion-2024.mp4',
            description: 'Los mejores momentos de la graduación 2024, incluyendo discursos y lágrimas de alegría.'
        },
        proyecto: { 
            title: 'Proyecto Innovador: Robótica Educativa', 
            file: 'videos/proyecto-final.mp4',
            description: 'Conoce el increíble proyecto de robótica desarrollado por estudiantes de ingeniería.'
        },
        deporte: { 
            title: 'Campeonato Intercolegial: Lo Mejor del Deporte', 
            file: 'videos/deporte-dia.mp4',
            description: 'Los mejores momentos del campeonato intercolegial con entrevistas exclusivas.'
        },
        tutoriales: { 
            title: 'Tutoriales de Estudio - Métodos Comprobados', 
            file: 'videos/tutoriales-estudio.mp4',
            description: 'Los mejores métodos de estudio probados por nuestros estudiantes de honor.'
        }
    },
    podcasts: {
        bienvenida: { 
            title: 'Bienvenida 2024 - ¡Vamos equipo!', 
            file: 'audio/bienvenida-2024.mp3',
            description: 'Mensaje motivacional de bienvenida con música de fondo y entrevistas a estudiantes nuevos.'
        },
        estudio: { 
            title: 'Métodos de Estudio - Aprobados por Estudiantes', 
            file: 'audio/metodos-estudio.mp3',
            description: 'Estudiantes de honor comparten sus trucos para aprobar sin morir en el intento.'
        },
        vida: { 
            title: 'Vida Universitaria - Realidad vs Expectativas', 
            file: 'audio/vida-universitaria.mp3',
            description: 'Estudiantes comparten sus experiencias reales sobre la vida universitaria sin filtros.'
        },
        tecnologia: { 
            title: 'Apps que Cambiaron la Vida Estudiantil', 
            file: 'audio/tecnologia-apps.mp3',
            description: 'Nuestros estudiantes prueban las mejores apps de estudio y comparten resultados reales.'
        },
        exito: { 
            title: 'De Cero a Héroe - Historias de Éxito Real', 
            file: 'audio/consejos-exito.mp3',
            description: 'Estudiantes que pasaron de casi abandonar a ser los mejores. Historias inspiradoras.'
        },
        consejos: { 
            title: 'Consejos de Supervivencia - Testados por Estudiantes', 
            file: 'audio/exitos-2024.mp3',
            description: 'Los mejores hacks para sobrevivir la universidad compartidos por estudiantes exitosos.'
        }
    }
};

// FUNCIONES PRINCIPALES
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionId + '-section').classList.add('active');

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
}

function playContent(type, id) {
    const content = contentData[type][id];
    
    const modal = document.createElement('div');
    modal.className = 'content-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${content.title}</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <${type === 'video' ? 'video' : 'audio'} class="media-player" controls autoplay>
                        <source src="${content.file}" type="${type === 'video' ? 'video/mp4' : 'audio/mpeg'}">
                        Tu navegador no soporta este formato.
                    </${type === 'video' ? 'video' : 'audio'}>
                    <p class="content-description">${content.description}</p>
                    <div class="action-buttons">
                        <button class="action-btn btn-primary" onclick="window.open('${content.file}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Abrir en Nueva Pestaña
                        </button>
                        <button class="action-btn btn-secondary" onclick="navigator.share({title: '${content.title}', text: '${content.description}'})">
                            <i class="fas fa-share"></i> Compartir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.querySelector('.content-modal');
    if (modal) {
        modal.remove();
    }
}

function togglePodcast() {
    const btn = document.getElementById('playBtn');
    btn.className = btn.className.includes('play') ? 'fas fa-pause' : 'fas fa-play';
    btn.parentElement.classList.toggle('bounce');
}

function previousPodcast() {
    alert('⏮️ Cargando episodio anterior...');
}

function nextPodcast() {
    alert('⏭️ Cargando siguiente episodio...');
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Añadir efectos hover
    const cards = document.querySelectorAll('.video-card, .podcast-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('bounce');
            setTimeout(() => this.classList.remove('bounce'), 1000);
        });
    });
});