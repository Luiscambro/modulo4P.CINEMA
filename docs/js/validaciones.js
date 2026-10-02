const formulario = document.querySelector(".contact-form");

function isValidEmail(email) {
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronEmail.test(email);
}

if (formulario) {
    formulario.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita que el formulario se envíe automáticamente

        const nombre = document.getElementById("name").value.trim();
        const edad = Number(document.getElementById("age").value);
        const email = document.getElementById("email").value.trim();
        const mensaje = document.getElementById("message").value.trim();

        if (nombre === "" || nombre.length < 2) {
            document.getElementById("errorNombre").textContent = "Por favor, ingresa tu nombre.";
            return;
        }

        if (document.getElementById("age").value === "" || isNaN(edad) || edad < 18) {
            document.getElementById("errorEdad").textContent = "Por favor, ingresa una edad válida (mayor de 18 años).";
            return;
        }

        if (email === "" || !isValidEmail(email)) {
            document.getElementById("errorEmail").textContent = "Por favor, ingresa un email válido.";
            return;
        }

        if (mensaje === "") {
            document.getElementById("errorMensaje").textContent = "Por favor, ingresa un mensaje.";
            return;
        }

        // Si todas las validaciones pasan, se puede enviar el formulario
        formulario.submit();
    });
}