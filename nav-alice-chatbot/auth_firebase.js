import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// Asegúrate de que esta ruta sea correcta según tu estructura de carpetas:
import { firebaseConfig } from "../../firebase.js"; 

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, displayErrorAlert, displaySuccessAlert };

// --- Funciones de Alerta (SweetAlert2) ---
function displayErrorAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#d33', // Rojo estándar para errores
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

// --- LÓGICA DE VALIDACIÓN ---
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
            // Cambio visual (colores)
            element.classList.toggle('valid', isValid);
            element.classList.toggle('invalid', !isValid);
            
            // ♿ MEJORA ACCESIBILIDAD: 
            // Agregamos una etiqueta aria para que el lector de pantalla diga "Cumplido" o "Pendiente"
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

    if (btnGoogle) {
        btnGoogle.addEventListener("click", signInWithGoogle);
    }

    if (signInEmailPassword && passwordInput && confirmPasswordInput) {

        // Validación en tiempo real
        const handleValidation = () => {
            const results = validatePassword(passwordInput.value, confirmPasswordInput.value);
            updateValidationUI(results);
            
            // ♿ MEJORA ACCESIBILIDAD: Marcamos el input como inválido si falta algo
            const isValid = results.isLengthValid && results.hasUppercase && results.hasNumber;
            passwordInput.setAttribute("aria-invalid", !isValid);
        };

        passwordInput.addEventListener('input', handleValidation);
        confirmPasswordInput.addEventListener('input', handleValidation);

        // Envío del formulario
        signInEmailPassword.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('signin_email').value; // Usar ID es más seguro que nombre de array
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            const validationResults = validatePassword(password, confirmPassword);
            const isPasswordValid = validationResults.isLengthValid && validationResults.hasUppercase && validationResults.hasNumber;

            // 1. Error de coincidencia
            if (password !== confirmPassword) {
                displayErrorAlert("Error", "Las contraseñas no coinciden.");
                updateValidationUI(validationResults);
                
                // ♿ MEJORA ACCESIBILIDAD: Mover el foco al error para corregir rápido
                confirmPasswordInput.focus(); 
                return;
            }

            // 2. Error de requisitos
            if (!isPasswordValid) {
                displayErrorAlert("Contraseña Débil", "Revisa los requisitos marcados en rojo.");
                updateValidationUI(validationResults);
                
                // ♿ MEJORA ACCESIBILIDAD: Mover el foco al input principal
                passwordInput.focus();
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                displaySuccessAlert("¡Cuenta Creada!", "Bienvenido a Alice IA.", "index.html"); // Cambia la ruta si es necesario

            } catch (error) {
                console.error("Error Registro:", error);
                
                // Manejo de errores específicos
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