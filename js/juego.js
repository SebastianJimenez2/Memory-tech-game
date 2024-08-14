document.addEventListener('DOMContentLoaded', () => {
        const cartasGrid = document.getElementById('cartas-grid');
        const urlParams = new URLSearchParams(window.location.search);
        const nivel = urlParams.get('nivel');

        const bgMusic = document.getElementById('bg-music');
        const soundIcon = document.getElementById('sonido');
        let soundOn = false;


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

                        const botonCerrar = document.getElementById('cerrar-popup');
                        botonCerrar.addEventListener('click', () => {
                                popup.style.display = 'none'; // Ocultar el pop-up al hacer clic en "Cerrar"
                                window.location.href = 'niveles.html'; 
                        });
                }

                function presionarCarta(event){
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


                cartas.forEach(carta => carta.addEventListener('click', voltearCarta));
                cartas.forEach((carta,index) => carta.setAttribute('tabindex',index+2));
                cartas.forEach(carta => carta.addEventListener('keypress', presionarCarta));
        }
});
        