import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js';

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
const analytics = getAnalytics(app);

// Función para iniciar sesión con Google
function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('Usuario autenticado con Google:', user);
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google: ", error.message);
            alert("Error al iniciar sesión con Google: " + error.message);
        });
}

// Asignar evento al botón de Google
document.getElementById("btn-google").addEventListener("click", signInWithGoogle);

console.log('Autenticación con Google habilitada.');