import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    query, 
    orderBy, 
    doc, 
    updateDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

import { firebaseConfig } from "../../firebase.js"; 

// 1. Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. GESTIÓN DE INTERFAZ (SECCIONES) ---
window.cambiarSeccion = (id) => {
    // Ocultar todas
    document.querySelectorAll('.seccion-panel').forEach(s => s.style.display = 'none');
    
    // Mostrar la elegida
    if (id === 'usuarios') {
        document.getElementById('seccionUsuarios').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    } else {
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('seccionUsuarios').style.display = 'none';
    }
    
    document.getElementById('titulo-seccion').innerText = id.charAt(0).toUpperCase() + id.slice(1);
};

// --- 3. CONEXIÓN Y ESCUCHA DE DATOS ---

function cargarDatosEnTiempoReal() {
    // A. Escuchar Usuarios (Conteo y Tabla)
    onSnapshot(collection(db, "users"), (snapshot) => {
        const total = snapshot.size;
        document.getElementById("usuariosActivos").innerText = total;
        
        const tablaU = document.getElementById("tablaUsuarios");
        if (tablaU) {
            tablaU.innerHTML = "";
            snapshot.forEach(userDoc => {
                const u = userDoc.data();
                const fecha = u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleString() : 'N/A';
                tablaU.innerHTML += `
                    <tr>
                        <td>${u.email}</td>
                        <td>${fecha}</td>
                        <td><span class="estado-apto">${u.role || 'usuario'}</span></td>
                    </tr>`;
            });
        }
    });

    // B. Escuchar Validación de CV (Lo que sale en tu imagen)
    // Cambia "cv_validations" por el nombre exacto de tu colección si es distinto
    const qCV = query(collection(db, "cv_validations"), orderBy("timestamp", "desc"));
    
    onSnapshot(qCV, (snapshot) => {
        const tablaCV = document.getElementById("tablaCV");
        if (tablaCV) {
            tablaCV.innerHTML = "";
            snapshot.forEach(cvDoc => {
                const cv = cvDoc.data();
                const id = cvDoc.id;
                
                // Color dinámico según estado
                const claseEstado = cv.estado === 'Aprobado' ? 'estado-apto' : (cv.estado === 'Rechazado' ? 'estado-rechazado' : '');

                tablaCV.innerHTML += `
                    <tr>
                        <td><a href="${cv.fileUrl}" target="_blank" style="color: blue; text-decoration: underline;">Ver CV</a></td>
                        <td>${cv.perfil || 'vacio'}</td>
                        <td>${cv.resultadoIA || 'Procesando...'}</td>
                        <td><span class="${claseEstado}">${cv.estado || 'Pendiente'}</span></td>
                        <td>
                            <button class="btn-aprobar" onclick="cambiarEstadoCV('${id}', 'Aprobado')">Aprobar</button>
                            <button class="btn-rechazar" onclick="cambiarEstadoCV('${id}', 'Rechazado')">Rechazar</button>
                        </td>
                    </tr>`;
            });
        }
    });
}

// --- 4. ACCIONES DE BASE DE DATOS ---

// Función para Aprobar/Rechazar CVs
window.cambiarEstadoCV = async (docId, nuevoEstado) => {
    try {
        const docRef = doc(db, "cv_validations", docId);
        await updateDoc(docRef, { estado: nuevoEstado });
        console.log(`Documento ${docId} actualizado a ${nuevoEstado}`);
    } catch (error) {
        console.error("Error al actualizar estado:", error);
    }
};

// Cerrar sesión
window.cerrarSesion = () => {
    signOut(auth).then(() => {
        window.location.href = "../nav-alice-usuarios/login.html";
    });
};

// --- 5. SEGURIDAD Y ARRANQUE ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verificar si es Admin antes de cargar nada
        const adminDoc = await getDoc(doc(db, "users", user.uid));
        if (adminDoc.exists() && adminDoc.data().role === "administrador") {
            document.getElementById("usuarioActual").innerText = user.email;
            cargarDatosEnTiempoReal();
        } else {
            window.location.href = "../nav-alice-usuarios/login.html";
        }
    } else {
        window.location.href = "../nav-alice-usuarios/login.html";
    }
});