import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    getAuth 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"; 

import { firebaseConfig } from "../../firebase.js"; 

// 1. Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

// --- 2. FUNCIÓN DE REDIRECCIÓN POR ROL (SISTEMA DE SEGURIDAD) ---
async function redirectByUserRole(user) {
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        // Si el documento existe y tiene el campo 'role'
        if (userDoc.exists() && userDoc.data().role) {
            const role = userDoc.data().role;
            console.log("Rol detectado:", role);

            switch (role) {
                case "administrador":
                    // Salimos de la carpeta actual y entramos a la de admin
                    window.location.href = "../nav-alice-administrador/panel-administrador.html";
                    break;
                case "psicologo":
                    // Salimos de la carpeta actual y entramos a la de psicólogos
                    window.location.href = "../nav-alice-psicologos/psicIndex.html";
                    break;
                case "usuario":
                default:
                    // Salimos de la carpeta actual y entramos a la del chatbot
                    window.location.href = "../nav-alice-chatbot/index.html";
                    break;
            }
        } else {
            // Caso: Usuario nuevo o sin rol definido
            console.warn("Sin rol definido. Asignando 'usuario' por defecto.");
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: "usuario",
                lastLogin: serverTimestamp(),
                createdAt: serverTimestamp()
            }, { merge: true });

            window.location.href = "nav-alice-chatbot/index.html";
        }
    } catch (error) {
        console.error("Error en redirección:", error);
        // Fallback: Si falla la conexión, enviar a la ruta base de usuario
        window.location.href = "nav-alice-chatbot/index.html";
    }
}

// --- 3. ALERTAS (SweetAlert2) ---
function displayErrorAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido'
    });
}

function displaySuccessAlert(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
    });
}

// --- 4. LÓGICA DE AUTENTICACIÓN ---

// A. Iniciar Sesión con Google
const btnGoogle = document.getElementById("googleLogin");
if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await redirectByUserRole(result.user);
        } catch (error) {
            console.error("Error Google:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                displayErrorAlert("Error de Google", "No se pudo iniciar sesión.");
            }
        }
    });
}

// B. Iniciar Sesión con Email/Password (Login Form)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById("login-form");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            const errorMsg = document.getElementById("loginError");
            const exitoMsg = document.getElementById("loginExito");

            try {
                // Limpiar mensajes previos
                if(errorMsg) errorMsg.style.display = "none";
                
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                if(exitoMsg) exitoMsg.style.display = "block";
                displaySuccessAlert("Bienvenido", "Validando acceso...");
                
                await redirectByUserRole(userCredential.user);

            } catch (error) {
                console.error("Error Login:", error.code);
                if(errorMsg) {
                    errorMsg.innerText = "Correo o contraseña incorrectos.";
                    errorMsg.style.display = "block";
                }
                displayErrorAlert("Acceso Denegado", "Verifica tus credenciales.");
            }
        });
    }
});