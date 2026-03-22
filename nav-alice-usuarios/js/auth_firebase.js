import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"; 
import { firebaseConfig } from "../../firebase.js"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- LÓGICA DE VISIBILIDAD (EL OJO) ---
function setupPasswordToggle(checkId, inputId) {
    const toggle = document.getElementById(checkId);
    const input = document.getElementById(inputId);
    if (toggle && input) {
        toggle.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.textContent = isPassword ? '👁️‍🗨️' : '👁️'; // Cambia el icono
        });
    }
}

// --- LÓGICA DE VALIDACIÓN VISUAL ---
function validatePasswordRealTime() {
    const pass = document.getElementById("signin_password").value;
    const confirmPass = document.getElementById("signin_confirm_password").value;

    const checks = {
        length: pass.length >= 8,
        uppercase: /[A-Z]/.test(pass),
        number: /[0-9]/.test(pass),
        match: pass === confirmPass && confirmPass.length > 0
    };

    // Actualizar colores
    updateStatus("val-length", checks.length);
    updateStatus("val-uppercase", checks.uppercase);
    updateStatus("val-number", checks.number);
    updateStatus("val-match", checks.match);

    return checks;
}

function updateStatus(id, isValid) {
    const el = document.getElementById(id);
    if (el) {
        el.className = isValid ? "valid" : "invalid";
    }
}

// --- REDIRECCIÓN Y AUTH ---
async function redirectByUserRole(user) {
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role) {
            const role = userDoc.data().role;
            const paths = {
                administrador: "../nav-alice-administrador/panel-administrador.html",
                psicologo: "../nav-alice-psicologos/psicIndex.html"
            };
            window.location.href = paths[role] || "../nav-alice-chatbot/index.html";
        } else {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: "usuario",
                createdAt: serverTimestamp()
            }, { merge: true });
            window.location.href = "../nav-alice-chatbot/index.html";
        }
    } catch (e) { window.location.href = "../nav-alice-chatbot/index.html"; }
}

document.addEventListener('DOMContentLoaded', () => {
    setupPasswordToggle('togglePassword', 'signin_password');
    setupPasswordToggle('toggleConfirmPassword', 'signin_confirm_password');

    const passInput = document.getElementById("signin_password");
    const confirmInput = document.getElementById("signin_confirm_password");
    const form = document.getElementById("signin-form");

    // Validar mientras escriben
    passInput.addEventListener('input', validatePasswordRealTime);
    confirmInput.addEventListener('input', validatePasswordRealTime);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById("signin_email").value;
        const pass = passInput.value;
        const results = validatePasswordRealTime();

        if (Object.values(results).every(v => v)) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                await redirectByUserRole(userCredential.user);
            } catch (error) {
                Swal.fire("Error", error.message, "error");
            }
        } else {
            Swal.fire("Atención", "Revisa los requisitos de la contraseña", "warning");
        }
    });

    // Botón Google
    document.getElementById("btn-google")?.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await redirectByUserRole(result.user);
        } catch (error) { console.error(error); }
    });
});
    export { auth, db };