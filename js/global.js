function presionarConTeclado(event, paginaRedireccion) {
    if (event.key === 'Enter') {
            window.location.href = paginaRedireccion
    }
}