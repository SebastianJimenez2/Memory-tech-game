let timerInterval;
let startTime = 0;
let elapsedTime = 0;
let isPaused = false;
let tiempoInicial = 0; // Variable para definir el tiempo inicial

const timerElement = document.querySelector('.timer');
const reiniciarButton = document.getElementById('reiniciar');
const pausaButton = document.getElementById('pausa');

// Función para formatear el tiempo
function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Función para actualizar el temporizador
function updateTimer() {
        if (!isPaused) {
                elapsedTime = tiempoInicial - (Date.now() - startTime);
                if (elapsedTime <= 0) {
                        elapsedTime = 0;
                        clearInterval(timerInterval);
                        mostrarPopupTiempoAgotado(); // Mostrar el pop-up cuando el tiempo se acabe
                }
                timerElement.textContent = formatTime(elapsedTime);
        }
}

// Función para iniciar el temporizador
function startTimer() {
        startTime = Date.now() - (tiempoInicial - elapsedTime);
        timerInterval = setInterval(updateTimer, 1000);
}

// Función para pausar el temporizador
function pauseTimer() {
        clearInterval(timerInterval);
        isPaused = true;
}

// Función para reanudar el temporizador
function resumeTimer() {
        startTime = Date.now() - (tiempoInicial - elapsedTime);
        timerInterval = setInterval(updateTimer, 1000);
        isPaused = false;
}

// Función para reiniciar el temporizador
function resetTimer() {
        clearInterval(timerInterval);
        elapsedTime = tiempoInicial;
        timerElement.textContent = formatTime(elapsedTime);
        if (!isPaused) {
                startTimer();
        }
}

// Función para establecer el tiempo inicial
function setTiempoInicial(tiempo) {
        tiempoInicial = tiempo;
        resetTimer(); // Reiniciar el temporizador con el nuevo tiempo
}

// Función para mostrar el pop-up de tiempo agotado
function mostrarPopupTiempoAgotado() {
        const popup = document.getElementById('popup-tiempo-agotado');
        popup.style.display = 'flex'; // Mostrar el pop-up

        const botonCerrar = document.getElementById('cerrar-popup-tiempo');
        botonCerrar.addEventListener('click', () => {
                popup.style.display = 'none';
                window.location.href = 'niveles.html';
        });
}

// Exponer la función para establecer el tiempo inicial
window.setTiempoInicial = setTiempoInicial;
