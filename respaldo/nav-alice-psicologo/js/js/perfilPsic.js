// Configuración de Firebase (usa la misma que en tu login)
const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "tu-sender-id",
    appId: "tu-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Verificar si el usuario está logueado
auth.onAuthStateChanged((user) => {
    if (user) {
        // Si SÍ está logueado, cargar sus datos
        cargarDatosPsicologo(user.uid);
    } else {
        // Si NO está logueado, mandarlo al login
        window.location.href = 'login.html';
    }
});

// Función para cargar los datos del psicólogo
function cargarDatosPsicologo(uid) {
    db.collection("psicologos").doc(uid).get()
        .then((doc) => {
            if (doc.exists) {
                const datos = doc.data();
                // Llenar la pantalla con los datos reales
                document.getElementById('info-nombre').textContent = datos.nombre || 'No especificado';
                document.getElementById('info-especialidad').textContent = datos.especialidad || 'No especificado';
                document.getElementById('info-email').textContent = datos.email || 'No especificado';
                document.getElementById('info-disponibilidad').textContent = datos.modalidad || 'No especificada';
                
                // Si tiene foto de perfil, mostrarla
                if (datos.fotoPerfil) {
                    document.getElementById('info-foto').src = datos.fotoPerfil;
                }
            }
        })
        .catch((error) => {
            console.error("Error cargando datos:", error);
        });
}

// Función para abrir el modal de editar
function abrirModalEditar() {
    const uid = auth.currentUser.uid;
    
    // Cargar datos actuales en el formulario
    db.collection("psicologos").doc(uid).get()
        .then((doc) => {
            if (doc.exists) {
                const datos = doc.data();
                document.getElementById('edit-nombre').value = datos.nombre || '';
                document.getElementById('edit-especialidad').value = datos.especialidad || '';
                document.getElementById('edit-email').value = datos.email || '';
                document.getElementById('edit-disponibilidad').value = datos.modalidad || '';
                document.getElementById('edit-foto').value = datos.fotoPerfil || '';
            }
        });
    
    // Mostrar el modal
    document.getElementById('modal-editar').style.display = 'block';
}

// Cerrar modal de editar
function cerrarModalEditar() {
    document.getElementById('modal-editar').style.display = 'none';
}

// Guardar cambios del perfil
function guardarCambios() {
    const uid = auth.currentUser.uid;
    const nuevosDatos = {
        nombre: document.getElementById('edit-nombre').value,
        especialidad: document.getElementById('edit-especialidad').value,
        email: document.getElementById('edit-email').value,
        modalidad: document.getElementById('edit-disponibilidad').value,
        fotoPerfil: document.getElementById('edit-foto').value
    };

    // Actualizar en la base de datos
    db.collection("psicologos").doc(uid).update(nuevosDatos)
        .then(() => {
            alert('Cambios guardados correctamente');
            cargarDatosPsicologo(uid); // Recargar datos en pantalla
            cerrarModalEditar();
        })
        .catch((error) => {
            alert('Error al guardar cambios: ' + error.message);
        });
}

// Abrir modal de eliminar cuenta
function abrirModalEliminar() {
    document.getElementById('modal-eliminar').style.display = 'block';
}

// Cerrar modal de eliminar
function cerrarModalEliminar() {
    document.getElementById('modal-eliminar').style.display = 'none';
}

// Eliminar cuenta permanentemente
function eliminarCuenta() {
    const user = auth.currentUser;
    const uid = user.uid;

    // Primero borrar de Firestore, luego de Authentication
    db.collection("psicologos").doc(uid).delete()
        .then(() => {
            return user.delete();
        })
        .then(() => {
            alert('Cuenta eliminada correctamente');
            window.location.href = '../index.html';
        })
        .catch((error) => {
            alert('Error al eliminar cuenta: ' + error.message);
        });
}

// Función para disponibilidad (por ahora solo mensaje)
function abrirModalDisponibilidad() {
    alert('Funcionalidad de disponibilidad en desarrollo');
}

// Cerrar modales si hace clic fuera de ellos
window.onclick = function(event) {
    const modalEditar = document.getElementById('modal-editar');
    const modalEliminar = document.getElementById('modal-eliminar');
    
    if (event.target === modalEditar) {
        cerrarModalEditar();
    }
    if (event.target === modalEliminar) {
        cerrarModalEliminar();
    }
}