// DATOS DE CONTENIDO - Reemplaza con tus archivos
const contentData = {
videos: {
    apertura: { 
        title: 'Apertura Día de la Antioqueñidad', 
        file: 'videos/apertura-antioquenidad.mp4',
        description: 'Inicio de la jornada con actos culturales, música típica y la presentación oficial del evento.'
    },
    stands: { 
        title: 'Recorrido por los Stands', 
        file: 'videos/stands-antioquenidad.mp4',
        description: 'Visita a los diferentes stands donde los estudiantes muestran creatividad en gastronomía, historia y tecnología.'
    },
    trovas: { 
        title: 'Trovas Antioqueñas en Vivo', 
        file: 'videos/trovas-en-vivo.mp4',
        description: 'Un espacio de humor y tradición con trovadores estudiantiles que hacen reír y reflexionar.'
    },
    clausura: { 
        title: 'Clausura y Presentaciones Finales', 
        file: 'videos/clausura-antioquenidad.mp4',
        description: 'Cierre del evento con danzas típicas, música parrandera y agradecimientos a toda la comunidad educativa.'
    }

    },
podcasts: {
    bienvenida: { 
        title: 'Bienvenida al Día de la Antioqueñidad', 
        file: 'audio/bienvenida-antioquenidad.mp3',
        description: 'Mensaje motivacional de apertura con la participación de estudiantes y docentes para dar inicio a la jornada cultural.'
    },
    historia: { 
        title: 'Historia y Tradición Antioqueña', 
        file: 'audio/historia-tradicion.mp3',
        description: 'Un recorrido sonoro por las raíces de Antioquia: costumbres, personajes y anécdotas contadas por estudiantes.'
    },
    vida: { 
        title: 'Así Vivimos la Antioqueñidad', 
        file: 'audio/vida-antioquenidad.mp3',
        description: 'Testimonios de estudiantes sobre cómo se celebra la cultura antioqueña en la institución educativa.'
    },
    musica: { 
        title: 'Trovas y Música Parrandera', 
        file: 'audio/musica-trovas.mp3',
        description: 'Fragmentos de trovas y música típica paisa interpretadas en el evento.'
    },
    gastronomia: { 
        title: 'Sabores Antioqueños en el Colegio', 
        file: 'audio/gastronomia-antioquia.mp3',
        description: 'Podcast sobre los platos típicos que se compartieron en la feria cultural de la institución.'
    },
    clausura: { 
        title: 'Clausura Día de la Antioqueñidad', 
        file: 'audio/clausura-antioquenidad.mp3',
        description: 'Palabras de cierre con mensajes de agradecimiento, unión y orgullo cultural.'
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