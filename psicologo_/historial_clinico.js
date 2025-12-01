// =========================
// CONFIG FIREBASE
// =========================
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

// Variables globales
let psicologoIdGlobal = "";
let pacienteSeleccionado = "";

// =========================
// CARGAR PSICÓLOGO
// =========================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "../psicologo_/login.html";
    return;
  }

  // 🔥 usamos el UID real
  psicologoIdGlobal = user.uid;

  cargarPsicologo(user.email);
});

function cargarPsicologo(email) {
  db.collection("psicologos")
    .where("email", "==", email)
    .get()
    .then(q => {
      if (q.empty) return;

      const doc = q.docs[0];
      document.getElementById("nombrePsicologo").textContent = doc.data().nombre;

      cargarPacientesDeCitas();
      cargarHistorial(); // Carga todas las sesiones
    });
}

// =========================
// CARGAR PACIENTES CON CITA
// =========================
function cargarPacientesDeCitas() {
  db.collection("citas_pendientes")
    .where("psicologoId", "==", psicologoIdGlobal)
    .get()
    .then(q => {
      const select = document.getElementById("selectPaciente");
      select.innerHTML = `<option value="">Selecciona un paciente</option>`;

      if (q.empty) {
        select.innerHTML = `<option value="">No hay pacientes con cita</option>`;
        return;
      }

      q.forEach(doc => {
        const data = doc.data();
        const option = document.createElement("option");

        // 🔥 LIMPIAMOS ESPACIOS EXTRAS
        option.value = data.paciente.trim();  
        option.textContent = data.paciente.trim();

        select.appendChild(option);
      });
    });
}

// Al seleccionar paciente
document.getElementById("selectPaciente").addEventListener("change", function () {
  pacienteSeleccionado = this.value.trim();

  if (pacienteSeleccionado) cargarSesionesPorPaciente(pacienteSeleccionado);
});

// =========================
// GUARDAR SESIÓN
// =========================
document.getElementById("guardarSesion").addEventListener("click", function () {

  if (!pacienteSeleccionado) {
    alert("Selecciona un paciente");
    return;
  }

  const motivo = document.getElementById("motivo").value.trim();
  const notas = document.getElementById("notas").value.trim();
  const diagnostico = document.getElementById("diagnostico").value.trim();

  if (!motivo || !notas || !diagnostico) {
    alert("Llena todos los campos");
    return;
  }

  const nuevaSesion = {
    psicologoId: psicologoIdGlobal,
    paciente: pacienteSeleccionado.trim(),
    motivo: motivo,
    notas: notas,
    diagnostico: diagnostico,
    fecha: new Date().toISOString()
  };

  db.collection("historial_clinico").add(nuevaSesion)
    .then(() => {
      alert("Sesión guardada correctamente");

      document.getElementById("nuevaSesionForm").style.display = "none";

      // limpiar campos
      document.getElementById("motivo").value = "";
      document.getElementById("notas").value = "";
      document.getElementById("diagnostico").value = "";

      cargarSesionesPorPaciente(pacienteSeleccionado);
    });
});

// Mostrar formulario
document.getElementById("btnNuevaSesion").addEventListener("click", () => {
  document.getElementById("nuevaSesionForm").style.display = "block";
});

// =========================
// MOSTRAR SESIÓN EN LISTA
// =========================
function mostrarSesionEnLista(sesion) {
  const contenedor = document.getElementById("listaSesiones");

  // Si hay un mensaje de "Cargando..." o "No hay sesiones", lo limpiamos antes de agregar la primera tarjeta
  if (contenedor.textContent.includes("Cargando sesiones") || contenedor.textContent.includes("No hay sesiones")) {
    contenedor.innerHTML = "";
  }

  const div = document.createElement("div");
  div.className = "session-card";

  div.innerHTML = `
    <h3 style="margin:0 0 5px; color:#2c3e50">${sesion.paciente}</h3>

    <p><strong>Motivo:</strong> ${sesion.motivo}</p>
    <p><strong>Notas:</strong> ${sesion.notas}</p>
    <p><strong>Diagnóstico:</strong> ${sesion.diagnostico}</p>

    <p class="muted">${new Date(sesion.fecha).toLocaleString()}</p>
  `;

  contenedor.prepend(div);
  
  // ❌ AQUÍ ESTABA EL ERROR: cargarHistorial();  <-- BORRA ESTA LÍNEA
}

// =========================
// CARGAR HISTORIAL COMPLETO
// =========================
function cargarHistorial() {
  const contenedor = document.getElementById("listaSesiones");
  contenedor.innerHTML = "<p class='muted'>Cargando sesiones...</p>";

  db.collection("historial_clinico")
    .where("psicologoId", "==", psicologoIdGlobal)
    .orderBy("fecha", "desc")
    .get()
    .then(q => {
      contenedor.innerHTML = "";

      if (q.empty) {
        contenedor.innerHTML = "<p class='muted'>Aún no hay sesiones registradas.</p>";
        return;
      }

      q.forEach(doc => {
        mostrarSesionEnLista(doc.data());
      });
    });
}

// =========================
// CARGAR SESIONES POR PACIENTE
// =========================
function cargarSesionesPorPaciente(pacienteId) {
  const contenedor = document.getElementById("listaSesiones");
  contenedor.innerHTML = "<p class='muted'>Cargando sesiones...</p>";

  db.collection("historial_clinico")
    .where("psicologoId", "==", psicologoIdGlobal)
    .where("paciente", "==", pacienteId.trim())
    .orderBy("fecha", "desc")
    .get()
    .then(q => {
      contenedor.innerHTML = "";

      if (q.empty) {
        contenedor.innerHTML = "<p class='muted'>No hay sesiones para este paciente.</p>";
        return;
      }

      q.forEach(doc => {
        mostrarSesionEnLista(doc.data());
      });
    });
}
