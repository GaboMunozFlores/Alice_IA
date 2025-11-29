import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js';
import { firebaseConfig } from "../../firebase.js"; // Se asume que firebase.js solo exporta la configuración

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);

export { auth, displayErrorAlert, displaySuccessAlert };

// --- Funciones de Alerta ---
function displayErrorAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#3085d6'
        
    });
}


function displaySuccessAlert(title, text, redirectUrl) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000 // Ocultar después de 2 segundos
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
            displaySuccessAlert('Inicio de sesión exitoso', 'Has iniciado sesión con Google.', 'nav-alice-chatbot/index.php');
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


// --- LÓGICA DE VALIDACIÓN (Funciones) ---

const min_password_length = 8; // Mantenemos esta constante fuera del DOMContentLoaded

function validatePassword(password, confirmPassword) {
    const isLengthValid = password.length >= min_password_length;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    return {
        isLengthValid,
        hasUppercase,
        hasNumber,
        passwordsMatch
    };
}

function updateValidationUI(validationResults) {
    const { isLengthValid, hasUppercase, hasNumber, passwordsMatch } = validationResults;
    // Debemos obtener estas referencias dentro de DOMContentLoaded o pasarlas como argumentos.
    // Aquí usamos querySelector dentro de DOMContentLoaded

    const lengthItem = document.querySelector("#val-length");
    const uppercaseItem = document.querySelector("#val-uppercase");
    const numberItem = document.querySelector("#val-number");
    const matchItem = document.querySelector("#val-match");

    const applyStyle = (element, isValid) => {
        if (element) {
            element.classList.toggle('valid', isValid);
            element.classList.toggle('invalid', !isValid);
        }
    };

    applyStyle(lengthItem, isLengthValid);
    applyStyle(uppercaseItem, hasUppercase);
    applyStyle(numberItem, hasNumber);
    applyStyle(matchItem, passwordsMatch);
}


// ----------------------------------------------------------------------
// 🛠️ SECCIÓN CORREGIDA: Inicialización de Eventos y Elementos DOM
// Toda la lógica que interactúa con elementos de la página debe ir aquí dentro.
document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias a elementos del formulario de registro (signin.html) ---
    const signInEmailPassword = document.querySelector("#signin-form");
    const passwordInput = document.querySelector("#signin_password");
    const confirmPasswordInput = document.querySelector("#signin_confirm_password");

    // --- Asignar evento al botón de Google (btn-google solo existe en signin.html) ---
    const btnGoogle = document.getElementById("btn-google");

    if (btnGoogle) {
        btnGoogle.addEventListener("click", signInWithGoogle);
        console.log('Autenticación con Google habilitada.');
    }


    // --- 1. Lógica del Formulario de Registro (signin-form) ---
    if (signInEmailPassword && passwordInput && confirmPasswordInput) {

        // Escuchadores de eventos para la validación en tiempo real
        const handleValidation = () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const results = validatePassword(password, confirmPassword);
            updateValidationUI(results);
        };

        passwordInput.addEventListener('input', handleValidation);
        confirmPasswordInput.addEventListener('input', handleValidation);


        // Manejador del submit
        signInEmailPassword.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = signInEmailPassword['signin_email'].value
            const password = signInEmailPassword['signin_password'].value
            const confirmPassword = signInEmailPassword['signin_confirm_password'].value
            console.log("Intentando registrar:", email, password);

            // 1. **Validación de complejidad y coincidencia de contraseñas**
            const validationResults = validatePassword(password, confirmPassword);
            const isPasswordValid = validationResults.isLengthValid &&
                validationResults.hasUppercase &&
                validationResults.hasNumber;

            if (password !== confirmPassword) {
                displayErrorAlert("Contraseñas No Coinciden", "Por favor, asegúrate de que ambas contraseñas coincidan.");
                updateValidationUI(validationResults);
                return;
            }

            if (!isPasswordValid) {
                let errorText = "La contraseña no cumple con todos los requisitos de seguridad: ";
                if (!validationResults.isLengthValid) errorText += "8+ caracteres, ";
                if (!validationResults.hasUppercase) errorText += "1+ mayúscula, ";
                if (!validationResults.hasNumber) errorText += "1+ número. ";
                errorText = errorText.replace(/, $/, ".");

                displayErrorAlert("Contraseña Inválida", errorText);
                updateValidationUI(validationResults);
                return;
            }

            try {
                // Crear usuario con email y contraseña en Firebase
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                console.log(userCredential);
                displaySuccessAlert("¡Cuenta Creada!", "Registro exitoso. Bienvenido.", "/Chatbot/01VistaChat.html");

            } catch (error) {
                console.error("Error de Registro:", error);

                // Lógica de manejo de errores de Firebase
                if (error.code === 'auth/invalid-email') {
                    displayErrorAlert("Email Inválido", "El formato del correo electrónico ingresado no es válido.");
                } else if (error.code === 'auth/weak-password') {
                    displayErrorAlert("Contraseña Débil", "La contraseña es muy débil (Firebase requiere al menos 6 caracteres).");
                } else if (error.code === 'auth/email-already-in-use') {
                    displayErrorAlert("Email en Uso", "El correo electrónico ya está registrado. Intente iniciar sesión.");
                } else if (error.code === 'auth/network-request-failed') {
                    displayErrorAlert("Error de Conexión", "No se pudo conectar a la red. Verifique su conexión a Internet.");
                } else if (error.code === 'auth/operation-not-allowed') {
                    displayErrorAlert("Operación No Permitida", "El registro con correo y contraseña no está habilitado.");
                } else if (error.code === 'auth/too-many-requests') {
                    displayErrorAlert("Demasiados Intentos", "Hemos bloqueado todas las solicitudes desde este dispositivo debido a una actividad inusual. Intente más tarde.");
                } else {
                    displayErrorAlert("Error Desconocido", "Ocurrió un error al intentar crear la cuenta.");
                }
            }
        });
    } else {
        // console.log("Formulario de registro no encontrado. Asumiendo página de Login o error.");
    }
});
