// CONFIGURACIÓN FIREBASE
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

let psicologoIdGlobal = "";

// DETECTAR USUARIO
auth.onAuthStateChanged(user => {
  if (user) {
    psicologoIdGlobal = user.uid;
    cargarDatosIniciales(user.email);
  } else {
    window.location.href = "../psicologo_/login.html";
  }
});

// ESTA ES LA FUNCIÓN QUE MODIFICAMOS PARA TU NAV BAR
function cargarDatosIniciales(email) {
  db.collection("psicologos").where("email", "==", email).get().then(q => {
    if (!q.empty) {
      const datosPsicologo = q.docs[0].data();

      // 1. Poner nombre en el cuerpo de la página
      document.getElementById("nombrePsicologo").textContent = datosPsicologo.nombre;

      // 2. Poner nombre en la NAV BAR (Derecha)
      if(document.getElementById("navNombrePsicologo")) {
        document.getElementById("navNombrePsicologo").textContent = datosPsicologo.nombre;
      }

      // 3. Poner foto en la NAV BAR (Si existe en Firebase)
      if(datosPsicologo.fotoPerfil && document.getElementById("navFotoPsicologo")) {
        document.getElementById("navFotoPsicologo").src = datosPsicologo.fotoPerfil;
      }

      cargarPacientesSelect();
      cargarHistorialAgrupado();
    }
  });
}

// LLENAR SELECT DE PACIENTES
function cargarPacientesSelect() {
  db.collection("citas_pendientes").where("psicologoId", "==", psicologoIdGlobal).get().then(q => {
    const select = document.getElementById("selectPaciente");
    if(!select) return;
    
    select.innerHTML = '<option value="">Selecciona un paciente</option>';
    q.forEach(doc => {
      let nom = doc.data().paciente.trim();
      select.innerHTML += `<option value="${nom}">${nom}</option>`;
    });
  });
}

// GUARDAR SESIÓN
document.getElementById("guardarSesion").onclick = () => {
  const pac = document.getElementById("selectPaciente").value;
  const mot = document.getElementById("motivo").value;
  const not = document.getElementById("notas").value;
  const dia = document.getElementById("diagnostico").value;

  if(!pac || !mot) return alert("Completa los datos");

  db.collection("historial_clinico").add({
    psicologoId: psicologoIdGlobal,
    paciente: pac,
    motivo: mot,
    notas: not,
    diagnostico: dia,
    fecha: new Date().toISOString()
  }).then(() => {
    alert("Guardado");
    document.getElementById("nuevaSesionForm").style.display = "none";
    cargarHistorialAgrupado(); 
  });
};

// --- FUNCIÓN CLAVE: AGRUPAR POR PACIENTE ---
function cargarHistorialAgrupado() {
  const contenedor = document.getElementById("listaSesiones");
  if(!contenedor) return;
  
  contenedor.innerHTML = "Cargando...";

  db.collection("historial_clinico")
    .where("psicologoId", "==", psicologoIdGlobal)
    .orderBy("fecha", "desc")
    .get()
    .then(q => {
      contenedor.innerHTML = "";
      if (q.empty) {
        contenedor.innerHTML = "No hay sesiones.";
        return;
      }

      const grupos = {};
      q.forEach(doc => {
        const d = doc.data();
        if (!grupos[d.paciente]) grupos[d.paciente] = [];
        grupos[d.paciente].push(d);
      });

      for (const paciente in grupos) {
        crearTarjetaPaciente(paciente, grupos[paciente]);
      }
    });
}
 const fotoUrl = document.getElementById('edit-foto-url').value;
                if (fotoUrl) {
                    nuevosDatos.foto = fotoUrl;
                }

function crearTarjetaPaciente(nombre, sesiones) {
  const contenedor = document.getElementById("listaSesiones");
  const idDiv = "collapse-" + nombre.replace(/\s+/g, '');

  const card = document.createElement("div");
  card.className = "paciente-group-card";

  let sesionesHTML = "";
  sesiones.forEach(s => {
    sesionesHTML += `
      <div class="sesion-item">
        <p><strong>📅 Fecha:</strong> ${new Date(s.fecha).toLocaleString()}</p>
        <p><strong>Motivo:</strong> ${s.motivo}</p>
        <p><strong>Notas:</strong> ${s.notas}</p>
        <p><strong>Diagnóstico:</strong> ${s.diagnostico}</p>
      </div>`;
  });

  card.innerHTML = `
    <div class="paciente-header" onclick="toggleView('${idDiv}')">
      <h3>${nombre}</h3>
      <span class="badge-sesiones">${sesiones.length} Sesiones ▼</span>
    </div>
    <div id="${idDiv}" class="detalle-sesiones" style="display:none;">
      ${sesionesHTML}
    </div>
  `;
  contenedor.appendChild(card);
}

function toggleView(id) {
  const el = document.getElementById(id);
  el.style.display = (el.style.display === "block") ? "none" : "block";
}
function cerrarSesion() {
    // 1. Borramos cualquier dato guardado
    localStorage.clear(); 
    sessionStorage.clear();

    // 2. Usamos replace en lugar de href
    // .replace() sobreescribe la URL actual en el historial, 
    // haciendo que la página "privada" deje de existir para el navegador.
    window.location.replace("/index.html");
}

// Botones de interfaz
document.getElementById("btnNuevaSesion").onclick = () => document.getElementById("nuevaSesionForm").style.display = "block";
document.getElementById("cancelarSesion").onclick = () => document.getElementById("nuevaSesionForm").style.display = "none";