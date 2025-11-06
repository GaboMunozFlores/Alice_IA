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


// === ELEMENTOS DEL DOM ===
const emailLogin = document.getElementById("emailLogin");
const passwordLogin = document.getElementById("passwordLogin");
const togglePasswordLogin = document.getElementById("togglePasswordLogin");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const loginExito = document.getElementById("loginExito");


// === MOSTRAR / OCULTAR CONTRASEÑA ===
togglePasswordLogin.addEventListener("click", () => {
  const isPassword = passwordLogin.type === "password";
  passwordLogin.type = isPassword ? "text" : "password";
  togglePasswordLogin.textContent = isPassword ? "🙈" : "👁️";
});


// === INICIAR SESIÓN ===
loginBtn.addEventListener("click", async () => {
  const email = emailLogin.value.trim();
  const password = passwordLogin.value.trim();

  loginError.style.display = "none";
  loginExito.style.display = "none";

  if (!email || !password) {
    loginError.textContent = "⚠️ Ingresa tu correo y contraseña.";
    loginError.style.display = "block";
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    loginExito.style.display = "block";
    console.log("Inicio de sesión exitoso:", user.uid);

    setTimeout(() => {
      window.location.href = "psicologo.html";
    }, 2000);

  } catch (error) {
    console.error(error);
    loginError.style.display = "block";

    // Mensajes personalizados
    if (error.code === "auth/user-not-found") {
      loginError.textContent = "❌ No existe una cuenta con este correo.";
    } else if (error.code === "auth/wrong-password") {
      loginError.textContent = "❌ Contraseña incorrecta.";
    } else if (error.code === "auth/invalid-email") {
      loginError.textContent = "⚠️ Correo inválido.";
    } else {
      loginError.textContent = "❌ Error al iniciar sesión. Intenta de nuevo.";
    }
  }
});
