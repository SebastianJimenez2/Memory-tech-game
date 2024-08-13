document.addEventListener('DOMContentLoaded', () => {
        const cartasGrid = document.getElementById('cartas-grid');
        const urlParams = new URLSearchParams(window.location.search);
        const nivel = urlParams.get('nivel');

        let numCartas;
        switch (nivel) {
                case 'principiante':
                        numCartas = 4;
                        break;
                case 'intermedio':
                        numCartas = 8;
                        break;
                case 'avanzado':
                        numCartas = 16;
                        break;
                default:
                        numCartas = 4;
        }

        const cartas = generarCartas(numCartas);
        cartasGrid.innerHTML = '';
        cartas.forEach(carta => {
                cartasGrid.appendChild(carta);
        });

        inicializarJuego();

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
                        });
                }

                cartas.forEach(carta => carta.addEventListener('click', voltearCarta));
        }
});
