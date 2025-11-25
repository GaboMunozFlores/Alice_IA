import { auth } from "./nav-alice-usuarios/js/auth_firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

import { onAuthStateChange } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

const signOutButton = document.querySelector("#logoutBtn");
signOutButton.addEventListener("click", async () => {
    try {
        await signout(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});

onAuthStateChange(auth, (user) => {
    if (user) {
        // Usuario autenticado
        console.log("Usuario autenticado:", user);
    } else {
        // Usuario no autenticado
        console.log("Usuario no autenticado");
    }
});
