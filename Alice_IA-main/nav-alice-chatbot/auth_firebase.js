import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  getAuth 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

import { firebaseConfig } from "../../firebase.js"; 

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
const auth = getAuth(app);

// 🔥 INICIALIZAR FIRESTORE
const db = getFirestore(app);
// Exportar
export { auth, db, displayErrorAlert, displaySuccessAlert };
console.log("Proyecto conectado:", firebaseConfig.projectId);