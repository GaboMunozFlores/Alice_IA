import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js';


export { auth, displayErrorAlert, displaySuccessAlert };

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


// --- NUEVA LÓGICA DE VALIDACIÓN DE CONTRASEÑA ---

const min_password_length = 8;
const signInEmailPassword = document.querySelector("#signin-form");
const passwordInput = document.querySelector("#signin_password");
const confirmPasswordInput = document.querySelector("#signin_confirm_password");
const validationList = document.querySelector("#password-validation-list");

// Referencias a los elementos de la lista de validación
const lengthItem = document.querySelector("#val-length");
const uppercaseItem = document.querySelector("#val-uppercase");
const numberItem = document.querySelector("#val-number");
const matchItem = document.querySelector("#val-match");

/**
 * Evalúa una contraseña contra las reglas de complejidad.
 * @param {string} password - La contraseña a validar.
 * @returns {object} Un objeto con las condiciones cumplidas.
 */
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

/**
 * Actualiza la lista de validación con los estilos (clases de color).
 * @param {object} validationResults - Resultado de validatePassword.
 */
function updateValidationUI(validationResults) {
    const { isLengthValid, hasUppercase, hasNumber, passwordsMatch } = validationResults;

    // Función auxiliar para aplicar el estilo
    const applyStyle = (element, isValid) => {
        // En tu CSS deberías definir estas clases. Por ejemplo:
        // .valid { color: green; }
        // .invalid { color: red; }
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

// Escuchadores de eventos para la validación en tiempo real
if (passwordInput && confirmPasswordInput) {
    const handleValidation = () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const results = validatePassword(password, confirmPassword);
        updateValidationUI(results);
    };

    passwordInput.addEventListener('input', handleValidation);
    confirmPasswordInput.addEventListener('input', handleValidation);
}

// --- Lógica del Formulario de Registro ---

if (signInEmailPassword) {

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
            updateValidationUI(validationResults); // Actualizar UI con el error
            return; // Detener la ejecución si no coinciden
        }

        if (!isPasswordValid) {
            let errorText = "La contraseña no cumple con todos los requisitos de seguridad: ";
            if (!validationResults.isLengthValid) errorText += "8+ caracteres, ";
            if (!validationResults.hasUppercase) errorText += "1+ mayúscula, ";
            if (!validationResults.hasNumber) errorText += "1+ número. ";
            // Eliminar la última coma/espacio si existe
            errorText = errorText.replace(/, $/, ".");

            displayErrorAlert("Contraseña Inválida", errorText);
            updateValidationUI(validationResults); // Actualizar UI con el error
            return; // Detener la ejecución si no es válida
        }
        // Fin de la validación de complejidad

        try {
            // Crear usuario con email y contraseña en Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            console.log(userCredential);
            // ✅ SweetAlert2 para éxito en Email/Password
            displaySuccessAlert("¡Cuenta Creada!", "Registro exitoso. Bienvenido.", "/Chatbot/01VistaChat.html");

        } catch (error) {
            console.error("Error de Registro:", error);

            // ✅ Lógica de manejo de errores de Firebase usando SweetAlert2
            if (error.code === 'auth/invalid-email') {
                displayErrorAlert("Email Inválido", "El formato del correo electrónico ingresado no es válido.");
            } else if (error.code === 'auth/weak-password') {
                // NOTA: Con la validación previa, este error de Firebase por 6 caracteres es menos probable,
                // pero se deja como respaldo.
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
}


// Asignar evento al botón de Google
document.getElementById("btn-google").addEventListener("click", signInWithGoogle);
console.log('Autenticación con Google habilitada.');