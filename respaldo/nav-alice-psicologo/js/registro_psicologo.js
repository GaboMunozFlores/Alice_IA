// === CONFIGURACIÓN DE FIREBASE ===
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


// === VALIDACIÓN DE CONTRASEÑA ===
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const ruleLength = document.getElementById("ruleLength");
const ruleUpper = document.getElementById("ruleUpper");
const ruleNumber = document.getElementById("ruleNumber");
const ruleSpecial = document.getElementById("ruleSpecial");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "🙈" : "👁️";
});

passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  updateRule(ruleLength, value.length >= 8, "Mínimo 8 caracteres");
  updateRule(ruleUpper, /[A-Z]/.test(value), "Una letra mayúscula");
  updateRule(ruleNumber, /\d/.test(value), "Un número");
  updateRule(ruleSpecial, /[!@#$%^&*(),.?\":{}|<>]/.test(value), "Un carácter especial");
});

function updateRule(element, isValid, message) {
  element.classList.toggle("valid", isValid);
  element.classList.toggle("invalid", !isValid);
  element.textContent = `${isValid ? "✅" : "⚫"} ${message}`;
}


// === REGISTRO DEL PSICÓLOGO ===
document.getElementById("registrarBtn").addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value.trim();
  const archivoCedula = document.getElementById("archivoCedula").files[0];
  const especialidad = document.getElementById("especialidad").value;
  const experiencia = document.getElementById("experiencia").value.trim();
  const modalidad = document.getElementById("modalidad").value;
  const errorMsg = document.getElementById("mensajeError");
  const successMsg = document.getElementById("mensajeExito");

  // Reiniciar mensajes
  errorMsg.style.display = "none";
  successMsg.style.display = "none";

  // === VALIDACIONES ===
  if (!nombre || !email || !password || !archivoCedula || !especialidad || !modalidad) {
    errorMsg.textContent = "⚠️ Completa todos los campos obligatorios.";
    errorMsg.style.display = "block";
    return;
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[!@#$%^&*(),.?\":{}|<>]/.test(password)
  ) {
    errorMsg.textContent = "⚠️ La contraseña no cumple con los requisitos.";
    errorMsg.style.display = "block";
    return;
  }

  try {
    // === 1️⃣ Crear usuario en Authentication ===
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const user = cred.user;
    console.log("Usuario creado:", user.uid);

    // === 2️⃣ Subir archivo de cédula a Storage ===
    const fileName = `${Date.now()}_${archivoCedula.name}`; // evitar sobrescribir
    const cedulaRef = storage.ref(`cedulas/${user.uid}/${fileName}`);
    await cedulaRef.put(archivoCedula);
    const cedulaURL = await cedulaRef.getDownloadURL();

    console.log("Cédula subida:", cedulaURL);

    // === 3️⃣ Guardar datos en Firestore ===
    await db.collection("psicologos").doc(user.uid).set({
      uid: user.uid,
      nombre,
      email,
      especialidad,
      experiencia: experiencia || "No especificada",
      modalidad,
      cedulaURL,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("Datos guardados en Firestore");

    // === 4️⃣ Mensaje de éxito y redirección ===
    successMsg.style.display = "block";
    setTimeout(() => {
      window.location.href = "login_psicologo.html";
    }, 3000);

  } catch (err) {
    console.error("Error en el registro:", err);
    errorMsg.textContent = "❌ Error: " + err.message;
    errorMsg.style.display = "block";
  }
});
