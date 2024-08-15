document.addEventListener('DOMContentLoaded', () => {
        const cartasGrid = document.getElementById('cartas-grid');
        const urlParams = new URLSearchParams(window.location.search);
        const nivel = urlParams.get('nivel');

        const bgMusic = document.getElementById('bg-music');
        const soundIcon = document.getElementById('sonido');
        const pausaButton = document.getElementById('pausa');
        const mensajePausa = document.getElementById('mensaje-pausa');
        let soundOn = false;
        let juegoPausado = false;

        const botonReportar = document.getElementById('reportar');
        const popupReportar = document.getElementById('popup-reportar');
        const cerrarReportar = document.getElementById('cerrar-reportar');
        const formReportar = document.getElementById('form-reportar');

        const botonInfo = document.getElementById('informacion');
        const popupInfo = document.getElementById('popup-info');
        const cerrarInfo = document.getElementById('cerrar-info');

        const popupPareja = document.getElementById('popup-pareja');
        const cerrarPopupPareja = document.getElementById('cerrar-popup-pareja');

        let numCartas;
        let tiempoInicial;
        let temporizador;

        switch (nivel) {
                case 'principiante':
                        numCartas = 8;
                        tiempoInicial = 3 * 60 * 1000;
                        break;
                case 'intermedio':
                        numCartas = 16;
                        tiempoInicial = 2 * 60 * 1000;
                        break;
                case 'avanzado':
                        numCartas = 32;
                        tiempoInicial = 1 * 60 * 1000;
                        break;
                default:
                        numCartas = 8;
                        tiempoInicial = 5 * 60 * 1000;
        }

        const cartas = generarCartas(numCartas);
        cartasGrid.innerHTML = '';
        cartas.forEach(carta => {
                cartasGrid.appendChild(carta);
        });

        inicializarJuego();

        if (window.setTiempoInicial) {
                window.setTiempoInicial(tiempoInicial);
        }

        function generarCartas(num) {
                const cartas = [];
                const parejas = num / 2;

                for (let i = 1; i <= parejas; i++) {
                        for (let j = 0; j < 2; j++) {
                                const carta = document.createElement('div');
                                carta.classList.add('carta');
                                carta.dataset.pareja = i;
                                carta.setAttribute('tabindex', '0'); // Asegura que cada carta sea navegable con Tab

                                const front = document.createElement('div');
                                front.classList.add('front');
                                front.innerHTML = `<img src="img/carta${i}.jpg" alt="Carta ${i}">`;

                                const back = document.createElement('div');
                                back.classList.add('back');

                                carta.appendChild(front);
                                carta.appendChild(back);
                                cartas.push(carta);
                        }
                }

                return cartas.sort(() => 0.5 - Math.random());
        }

        function inicializarJuego() {
                const cartas = document.querySelectorAll('.carta');
                let cartaVolteada = false;
                let primeraCarta, segundaCarta;
                let bloqueoTablero = false;
                let parejasEncontradas = 0;
                const totalParejas = numCartas / 2;

                function toggleSound() {
                        soundOn = !soundOn;
                        if (soundOn) {
                                bgMusic.play();
                                soundIcon.querySelector('img').src = 'img/sound-icon.png'; // Cambia el ícono a activo
                        } else {
                                bgMusic.pause();
                                soundIcon.querySelector('img').src = 'img/sound-muted-icon.png'; // Cambia el ícono a silenciado
                        }
                }

                soundIcon.addEventListener('click', toggleSound);

                function reproducirSonido(tipo) {
                        if (soundOn) {
                                if (tipo === 'correct') {
                                        correctSound.play();
                                } else if (tipo === 'incorrect') {
                                        incorrectSound.play();
                                }
                        }
                }

                function voltearCarta() {
                        if (bloqueoTablero) return;
                        if (this === primeraCarta) return;

                        this.classList.add('volteada');

                        if (!cartaVolteada) {
                                cartaVolteada = true;
                                primeraCarta = this;
                                return;
                        }

                        segundaCarta = this;
                        verificarPareja();
                }

                function verificarPareja() {
                        const esPareja = primeraCarta.dataset.pareja === segundaCarta.dataset.pareja;
                        esPareja ? desactivarCartas() : desvoltearCartas();
                }

                function desactivarCartas() {
                        primeraCarta.classList.add('matched');
                        segundaCarta.classList.add('matched');

                        mostrarMensajeParejaEncontrada();
                        mostrarPopupPareja(primeraCarta.dataset.pareja);

                        resetearTablero();

                        const todasEmparejadas = document.querySelectorAll('.carta.matched').length === numCartas;
                        if (todasEmparejadas) {
                                mostrarPopup().then(() => {
                                        redirigirANiveles(); // Redirigir cuando se cierra el popup
                                });
                        }
                }

                function desvoltearCartas() {
                        bloqueoTablero = true;
                        setTimeout(() => {
                                primeraCarta.classList.remove('volteada');
                                segundaCarta.classList.remove('volteada');
                                resetearTablero();
                        }, 1000);
                }

                function resetearTablero() {
                        [cartaVolteada, bloqueoTablero] = [false, false];
                        [primeraCarta, segundaCarta] = [null, null];
                }

                function mostrarPopup() {
                        return new Promise((resolve) => {
                                const popup = document.getElementById('popup-felicitaciones');
                                popup.style.display = 'flex';

                                // Pausar el temporizador cuando se muestra el popup
                                if (window.pauseTimer) {
                                        window.pauseTimer();
                                }

                                const botonCerrar = document.getElementById('cerrar-popup');
                                botonCerrar.addEventListener('click', () => {
                                        popup.style.display = 'none';
                                        if (window.resumeTimer) {
                                                window.resumeTimer(); // Reanudar el temporizador
                                        }
                                        resolve(); // Resolver la promesa cuando se cierra el popup
                                }, { once: true }); // Asegurarse de que el evento se maneje solo una vez
                        });
                }

                function presionarCarta(event) {
                        if (event.key === 'Enter') {
                                voltearCarta.call(event.currentTarget);
                        }
                }

                function manejarTecla(event) {
                        if (event.key === 'Escape') {
                                cerrarTodosPopUps();
                        }
                }

                function cerrarTodosPopUps() {
                        popupReportar.style.display = 'none';
                        popupInfo.style.display = 'none';
                        if (popupPareja) popupPareja.style.display = 'none';
                        const popupFelicitaciones = document.getElementById('popup-felicitaciones');
                        if (popupFelicitaciones) popupFelicitaciones.style.display = 'none';

                        if (window.resumeTimer) {
                                window.resumeTimer(); // Reanudar el temporizador
                        }
                }

                function mostrarMensajeParejaEncontrada() {
                        const mensaje = document.createElement('div');
                        mensaje.classList.add('mensaje-pareja');
                        mensaje.innerText = '¡Pareja encontrada!';

                        document.body.appendChild(mensaje);
                        setTimeout(() => {
                                mensaje.remove();
                        }, 2000);
                }

                pausaButton.addEventListener('click', () => {
                        if (juegoPausado) {
                                reanudarJuego();
                        } else {
                                pausarJuego();
                        }
                });

                function pausarJuego() {
                        juegoPausado = true;
                        pausaButton.querySelector('img').src = 'img/play-icon.png'; // Cambia el ícono a play (pausado)
                        mensajePausa.style.display = 'block';
                        if (window.pauseTimer) {
                                window.pauseTimer(); // Pausar el temporizador
                        }
                }

                function reanudarJuego() {
                        juegoPausado = false;
                        pausaButton.querySelector('img').src = 'img/pause-icon.png'; // Cambia el ícono a pausa (reanudar)
                        mensajePausa.style.display = 'none';
                        if (window.resumeTimer) {
                                window.resumeTimer(); // Reanudar el temporizador
                        }
                }

                function mostrarPopupPareja(parejaId) {
                        const popup = document.getElementById('popup-pareja');
                        const popupTitulo = document.getElementById('popup-pareja-titulo');
                        const popupMensaje = document.getElementById('popup-mensaje');

                        // Asegúrate de que el popup y sus elementos estén visibles
                        popup.style.display = 'flex';
                        popupMensaje.setAttribute('tabindex', '0'); // Asegúrate de que popupMensaje sea focoable
                        

                        switch (parejaId) {
                                // Contenido del popup según parejaId
                                case '1':
                                        popupTitulo.innerText = '¡Teclado encontrado!';
                                        popupMensaje.innerText = '¡Buen trabajo! Has encontrado la pareja del teclado. Es el dispositivo que utilizas para escribir en tu computadora, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '2':
                                        popupTitulo.innerText = '¡Ratón encontrado!';
                                        popupMensaje.innerText = '¡Excelente! Has encontrado la pareja del ratón. Es el dispositivo que utilizas para mover el cursor en tu computadora, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '3':
                                        popupTitulo.innerText = '¡Procesador encontrado!';
                                        popupMensaje.innerText = '¡Genial! Has encontrado la pareja del procesador. Es el cerebro de tu computadora, encargado de ejecutar instrucciones y procesar datos, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '4':
                                        popupTitulo.innerText = '¡Parlantes encontrados!';
                                        popupMensaje.innerText = '¡Bien hecho! Has encontrado la pareja de los parlantes. Es un dispositivo que permite escuchar el audio de la computadora, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '5':
                                        popupTitulo.innerText = '¡Auriculares encontrados!';
                                        popupMensaje.innerText = '¡Muy bien! Has encontrado la pareja de los auriculares. Son ideales para escuchar audio de forma privada, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '6':
                                        popupTitulo.innerText = '¡Monitor encontrado!';
                                        popupMensaje.innerText = '¡Increíble! Has encontrado la pareja del monitor. Es la pantalla que muestra la interfaz gráfica y el contenido de tu computadora, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '7':
                                        popupTitulo.innerText = '¡Micrófono encontrado!';
                                        popupMensaje.innerText = '¡Perfecto! Has encontrado la pareja del micrófono. Es esencial para grabar voz y sonidos, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '8':
                                        popupTitulo.innerText = '¡USB encontrado!';
                                        popupMensaje.innerText = '¡Excelente! Has encontrado la pareja del USB. Este pequeño dispositivo es capaz de mover información contigo a donde tú quieras, aunque ahora esté más de moda el almacenamiento en la nube, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '9':
                                        popupTitulo.innerText = '¡Placa madre encontrada!';
                                        popupMensaje.innerText = '¡Fantástico! Has encontrado la pareja de la placa madre. Es el componente principal que conecta todos los demás elementos de la computadora, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '10':
                                        popupTitulo.innerText = '¡Impresora encontrada!';
                                        popupMensaje.innerText = '¡Genial! Has encontrado la pareja de la impresora. Permite que tu computadora imprima documentos y fotos en papel, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '11':
                                        popupTitulo.innerText = '¡Lector de discos encontrado!';
                                        popupMensaje.innerText = '¡Muy bien! Has encontrado la pareja del lector de discos. Es el dispositivo que lee CDs y DVDs en tu computadora, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '12':
                                        popupTitulo.innerText = '¡RAM encontrada!';
                                        popupMensaje.innerText = '¡Perfecto! Has encontrado la pareja de la RAM. Es la memoria volátil que almacena datos temporales para un acceso rápido, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '13':
                                        popupTitulo.innerText = '¡Case de PC encontrado!';
                                        popupMensaje.innerText = '¡Increíble! Has encontrado la pareja del case de PC. Es la caja que alberga y protege todos los componentes internos de la computadora, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '14':
                                        popupTitulo.innerText = '¡Webcam encontrada!';
                                        popupMensaje.innerText = '¡Genial! Has encontrado la pareja de la webcam. Es útil para realizar videollamadas y grabar video, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '15':
                                        popupTitulo.innerText = '¡Cable de red encontrado!';
                                        popupMensaje.innerText = '¡Muy bien! Has encontrado la pareja del cable de red RJ45. Es el medio para conectar tu computadora a una red local o a Internet, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                                case '16':
                                        popupTitulo.innerText = '¡Lector de huella encontrado!';
                                        popupMensaje.innerText = '¡Perfecto! Has encontrado la pareja del lector de huella. Proporciona una capa adicional de seguridad al autenticar usuarios mediante sus huellas dactilares, para volver al juego también puedes usar la tecla [ESC]';
                                        break;
                        }
                        popupMensaje.focus();

                        // Pausar el temporizador cuando se muestra el popup
                        if (window.pauseTimer) {
                                window.pauseTimer();
                        }

                        cerrarPopupPareja.addEventListener('click', () => {
                                popup.style.display = 'none';
                                if (window.resumeTimer) {
                                        window.resumeTimer(); // Reanudar el temporizador
                                }
                        });
                }

                cartas.forEach(carta => {
                        carta.addEventListener('click', voltearCarta);
                        carta.addEventListener('keypress', presionarCarta);
                });

                document.addEventListener('keydown', manejarTecla);

                botonReportar.addEventListener('click', () => {
                        popupReportar.style.display = 'flex';
                        if (window.pauseTimer) {
                                window.pauseTimer(); // Pausar el temporizador
                        }
                        formReportar.focus();
                });

                cerrarReportar.addEventListener('click', () => {
                        popupReportar.style.display = 'none';
                        if (window.resumeTimer) {
                                window.resumeTimer(); // Reanudar el temporizador
                        }
                });

                botonInfo.addEventListener('click', () => {
                        popupInfo.style.display = 'flex';
                        if (window.pauseTimer) {
                                window.pauseTimer(); // Pausar el temporizador
                        }
                        popupInfo.focus();
                });

                cerrarInfo.addEventListener('click', () => {
                        popupInfo.style.display = 'none';
                        if (window.resumeTimer) {
                                window.resumeTimer(); // Reanudar el temporizador
                        }
                });

                formReportar.addEventListener('submit', (event) => {
                        event.preventDefault();
                        alert("Nuestro equipo revisará la información, muchas gracias por tu ayuda")
                        window.location.href = 'niveles.html';
                });
        }

        function redirigirANiveles() {
                window.location.href = 'niveles.html';
        }
});
