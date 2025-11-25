import {onAuthStateChange} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"; 
import { auth } from "./nav-alice-usuarios/js/auth_firebase.js";
import './firebase.js'

import { signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js"; 
import './nav-alice-usuarios/js/auth_firebase.js';
import './nav-alice-usuarios/js/loginForm.js';
import './nav-alice-usuarios/js/logout.js';

const signOutButton = document.querySelector("#logoutBtn");
signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});