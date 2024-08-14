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


        let numCartas;
        let tiempoInicial;
        switch (nivel) {
                case 'principiante':
                        numCartas = 8;
                        tiempoInicial = 1 * 60 * 1000; // 1 minuto en milisegundos
                        break;
                case 'intermedio':
                        numCartas = 16;
                        tiempoInicial = 3 * 60 * 1000; // 3 minutos en milisegundos
                        break;
                case 'avanzado':
                        numCartas = 32;
                        tiempoInicial = 5 * 60 * 1000; // 5 minutos en milisegundos
                        break;
                default:
                        numCartas = 8;
                        tiempoInicial = 5 * 60 * 1000; // Valor predeterminado
        }

        const cartas = generarCartas(numCartas);
        cartasGrid.innerHTML = '';
        cartas.forEach(carta => {
                cartasGrid.appendChild(carta);
        });

        inicializarJuego();

        // Configurar el temporizador
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

                // Mezclar las cartas
                return cartas.sort(() => 0.5 - Math.random());
        }

        function inicializarJuego() {
                const cartas = document.querySelectorAll('.carta');
                let cartaVolteada = false;
                let primeraCarta, segundaCarta;
                let bloqueoTablero = false;
                let parejasEncontradas = 0;
                const totalParejas = numCartas / 2;

                // Función para alternar el estado del sonido
                function toggleSound() {
                        soundOn = !soundOn;
                        if (soundOn) {
                                bgMusic.play();
                                soundIcon.src = 'img/sound-icon.png'; // Ícono de sonido activado
                        } else {
                                bgMusic.pause();
                                soundIcon.src = 'img/sound-muted-icon.png'; // Ícono de sonido desactivado
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

                        // Verificar si todas las cartas han sido emparejadas
                        const todasEmparejadas = document.querySelectorAll('.carta.matched').length === numCartas;
                        if (todasEmparejadas) {
                                mostrarPopup();
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
                        const popup = document.getElementById('popup-felicitaciones');
                        popup.style.display = 'flex'; // Mostrar el pop-up

                        // Pausar el temporizador cuando se muestra el pop-up
                        if (window.pauseTimer) {
                                window.pauseTimer();
                        }

                        const botonCerrar = document.getElementById('cerrar-popup');
                        botonCerrar.addEventListener('click', () => {
                                popup.style.display = 'none'; // Ocultar el pop-up al hacer clic en "Cerrar"
                                window.location.href = 'niveles.html';
                        });
                }

                function presionarCarta(event) {
                        if (event.key === 'Enter') {
                                voltearCarta.call(event.currentTarget);
                        }
                }

                function mostrarMensajeParejaEncontrada() {
                        const mensaje = document.createElement('div');
                        mensaje.classList.add('mensaje-pareja');
                        mensaje.innerText = '¡Pareja encontrada!';

                        document.body.appendChild(mensaje);
                        setTimeout(() => {
                                mensaje.remove();
                        }, 2000); // El mensaje se mostrará durante 2 segundos
                }

                // Manejar la pausa y reanudación del juego
                pausaButton.addEventListener('click', () => {
                        if (juegoPausado) {
                                reanudarJuego();
                        } else {
                                pausarJuego();
                        }
                });

                function pausarJuego() {
                        juegoPausado = true;
                        pausaButton.src = 'img/play-icon.png'; // Cambiar el ícono para mostrar que el juego está pausado
                        mensajePausa.style.display = 'block'; // Mostrar el mensaje de pausa
                        // Detener el temporizador
                        if (window.pauseTimer) {
                                window.pauseTimer();
                        }
                }

                function reanudarJuego() {
                        juegoPausado = false;
                        pausaButton.src = 'img/pause-icon.png'; // Cambiar el ícono para mostrar que el juego está reanudado
                        mensajePausa.style.display = 'none'; // Ocultar el mensaje de pausa
                        // Reiniciar el temporizador
                        if (window.resumeTimer) {
                                window.resumeTimer();
                        }
                }

                function mostrarPopupPareja(parejaId) {
                        const popup = document.getElementById('popup-pareja');
                        const popupTitulo = document.getElementById('popup-titulo');
                        const popupMensaje = document.getElementById('popup-mensaje');

                        // Personalizar el contenido del pop-up según la pareja encontrada
                        switch (parejaId) {
                                case '1':
                                        popupTitulo.innerText = '¡Teclado encontrado!';
                                        popupMensaje.innerText = '¡Excelente! Has encontrado la pareja del teclado. Es el dispositivo principal para introducir datos en tu computadora.';
                                        break;
                                case '2':
                                        popupTitulo.innerText = '¡Mouse encontrado!';
                                        popupMensaje.innerText = '¡Perfecto! Has encontrado la pareja del mouse. Es el periférico que facilita la navegación en la interfaz gráfica.';
                                        break;
                                case '3':
                                        popupTitulo.innerText = '¡Procesador encontrado!';
                                        popupMensaje.innerText = '¡Genial! Has encontrado la pareja del procesador. Es el cerebro de tu computadora, encargado de ejecutar instrucciones y procesar datos.';
                                        break;
                                case '4':
                                        popupTitulo.innerText = '¡Parlantes encontrados!';
                                        popupMensaje.innerText = 'Fantástico! Has encontrado la pareja de los parlantes. Permiten que tu computadora reproduzca sonido y música.';
                                        break;
                                case '5':
                                        popupTitulo.innerText = '¡Auriculares encontrados!';
                                        popupMensaje.innerText = '¡Muy bien! Has encontrado la pareja de los auriculares. Son ideales para escuchar audio de forma privada.';
                                        break;
                                case '6':
                                        popupTitulo.innerText = '¡Monitor encontrado!';
                                        popupMensaje.innerText = '¡Increíble! Has encontrado la pareja del monitor. Es la pantalla que muestra la interfaz gráfica y el contenido de tu computadora.';
                                        break;
                                case '7':
                                        popupTitulo.innerText = '¡Micrófono encontrado!';
                                        popupMensaje.innerText = '¡Perfecto! Has encontrado la pareja del micrófono. Es esencial para grabar voz y sonidos.';
                                        break;
                                case '8':
                                        popupTitulo.innerText = '¡USB encontrado!';
                                        popupMensaje.innerText = '¡Excelente! Has encontrado la pareja del USB. Este pequeño dispositivo es capaz de mover información contigo a donde tú quieras, aunque ahora esté más de moda el almacenamiento en la nube.';
                                        break;
                                case '9':
                                        popupTitulo.innerText = '¡Placa madre encontrada!';
                                        popupMensaje.innerText = '¡Fantástico! Has encontrado la pareja de la placa madre. Es el componente principal que conecta todos los demás elementos de la computadora.';
                                        break;
                                case '10':
                                        popupTitulo.innerText = '¡Impresora encontrado!';
                                        popupMensaje.innerText = '¡Genial! Has encontrado la pareja de la impresora. Permite que tu computadora imprima documentos y fotos en papel.';
                                        break;
                                case '11':
                                        popupTitulo.innerText = '¡Lector de discos encontrado!';
                                        popupMensaje.innerText = '¡Muy bien! Has encontrado la pareja del lector de discos. Es el dispositivo que lee CDs y DVDs en tu computadora.';
                                        break;
                                case '12':
                                        popupTitulo.innerText = '¡RAM encontrada!';
                                        popupMensaje.innerText = '¡Perfecto! Has encontrado la pareja de la RAM. Es la memoria volátil que almacena datos temporales para un acceso rápido.';
                                        break;
                                case '13':
                                        popupTitulo.innerText = '¡Case de PC encontrado!';
                                        popupMensaje.innerText = '¡Increíble! Has encontrado la pareja del case de PC. Es la caja que alberga y protege todos los componentes internos de la computadora.';
                                        break;
                                case '14':
                                        popupTitulo.innerText = '¡Webcam encontrada!';
                                        popupMensaje.innerText = '¡Genial! Has encontrado la pareja de la webcam. Es útil para realizar videollamadas y grabar video.';
                                        break;
                                case '15':
                                        popupTitulo.innerText = '¡Cable de red encontrado!';
                                        popupMensaje.innerText = '¡Muy bien! Has encontrado la pareja del cable de red RJ45. Es el medio para conectar tu computadora a una red local o a Internet.';
                                        break;
                                case '16':
                                        popupTitulo.innerText = '¡Lector de huella encontrado!';
                                        popupMensaje.innerText = '¡Perfecto! Has encontrado la pareja del lector de huella. Proporciona una capa adicional de seguridad al autenticar usuarios mediante sus huellas dactilares.';
                                        break;
                                default:
                                        popupTitulo.innerText = '¡Pareja Encontrada!';
                                        popupMensaje.innerText = '¡Buen trabajo! Has encontrado una pareja.';
                                        break;
                        }

                        popup.style.display = 'flex'; // Mostrar el pop-up

                        // Pausar el temporizador cuando se muestra el pop-up
                        if (window.pauseTimer) {
                                window.pauseTimer();
                        }

                        const botonCerrar = document.getElementById('cerrar-popup-pareja');
                        botonCerrar.addEventListener('click', () => {
                                popup.style.display = 'none'; // Ocultar el pop-up al hacer clic en "Cerrar"
                                // Reanudar el temporizador cuando se cierra el pop-up
                                if (window.resumeTimer) {
                                        window.resumeTimer();
                                }
                        });
                }

                // Mostrar el pop-up
                botonReportar.addEventListener('click', () => {
                        popupReportar.style.display = 'flex';
                });

                // Cerrar el pop-up
                cerrarReportar.addEventListener('click', () => {
                        popupReportar.style.display = 'none';
                });

                // Manejar el envío del formulario
                formReportar.addEventListener('submit', (event) => {
                        event.preventDefault(); // Evitar el envío por defecto

                        const descripcion = document.getElementById('descripcion').value;

                        console.log('Descripción del problema:', descripcion);

                        // Limpiar el formulario y cerrar el pop-up
                        formReportar.reset();
                        popupReportar.style.display = 'none';

                        alert('Gracias por tu reporte. Nuestro equipo lo revisará pronto.');
                });

                // Mostrar el pop-up de información al presionar el ícono
                botonInfo.addEventListener('click', () => {
                        popupInfo.style.display = 'flex';
                });

                // Cerrar el pop-up de información
                cerrarInfo.addEventListener('click', () => {
                        popupInfo.style.display = 'none';
                });


                cartas.forEach(carta => carta.addEventListener('click', voltearCarta));
                cartas.forEach((carta, index) => carta.setAttribute('tabindex', index + 2));
                cartas.forEach(carta => carta.addEventListener('keypress', presionarCarta));
        }
});
