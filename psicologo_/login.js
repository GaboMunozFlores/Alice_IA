// === 1. CONFIGURACIÓN DE FIREBASE ===
// (Asegúrate de que estos sean tus datos reales del proyecto)
const firebaseConfig = {
    apiKey: "AIzaSyCq2lQnID4SSkFIKh_ja6paB4aHuq4KU0M",
    authDomain: "proyectercerparcial.firebaseapp.com",
    databaseURL: "https://proyectercerparcial-default-rtdb.firebaseio.com",
    projectId: "proyectercerparcial",
    storageBucket: "proyectercerparcial.appspot.com",
    messagingSenderId: "39792129165",
    appId: "1:39792129165:web:631ce9e0c7fb657a135ec4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === 2. REFERENCIAS A LOS ELEMENTOS DE TU HTML ===
const emailInput = document.getElementById('emailLogin');
const passwordInput = document.getElementById('passwordLogin');
const togglePassword = document.getElementById('togglePasswordLogin');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('loginError');
const successMsg = document.getElementById('loginExito');

// === 3. FUNCIÓN PARA MOSTRAR/OCULTAR CONTRASEÑA ===
togglePassword.addEventListener('click', () => {
    // Si es password pasa a text, si es text pasa a password
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Cambiar el icono (opcional)
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});

// === 4. LÓGICA DE INICIO DE SESIÓN SEGURO ===
loginBtn.addEventListener('click', async () => {
    
    // 1. Obtener valores y limpiar mensajes previos
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    // 2. Validación básica
    if (!email || !password) {
        mostrarError("⚠️ Por favor ingresa correo y contraseña.");
        return;
    }

    // Efecto de carga en el botón
    loginBtn.disabled = true;
    loginBtn.textContent = "Verificando...";

    try {
        // --- PASO A: Autenticación (¿Existe el usuario y la contraseña es correcta?) ---
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // --- PASO B: Autorización (¿Tiene permiso de entrar?) ---
        // Consultamos la base de datos para ver su estado
        const doc = await db.collection('psicologos').doc(user.uid).get();

        if (!doc.exists) {
            throw new Error("NO_REGISTRO"); // El usuario existe en Auth pero no en la BD
        }

        const datos = doc.data();

        // --- PASO C: El Semáforo de Acceso ---
        if (datos.estado === 'aprobado') {
            // ✅ VERDE: Puede pasar
            successMsg.textContent = `✅ Bienvenido/a  Redirigiendo...`;
            successMsg.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = "dashboard.html"; // Página principal del psicólogo
            }, 1500);

        } else if (datos.estado === 'pendiente') {
            // 🟡 AMARILLO: Lo sacamos y avisamos
            await auth.signOut(); // Cierre de sesión forzoso
            throw new Error("PENDIENTE");

        } else if (datos.estado === 'baja') {
            // 🔴 ROJO: Lo sacamos y avisamos
            await auth.signOut(); // Cierre de sesión forzoso
            throw new Error("BAJA");

        } else {
            // Estado desconocido
            await auth.signOut();
            throw new Error("ESTADO_DESCONOCIDO");
        }

    } catch (error) {
        console.error("Login Error:", error);
        
        // Manejo de mensajes amigables para el usuario
        let mensajeTexto = "❌ Error al iniciar sesión.";

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            mensajeTexto = "❌ Correo o contraseña incorrectos.";
        } else if (error.code === 'auth/invalid-email') {
            mensajeTexto = "⚠️ El formato del correo no es válido.";
        } else if (error.code === 'auth/too-many-requests') {
            mensajeTexto = "⚠️ Demasiados intentos. Espera unos minutos.";
        } else if (error.message === 'PENDIENTE') {
            mensajeTexto = "⏳ Tu cuenta está en revisión. Un administrador debe aprobar tu acceso.";
        } else if (error.message === 'BAJA') {
            mensajeTexto = "🚫 Tu cuenta ha sido desactivada. Contacta a soporte.";
        } else if (error.message === 'NO_REGISTRO') {
            mensajeTexto = "⚠️ No se encontraron datos de perfil para este usuario.";
        }

        mostrarError(mensajeTexto);
        
        // Restaurar el botón
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar";
    }
});

// Función auxiliar para mostrar errores
function mostrarError(texto) {
    errorMsg.textContent = texto;
    errorMsg.style.display = 'block';
}