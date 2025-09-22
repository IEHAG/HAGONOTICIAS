// Sistema de autenticación para el panel administrativo

// Credenciales válidas (en un entorno real, esto estaría en el backend)
const validCredentials = {
    username: 'adminhag@gmail.com',
    password: 'CAÑOLA2027*'
};

// Variables globales
let loginAttempts = 0;
const maxAttempts = 3;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya está logueado
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    setupLoginForm();
    setupPasswordToggle();
    setupAnimations();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    
    // Evento de envío del formulario
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Eventos de entrada para limpiar errores
    usernameInput.addEventListener('input', clearErrors);
    passwordInput.addEventListener('input', clearErrors);
    
    // Permitir login con Enter
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    });
}

function setupPasswordToggle() {
    const toggleButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (toggleButton && passwordInput) {
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
}

function setupAnimations() {
    // Animación de entrada del formulario
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.style.opacity = '0';
        loginCard.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            loginCard.style.transition = 'all 0.6s ease';
            loginCard.style.opacity = '1';
            loginCard.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Efectos de partículas de fondo
    createFloatingParticles();
}

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('loginButton');
    
    // Validación básica
    if (!username || !password) {
        showError('Por favor, completa todos los campos.');
        return;
    }
    
    // Mostrar estado de carga
    showLoadingState(loginButton);
    
    // Simular delay de autenticación
    setTimeout(() => {
        if (validateCredentials(username, password)) {
            handleSuccessfulLogin();
        } else {
            handleFailedLogin();
        }
        hideLoadingState(loginButton);
    }, 1500);
}

function validateCredentials(username, password) {
    return username === validCredentials.username && password === validCredentials.password;
}

function handleSuccessfulLogin() {
    // Guardar estado de sesión
    sessionStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('loginTime', new Date().getTime().toString());
    sessionStorage.setItem('username', document.getElementById('username').value);
    
    // Mostrar mensaje de éxito
    showSuccess('¡Acceso concedido! Redirigiendo...');
    
    // Animación de salida
    const loginCard = document.querySelector('.login-card');
    loginCard.style.transform = 'scale(0.9)';
    loginCard.style.opacity = '0';
    
    // Redireccionar al dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

function handleFailedLogin() {
    loginAttempts++;
    
    if (loginAttempts >= maxAttempts) {
        showError('Demasiados intentos fallidos. Intenta de nuevo en 5 minutos.');
        disableForm(5 * 60 * 1000); // 5 minutos
    } else {
        const remainingAttempts = maxAttempts - loginAttempts;
        showError(`Usuario o contraseña incorrectos. Te quedan ${remainingAttempts} intentos.`);
        
        // Animación de error
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
    }
}

function showLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verificando...';
    button.disabled = true;
    button.dataset.originalText = originalText;
}

function hideLoadingState(button) {
    button.innerHTML = button.dataset.originalText;
    button.disabled = false;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto-hide después de 5 segundos
    setTimeout(() => {
        const alert = errorDiv.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => {
                errorDiv.innerHTML = '';
            }, 150);
        }
    }, 5000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            ${message}
        </div>
    `;
}

function clearErrors() {
    const errorDiv = document.getElementById('errorMessage');
    const alert = errorDiv.querySelector('.alert');
    if (alert) {
        alert.classList.remove('show');
        setTimeout(() => {
            errorDiv.innerHTML = '';
        }, 150);
    }
}

function disableForm(duration) {
    const inputs = document.querySelectorAll('#loginForm input, #loginForm button');
    inputs.forEach(input => input.disabled = true);
    
    let timeLeft = duration / 1000;
    const loginButton = document.getElementById('loginButton');
    
    const countdown = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        loginButton.innerHTML = `Bloqueado ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdown);
            inputs.forEach(input => input.disabled = false);
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>INICIAR SESIÓN';
            loginAttempts = 0;
        }
    }, 1000);
}

function createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Crear partículas
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        particleContainer.appendChild(particle);
    }
}

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
        }
    }
    
    .login-card {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.95);
    }
    
    .floating-particles {
        overflow: hidden;
    }
`;
document.head.appendChild(style);

