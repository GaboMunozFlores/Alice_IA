// --- 1. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCq2lQnID4SSkFIKh_ja6paB4aHuq4KU0M",
    authDomain: "proyectercerparcial.firebaseapp.com",
    databaseURL: "https://proyectercerparcial-default-rtdb.firebaseio.com",
    projectId: "proyectercerparcial",
    storageBucket: "proyectercerparcial.appspot.com",
    messagingSenderId: "39792129165",
    appId: "1:39792129165:web:631ce9e0c7fb657a135ec4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// --- 2. SELECTORES ---
const btnRegistrar = document.getElementById("registrarBtn");
const nombreInput = document.getElementById("nombre");
const inputCedula = document.getElementById("numCedula");
const passwordInput = document.getElementById("password");

// Reglas de contraseña
const ruleLength = document.getElementById("ruleLength");
const ruleUpper = document.getElementById("ruleUpper");
const ruleNumber = document.getElementById("ruleNumber");
const ruleSpecial = document.getElementById("ruleSpecial");

// --- 3. VALIDACIÓN DE CONTRASEÑA EN VIVO ---
passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    // Longitud
    if (value.length >= 8) ruleLength.classList.replace("invalid", "valid");
    else ruleLength.classList.replace("valid", "invalid");

    // Mayúscula
    if (/[A-Z]/.test(value)) ruleUpper.classList.replace("invalid", "valid");
    else ruleUpper.classList.replace("valid", "invalid");

    // Número
    if (/\d/.test(value)) ruleNumber.classList.replace("invalid", "valid");
    else ruleNumber.classList.replace("valid", "invalid");

    // Carácter especial
    if (/[^A-Za-z0-9]/.test(value)) ruleSpecial.classList.replace("invalid", "valid");
    else ruleSpecial.classList.replace("valid", "invalid");
});

// --- 4. REGISTRO SIN VERIFICACIÓN DE CÉDULA ---
btnRegistrar.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();
    const especialidad = document.getElementById('especialidad').value;
    const modalidad = document.getElementById('modalidad').value;
    const experiencia = document.getElementById('experiencia').value;
    const archivoInput = document.getElementById('archivoCedula');
    const cedula = inputCedula.value.trim();

    // --- VALIDACIONES ---
    if (!nombreInput.value.trim() ||
        !email ||
        !password ||
        !cedula ||
        !especialidad ||
        !modalidad) {
        alert("⚠️ Completa todos los campos obligatorios.");
        return;
    }

    // Validación de contraseña antes de enviar
    if (
        ruleLength.classList.contains("invalid") ||
        ruleUpper.classList.contains("invalid") ||
        ruleNumber.classList.contains("invalid") ||
        ruleSpecial.classList.contains("invalid")
    ) {
        alert("⚠️ La contraseña no cumple con los requisitos.");
        return;
    }

    try {
        btnRegistrar.textContent = "Registrando...";
        btnRegistrar.disabled = true;

        // A. Crear usuario en Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

       

        // C. Guardar en Firestore
        await db.collection('psicologos').doc(user.uid).set({
            nombre: nombreInput.value.trim(),
            email: email,
            cedula: cedula,
            especialidad: especialidad,
            modalidad: modalidad,
            experiencia: experiencia,
            estado: "pendiente",
            validadoSEP: false,
            fechaRegistro: new Date()
        });

        alert("✅ Registro exitoso. Tu cuenta será revisada por un administrador.");
        window.location.href = "login.html";

    } catch (error) {
        console.error(error);
        document.getElementById("mensajeError").textContent = "Error: " + error.message;
        document.getElementById("mensajeError").style.display = "block";
        btnRegistrar.textContent = "Registrar Psicólogo";
        btnRegistrar.disabled = false;
    }
});

// --- 5. MOSTRAR / OCULTAR CONTRASEÑA ---
document.getElementById("togglePassword").addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    this.textContent = type === "password" ? "👁️" : "🙈";
});
