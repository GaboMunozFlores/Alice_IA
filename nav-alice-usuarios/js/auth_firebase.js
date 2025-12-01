import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// ✅ IMPORTANTE: Agregamos getFirestore para la base de datos
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"; 

import { firebaseConfig } from "../../firebase.js"; 

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ IMPORTANTE: Inicializamos la BD aquí

// ✅ IMPORTANTE: Agregamos 'db' a la lista de exports
export { auth, db, displayErrorAlert, displaySuccessAlert };

// --- Funciones de Alerta (SweetAlert2) ---
function displayErrorAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido'
    });
}

function displaySuccessAlert(title, text, redirectUrl) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000
    }).then(() => {
        if(redirectUrl) window.location.href = redirectUrl;
    });
}

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log('Usuario autenticado con Google:', result.user);
            displaySuccessAlert('Inicio de sesión exitoso', 'Has iniciado sesión con Google.', 'nav-alice-chatbot/index.php');
        })
        .catch((error) => {
            console.error("Error Google: ", error.message);
            let errorMessage = "Ocurrió un error inesperado.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Se canceló el inicio de sesión.";
            }
            displayErrorAlert("Error de Google", errorMessage);
        });
}

// --- LÓGICA DE VALIDACIÓN (Igual que antes) ---
const min_password_length = 8;

function validatePassword(password, confirmPassword) {
    const isLengthValid = password.length >= min_password_length;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    return { isLengthValid, hasUppercase, hasNumber, passwordsMatch };
}

function updateValidationUI(validationResults) {
    const { isLengthValid, hasUppercase, hasNumber, passwordsMatch } = validationResults;
    const lengthItem = document.querySelector("#val-length");
    const uppercaseItem = document.querySelector("#val-uppercase");
    const numberItem = document.querySelector("#val-number");
    const matchItem = document.querySelector("#val-match");

    const applyStyle = (element, isValid) => {
        if (element) {
            element.classList.toggle('valid', isValid);
            element.classList.toggle('invalid', !isValid);
            const estadoTexto = isValid ? "Requisito cumplido: " : "Requisito pendiente: ";
            element.setAttribute("aria-label", estadoTexto + element.innerText);
        }
    };

    applyStyle(lengthItem, isLengthValid);
    applyStyle(uppercaseItem, hasUppercase);
    applyStyle(numberItem, hasNumber);
    applyStyle(matchItem, passwordsMatch);
}

// --- EVENTOS DEL DOM ---
document.addEventListener('DOMContentLoaded', () => {
    const signInEmailPassword = document.querySelector("#signin-form");
    const passwordInput = document.querySelector("#signin_password");
    const confirmPasswordInput = document.querySelector("#signin_confirm_password");
    const btnGoogle = document.getElementById("btn-google");

    if (btnGoogle) btnGoogle.addEventListener("click", signInWithGoogle);

    if (signInEmailPassword && passwordInput && confirmPasswordInput) {
        const handleValidation = () => {
            const results = validatePassword(passwordInput.value, confirmPasswordInput.value);
            updateValidationUI(results);
            const isValid = results.isLengthValid && results.hasUppercase && results.hasNumber;
            passwordInput.setAttribute("aria-invalid", !isValid);
        };

        passwordInput.addEventListener('input', handleValidation);
        confirmPasswordInput.addEventListener('input', handleValidation);

        signInEmailPassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signin_email').value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            const validationResults = validatePassword(password, confirmPassword);
            const isPasswordValid = validationResults.isLengthValid && validationResults.hasUppercase && validationResults.hasNumber;

            if (password !== confirmPassword) {
                displayErrorAlert("Error", "Las contraseñas no coinciden.");
                updateValidationUI(validationResults);
                confirmPasswordInput.focus(); 
                return;
            }

            if (!isPasswordValid) {
                displayErrorAlert("Contraseña Débil", "Revisa los requisitos marcados en rojo.");
                updateValidationUI(validationResults);
                passwordInput.focus();
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                displaySuccessAlert("¡Cuenta Creada!", "Bienvenido a Alice IA.", "../nav-alice-chatbot/index.html");
            } catch (error) {
                console.error("Error Registro:", error);
                if (error.code === 'auth/email-already-in-use') {
                    displayErrorAlert("Email en uso", "Este correo ya está registrado.");
                } else if (error.code === 'auth/invalid-email') {
                    displayErrorAlert("Email inválido", "El formato del correo no es correcto.");
                } else if (error.code === 'auth/weak-password') {
                    displayErrorAlert("Contraseña Débil", "Firebase requiere al menos 6 caracteres.");
                } else {
                    displayErrorAlert("Error", error.message);
                }
            }
        });
    }
});