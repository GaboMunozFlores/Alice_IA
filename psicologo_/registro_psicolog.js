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

// --- 2. VARIABLES Y SELECTORES ---
const btnVerificar = document.getElementById('btnVerificarCedula');
const inputCedula = document.getElementById('numCedula');
const resultadoCedula = document.getElementById('resultadoCedula');
// OJO: Usamos btnRegistrar, no btnLogin, porque esto es la página de registro
const btnRegistrar = document.getElementById('registrarBtn'); 
const nombreInput = document.getElementById('nombre');

// Estado de validación
let cedulaValidada = false; 

// --- 3. LÓGICA DE VALIDACIÓN DE CÉDULA ---
btnVerificar.addEventListener('click', async () => {
    const cedula = inputCedula.value.trim();
    if (cedula.length < 7) {
        alert("La cédula debe tener al menos 7 dígitos.");
        return;
    }

    resultadoCedula.textContent = "⌛ Buscando en la SEP...";
    resultadoCedula.style.color = "blue";
    btnVerificar.disabled = true;

    try {
        // Conexión con TU servidor local (backend Node.js)
        const response = await fetch(`http://localhost:3000/api/validar/${cedula}`);
        const data = await response.json();

        if (data.encontrado) {
            // Nota: aquí asumimos que si encontrado=true, es válido (por tu modo simulación)
            resultadoCedula.innerHTML = `✅ Cédula verificada con éxito.<br><small>${data.datos.carrera}</small>`;
            resultadoCedula.style.color = "green";
            
            // Si la API trae nombre (y no está vacío), lo ponemos. Si no, respetamos el tuyo.
            if (data.datos.nombre && data.datos.nombre !== "") {
                nombreInput.value = data.datos.nombre;
            }
            
            cedulaValidada = true; 
        } else {
            resultadoCedula.textContent = "❌ Cédula no encontrada.";
            resultadoCedula.style.color = "red";
            cedulaValidada = false;
        }

    } catch (error) {
        console.error(error);
        resultadoCedula.textContent = "❌ Error de conexión.";
        resultadoCedula.style.color = "red";
    } finally {
        btnVerificar.disabled = false;
    }
});

// --- 4. LÓGICA DE REGISTRO EN FIREBASE ---
// Corregido: Usamos 'btnRegistrar' y agregamos 'async'
btnRegistrar.addEventListener('click', async (e) => { 
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const especialidad = document.getElementById('especialidad').value;
    const archivoInput = document.getElementById('archivoCedula');

    // Validaciones
    if (!cedulaValidada) {
        alert("⚠️ Por favor, verifica la cédula profesional (botón gris) antes de continuar.");
        return;
    }
    if (!email || !password || !especialidad) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        btnRegistrar.textContent = "Registrando...";
        btnRegistrar.disabled = true;

        // A. Crear usuario en Auth (Sign Up)
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // B. Subir archivo (si seleccionó uno)
        let archivoUrl = "";
        if (archivoInput.files.length > 0) {
            const file = archivoInput.files[0];
            const storageRef = storage.ref(`cedulas/${user.uid}/${file.name}`);
            await storageRef.put(file);
            archivoUrl = await storageRef.getDownloadURL();
        }

        // C. Guardar datos en Firestore con estado PENDIENTE
        await db.collection('psicologos').doc(user.uid).set({
            nombre: nombreInput.value,
            email: email,
            cedula: inputCedula.value,
            especialidad: especialidad,
            modalidad: document.getElementById('modalidad').value,
            experiencia: document.getElementById('experiencia').value,
            documentoUrl: archivoUrl,
            
            // AQUÍ ESTÁ LA MAGIA PARA DAR DE ALTA/BAJA:
            estado: "pendiente", // El usuario nace "pendiente"
            
            validadoSEP: true,
            fechaRegistro: new Date()
        });

        // D. Éxito y Redirección al Login (porque está pendiente)
        alert("✅ Registro exitoso.\n\nTu cuenta está en revisión (estado: Pendiente). Podrás entrar cuando un administrador te apruebe.");
        window.location.href = "login.html"; // Mándalo al login para que pruebe entrar

    } catch (error) {
        console.error(error);
        document.getElementById('mensajeError').textContent = "Error: " + error.message;
        btnRegistrar.textContent = "Registrar Psicólogo";
        btnRegistrar.disabled = false;
    }
});

// --- 5. EXTRAS (Mostrar contraseña) ---
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});