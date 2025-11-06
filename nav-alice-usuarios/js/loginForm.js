import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { auth, displayErrorAlert, displaySuccessAlert } from "./auth_firebase.js";


// Nuevo: Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo ahora buscamos el elemento
    const loginForm = document.querySelector("#login-form");

    // Siempre es bueno verificar si el elemento existe antes de usarlo
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm['login-email'].value;
            const password = loginForm['login-password'].value;

            try {
                const credentials = await signInWithEmailAndPassword(auth, email, password);
                console.log(credentials);
                // Si el login es exitoso, podrías redirigir aquí.
                // window.location.href = 'index.html'; 
            } catch (error) {
                console.error(error);
                displayErrorAlert("Error al iniciar sesión: Credenciales inválidas o error de red.");
            }
        });
    } else {
        console.error("Error: Elemento 'login-form' no encontrado en el DOM.");
    }
});