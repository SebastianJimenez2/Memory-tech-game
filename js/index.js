// script.js
function cambiarInterfaz() {
        window.location.href = 'niveles.html';
}


document.addEventListener('DOMContentLoaded', function () {
        // Obtener el botón de Iniciar
        const iniciarBtn = document.getElementById('iniciarBtn');

        // Añadir el evento de clic para redirigir al usuario
        iniciarBtn.addEventListener('click', cambiarInterfaz);

        // Puedes agregar más funcionalidades para el botón de Opciones aquí si es necesario
        const opcionesBtn = document.getElementById('opcionesBtn');
        opcionesBtn.addEventListener('click', function () {
                alert('Opciones todavía no está disponible.');
        });
});


