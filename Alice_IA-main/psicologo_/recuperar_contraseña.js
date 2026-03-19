// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCq2lQnID4SSkFIKh_ja6paB4aHuq4KU0M",
    authDomain: "proyectercerparcial.firebaseapp.com",
    projectId: "proyectercerparcial",
    storageBucket: "proyectercerparcial.appspot.com",
    messagingSenderId: "39792129165",
    appId: "1:39792129165:web:631ce9e0c7fb657a135ec4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- BOTÓN PARA ENVIAR EL CORREO ---
document.getElementById("btnReset").addEventListener("click", async () => {
    const email = document.getElementById("emailReset").value;
    const msgExito = document.getElementById("mensajeExito");
    const msgError = document.getElementById("mensajeError");

    msgExito.style.display = "none";
    msgError.style.display = "none";

    if (!email) {
        msgError.textContent = "Por favor ingresa tu correo.";
        msgError.style.display = "block";
        return;
    }

    try {
        await auth.sendPasswordResetEmail(email);
        msgExito.style.display = "block";
    } catch (error) {
        msgError.textContent = "Error: " + error.message;
        msgError.style.display = "block";
        console.error(error);
    }
});
