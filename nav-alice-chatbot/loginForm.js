import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// RUTA CRÍTICA CORREGIDA: Usa './' porque auth_firebase.js está en la misma carpeta.
import { auth, displayErrorAlert, displaySuccessAlert } from "..nav-alice-usuarios/js/auth_firebase.js";

// Esperamos a que el DOM esté completamente cargado para encontrar el formulario
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.querySelector("#login-form");

    if (loginForm) {
        // Este evento DEBE ejecutarse para prevenir el error 405.
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginForm['login-email'].value;
            const password = loginForm['login-password'].value;

            console.log("Intentando iniciar sesión con:", email, password);

            try {
                const credentials = await signInWithEmailAndPassword(auth, email, password);
                console.log("Credenciales:", credentials);

                displaySuccessAlert("¡Bienvenido!", "Inicio de sesión exitoso.", "index.html");

            } catch (error) {
                console.error("Error de Login:", error);

                // Manejo de errores de inicio de sesión
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    displayErrorAlert("Credenciales Inválidas", "Correo electrónico o contraseña incorrectos.");
                } else if (error.code === 'auth/invalid-email') {
                    displayErrorAlert("Email Inválido", "El formato del correo electrónico es incorrecto.");
                } else {
                    displayErrorAlert("Error Desconocido", "Ocurrió un error al intentar iniciar sesión. Intente más tarde.");
                }
            }
        });
    } else {
        console.error("Error: Elemento 'login-form' no encontrado en el DOM.");
    }
});