import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js';
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"; // ⚠️ IMPORTANTE PARA EL CHAT

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
const db = getFirestore(app); // ⚠️ IMPORTANTE: Inicializamos la BD
const analytics = getAnalytics(app);

// Exportamos auth, db y las alertas para que otros archivos (script.js) las usen
export { auth, db, displayErrorAlert, displaySuccessAlert };

// --- FUNCIONES DE ALERTA (SweetAlert2) ---
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
        timer: 1500
    }).then(() => {
        if (redirectUrl) window.location.href = redirectUrl;
    });
}

// --- INICIO DE SESIÓN CON GOOGLE ---
function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log('Usuario autenticado con Google:', result.user);
            // Redirige a index.html (el chat)
            displaySuccessAlert('Inicio de sesión exitoso', 'Has iniciado sesión con Google.', 'index.html');
        })
        .catch((error) => {
            console.error("Error Google:", error.message);
            let errorMessage = "Ocurrió un error inesperado.";
            if (error.code === 'auth/popup-closed-by-user') errorMessage = "Se canceló el inicio de sesión.";
            displayErrorAlert("Error de Google", errorMessage);
        });
}

// Asignar evento al botón de Google (si existe en el HTML)
const googleBtn = document.getElementById("btn-google");
if (googleBtn) {
    googleBtn.addEventListener("click", signInWithGoogle);
}

// --- VALIDACIÓN DE CONTRASEÑA Y REGISTRO ---

const min_password_length = 8;
const signInEmailPassword = document.querySelector("#signin-form");
const passwordInput = document.querySelector("#signin_password");
const confirmPasswordInput = document.querySelector("#signin_confirm_password");

// Elementos UI de validación
const lengthItem = document.querySelector("#val-length");
const uppercaseItem = document.querySelector("#val-uppercase");
const numberItem = document.querySelector("#val-number");
const matchItem = document.querySelector("#val-match");

function validatePassword(password, confirmPassword) {
    return {
        isLengthValid: password.length >= min_password_length,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        passwordsMatch: password === confirmPassword && confirmPassword.length > 0
    };
}

function updateValidationUI(results) {
    const applyStyle = (element, isValid) => {
        if (element) {
            element.classList.toggle('valid', isValid);
            element.classList.toggle('invalid', !isValid);
        }
    };
    applyStyle(lengthItem, results.isLengthValid);
    applyStyle(uppercaseItem, results.hasUppercase);
    applyStyle(numberItem, results.hasNumber);
    applyStyle(matchItem, results.passwordsMatch);
}

// Eventos de input (validación en tiempo real)
if (passwordInput && confirmPasswordInput) {
    const handleValidation = () => {
        updateValidationUI(validatePassword(passwordInput.value, confirmPasswordInput.value));
    };
    passwordInput.addEventListener('input', handleValidation);
    confirmPasswordInput.addEventListener('input', handleValidation);
}

// --- ENVÍO DEL FORMULARIO DE REGISTRO ---
if (signInEmailPassword) {
    signInEmailPassword.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signin_email').value;
        const password = document.getElementById('signin_password').value;
        const confirmPassword = document.getElementById('signin_confirm_password').value;

        // Validar antes de enviar
        const validationResults = validatePassword(password, confirmPassword);
        const isPasswordValid = validationResults.isLengthValid && validationResults.hasUppercase && validationResults.hasNumber;

        if (password !== confirmPassword) {
            displayErrorAlert("Error", "Las contraseñas no coinciden.");
            updateValidationUI(validationResults);
            return;
        }

        if (!isPasswordValid) {
            displayErrorAlert("Contraseña Débil", "Revisa los requisitos en rojo.");
            updateValidationUI(validationResults);
            return;
        }

        try {
            // Crear usuario en Firebase
            await createUserWithEmailAndPassword(auth, email, password);
            
            // Redirigir al chat (index.html)
            displaySuccessAlert("¡Cuenta Creada!", "Bienvenido a Alice IA.", "index.html");

        } catch (error) {
            console.error("Error Registro:", error);
            if (error.code === 'auth/email-already-in-use') {
                displayErrorAlert("Email en uso", "Este correo ya está registrado.");
            } else if (error.code === 'auth/invalid-email') {
                displayErrorAlert("Email inválido", "El formato del correo no es correcto.");
            } else {
                displayErrorAlert("Error", error.message);
            }
        }
    });
}