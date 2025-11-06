import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js';

const firebaseConfig = {
    apiKey: "AIzaSyCYBxXKhQkz07VK5cZW7R-vnZ5ABJvpI8o",
    authDomain: "alice-i4.firebaseapp.com",
    databaseURL: "https://alice-i4-default-rtdb.firebaseio.com",
    projectId: "alice-i4",
    storageBucket: "alice-i4.firebasestorage.app",
    messagingSenderId: "421473638243",
    appId: "1:421473638243:web:de39a5a29940442ef52556",
    measurementId: "G-VV2VYX8SNH"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

function displayErrorAlert(title, text) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: text,
        confirmButtonColor: '#3085d6'
    });
}


function displaySuccessAlert(title, text, redirectUrl) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        showConfirmButton: false,
        timer: 1500 // Ocultar después de 1.5 segundos
    }).then(() => {
        window.location.href = redirectUrl;
    });
}

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('Usuario autenticado con Google:', user);
            displaySuccessAlert('Inicio de sesión exitoso', 'Has iniciado sesión con Google.', 'index.html');
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google: ", error.message);

            let errorMessage = "Ocurrió un error inesperado al intentar iniciar sesión con Google.";
            // Mensaje específico para el usuario que cancela la ventana
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Se canceló la ventana de inicio de sesión de Google.";
            }

            // ✅ SweetAlert2 para errores en Google Sign In
            displayErrorAlert("Error de Google", errorMessage);
        });
}

const signInEmailPassword = document.querySelector("#signin-form") // Asegúrate que el ID es #signin-form
if (signInEmailPassword) {
    signInEmailPassword.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = signInEmailPassword['signin_email'].value
        const password = signInEmailPassword['signin_password'].value
        console.log("Intentando registrar:", email, password);

        try {
            // Crear usuario con email y contraseña en Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            console.log(userCredential);
            // ✅ SweetAlert2 para éxito en Email/Password
            displaySuccessAlert("¡Cuenta Creada!", "Registro exitoso. Bienvenido.", "index.html");

        } catch (error) {
            console.error("Error de Registro:", error);

            // ✅ Lógica de manejo de errores de Firebase usando SweetAlert2
            if (error.code === 'auth/invalid-email') {
                displayErrorAlert("Email Inválido", "El formato del correo electrónico ingresado no es válido.");
            } else if (error.code === 'auth/weak-password') {
                displayErrorAlert("Contraseña Débil", "La contraseña debe tener al menos 6 caracteres.");
            } else if (error.code === 'auth/email-already-in-use') {
                displayErrorAlert("Email en Uso", "El correo electrónico ya está registrado. Intente iniciar sesión.");
            } else {
                displayErrorAlert("Error Desconocido", "Ocurrió un error al intentar crear la cuenta.");
            }
        }
    });
}

// Asignar evento al botón de Google
document.getElementById("btn-google").addEventListener("click", signInWithGoogle);
console.log('Autenticación con Google habilitada.');