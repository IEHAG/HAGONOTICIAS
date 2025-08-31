// Campus Media JavaScript Functionality

// Función para mostrar secciones
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionId + '-section').classList.add('active');

    // Actualizar tabs activos
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Marcar el tab actual como activo
    event.currentTarget.classList.add('active');
}

// Función para reproducir contenido
function playContent(type, id) {
    // Crear modal para mostrar contenido
    const modal = document.createElement('div');
    modal.className = 'content-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${type === 'video' ? '📺 Video' : '🎧 Podcast'}: ${getContentTitle(type, id)}</h3>
                    <button class="close-btn" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${getContentPlayer(type, id)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Añadir estilos del modal si no existen
    if (!document.getElementById('modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .content-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .modal-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }
            
            .modal-content {
                background: white;
                border-radius: 20px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from { opacity: 0; transform: scale(0.9) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                color: var(--text);
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-light);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s;
            }
            
            .close-btn:hover {
                background: var(--bg);
                color: var(--text);
            }
            
            .modal-body {
                padding: 2rem;
                text-align: center;
            }
            
            .placeholder-player {
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                padding: 4rem 2rem;
                border-radius: 15px;
                margin-bottom: 1rem;
            }
            
            .placeholder-player i {
                font-size: 4rem;
                margin-bottom: 1rem;
                display: block;
            }
            
            .content-description {
                color: var(--text-light);
                line-height: 1.6;
                margin-bottom: 2rem;
            }
            
            .action-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .action-btn {
                padding: 0.75rem 2rem;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .btn-primary {
                background: var(--primary);
                color: white;
            }
            
            .btn-secondary {
                background: var(--surface);
                color: var(--primary);
                border: 2px solid var(--primary);
            }
            
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
        `;
        document.head.appendChild(styles);
    }
}

// Función para cerrar modal
function closeModal() {
    const modal = document.querySelector('.content-modal');
    if (modal) {
        modal.remove();
    }
}

// Función para obtener el título del contenido
function getContentTitle(type, id) {
    const titles = {
        video: {
            director: 'Día en la vida de nuestro Director',
            hackathon: 'Hackathon 2024 - Completo',
            graduacion: 'Graduación 2024 - Momentos Inolvidables',
            proyecto: 'Proyecto Innovador: Robótica Educativa',
            deporte: 'Campeonato Intercolegial: Lo Mejor del Deporte',
            arte: 'Exposición de Arte Anual: Talentos Ocultos'
        },
        podcast: {
            tecnologia: 'Tecnología y Sociedad',
            salud: 'Bienestar y Salud Mental',
            cultura: 'Cultura y Arte Local',
            ciencia: 'Ciencia para Todos',
            historia: 'Ecos del Pasado',
            emprendimiento: 'Mentes Emprendedoras'
        }
    };
    
    return titles[type][id] || 'Contenido';
}

// Función para obtener el reproductor del contenido
function getContentPlayer(type, id) {
    const descriptions = {
        video: {
            director: 'Acompaña a nuestro director en un día completo de actividades, desde las reuniones matutinas hasta los eventos estudiantiles.',
            hackathon: 'Descubre cómo nuestros estudiantes crearon una aplicación educativa innovadora en solo 48 horas.',
            graduacion: 'Revive los momentos más emotivos de la ceremonia de graduación 2024.',
            proyecto: 'Conoce el increíble proyecto de robótica desarrollado por estudiantes de ingeniería.',
            deporte: 'Los mejores momentos del campeonato intercolegial con entrevistas exclusivas.',
            arte: 'Un recorrido por las obras más impresionantes de nuestros talentosos estudiantes.'
        },
        podcast: {
            tecnologia: 'Una conversación profunda sobre cómo la tecnología está transformando nuestro mundo.',
            salud: 'Consejos prácticos y entrevistas con expertos sobre bienestar y salud mental.',
            cultura: 'Exploramos las ricas tradiciones culturales y artísticas de nuestra comunidad.',
            ciencia: 'Hacemos la ciencia accesible para todos con explicaciones claras y ejemplos prácticos.',
            historia: 'Historias fascinantes que han moldeado nuestro presente y futuro.',
            emprendimiento: 'Inspiradoras historias de jóvenes que están cambiando el mundo con sus ideas.'
        }
    };
    
    const icon = type === 'video' ? 'fas fa-play-circle' : 'fas fa-podcast';
    const description = descriptions[type][id] || 'Contenido multimedia de alta calidad.';
    
    return `
        <div class="placeholder-player">
            <i class="${icon}"></i>
            <h4>Reproductor de ${type === 'video' ? 'Video' : 'Podcast'}</h4>
            <p>Contenido disponible próximamente</p>
        </div>
        <div class="content-description">
            ${description}
        </div>
        <div class="action-buttons">
            <button class="action-btn btn-primary">
                <i class="fas fa-play"></i>
                Reproducir
            </button>
            <button class="action-btn btn-secondary">
                <i class="fas fa-share"></i>
                Compartir
            </button>
            <button class="action-btn btn-secondary">
                <i class="fas fa-download"></i>
                Descargar
            </button>
        </div>
    `;
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Añadir efectos de hover a las cards
    const cards = document.querySelectorAll('.video-card, .podcast-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('bounce');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('bounce');
        });
    });
    
    // Efecto de pulsación en el reproductor principal
    const playerCover = document.querySelector('.player-cover');
    if (playerCover) {
        setInterval(() => {
            playerCover.style.transform = 'scale(1.05)';
            setTimeout(() => {
                playerCover.style.transform = 'scale(1)';
            }, 1000);
        }, 3000);
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

