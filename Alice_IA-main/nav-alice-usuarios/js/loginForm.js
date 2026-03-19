// Importamos la función de la SDK para el inicio de sesión
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { auth as firebaseAuth, displayErrorAlert, displaySuccessAlert } from "./auth_firebase.js";

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

            // 🛠️ ROBUSTEZ: Verifica que firebaseAuth esté disponible antes de hacer la llamada.
            if (!firebaseAuth) {
                console.error("Error FATAL: La instancia de autenticación de Firebase no fue cargada correctamente.");
                // Usamos SweetAlert2 directamente si las funciones de alerta no se cargaron.
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Configuración',
                    text: 'El servicio de autenticación no está disponible. Verifique el archivo auth_firebase.js.'
                });
                return;
            }

            try {
                // Usamos firebaseAuth, la instancia importada correctamente
                const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password);
                console.log("Credenciales:", credentials);

                displaySuccessAlert("¡Bienvenido!", "Inicio de sesión exitoso.", "../nav-alice-chatbot/index.html");

            } catch (error) {
                console.error("Error de Login:", error);

                // Manejo de errores de inicio de sesión
                if (error.code === 'auth/user-not-found') {
                    displayErrorAlert("Credenciales Inválidas", "Correo electrónico o contraseña incorrectos.");
                } else if (error.code === 'auth/invalid-email') {
                    displayErrorAlert("Email Inválido", "El formato del correo electrónico es incorrecto.");
                } else if (error.code === 'auth/wrong-password') {
                    displayErrorAlert("Contraseña Inválida", "La contraseña proporcionada no es válida.");
                } else if (error.code === 'auth/user-disabled') {
                    displayErrorAlert("Usuario Deshabilitado", "Esta cuenta ha sido deshabilitada. Contacta al soporte.");
                } else if (error.code === 'auth/too-many-requests') {
                    displayErrorAlert("Demasiados Intentos", "Hemos bloqueado todas las solicitudes de este dispositivo debido a actividad inusual. Intente más tarde.");
                } else {
                    displayErrorAlert("Error Desconocido", "Ocurrió un error al intentar iniciar sesión. Intente más tarde.");
                }
            }
        });
    } else {
        console.error("Error: Elemento 'login-form' no encontrado en el DOM.");
    }
});
