import { auth, db } from "../nav-alice-usuarios/js/auth_firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
/* =========================
   VARIABLES DE ESTADO
========================= */
let usuarioUID = null;
function getHistorialKey() {
  return `historialAliceUI_${usuarioUID}`;
}

function usuarioTieneHistorial() {
  const historial = JSON.parse(localStorage.getItem(getHistorialKey())) || [];
  return historial.length > 0;
}
let estadoChat = localStorage.getItem("estadoChat") || "inicio";
let pasoTest = parseInt(localStorage.getItem("pasoTest")) || 0;
let puntajeTotal = parseInt(localStorage.getItem("puntajeTotal")) || 0;

const preguntas = [
  "¿Te has sentido nerviosa o inquieta últimamente?",
  "¿Has tenido dificultad para dejar de preocuparte?",
  "¿Te has sentido con poco interés o placer en hacer las cosas?",
  "¿Has tenido problemas para dormir o concentrarte?",
  "¿Sientes tensión muscular o irritabilidad constante?"
];

/* =========================
   INICIO
========================= */

window.addEventListener("DOMContentLoaded", () => {

  const chatbox = document.getElementById("chatBox");
  const userInputField = document.getElementById("userMessage");
  const sendBtn = document.getElementById("sendBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmailSpan = document.getElementById("userEmail");

  if (!chatbox || !userInputField || !sendBtn) return;

  const keepScrolled = () => {
    chatbox.scrollTop = chatbox.scrollHeight;
  };

  /* =========================
     ESTADO CENTRALIZADO
  ========================= */

  function actualizarEstado(nuevoEstado) {
    estadoChat = nuevoEstado;
    localStorage.setItem("estadoChat", estadoChat);
  }

  function guardarEstadoTest() {
    localStorage.setItem("pasoTest", pasoTest);
    localStorage.setItem("puntajeTotal", puntajeTotal);
  }

  /* =========================
     HISTORIAL UI
  ========================= */

  function guardarEnHistorialUI(role, text) {
    if (!text?.trim()) return;

    let historial = JSON.parse(localStorage.getItem(getHistorialKey())) || [];

    historial.push({ role, text });

    if (historial.length > 50) {
      historial = historial.slice(-50);
    }

    localStorage.setItem(getHistorialKey(), JSON.stringify(historial));
  }

  function reconstruirHistorial() {
    const historial = JSON.parse(localStorage.getItem(getHistorialKey())) || [];

    historial.forEach(msg => {
      renderMensaje(msg.role, msg.text, false);
    });
  }

  function formatearTextoSeguro(texto) {

    // 1️⃣ Escapar completamente HTML
    const div = document.createElement("div");
    div.textContent = texto;
    let seguro = div.innerHTML;

    // 2️⃣ Permitir **negritas**
    seguro = seguro.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 3️⃣ Permitir saltos de línea
    seguro = seguro.replace(/\n/g, "<br>");

    return seguro;
  }
  /* =========================
     RENDER MENSAJES
  ========================= */

function renderMensaje(role, text, guardar = true) {

  const msg = document.createElement("div");
  msg.className = role === "user"
    ? "user-message message"
    : "bot-message message";

  const bubble = document.createElement("div");
  bubble.className = role === "user"
    ? "user-bubble"
    : "bot-bubble";

  // 🔒 Sanitización básica automática
  bubble.innerHTML = formatearTextoSeguro(text);

  if (role === "user") {

    const icon = document.createElement("img");
    icon.className = "chat-icon";
    icon.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    msg.appendChild(bubble);
    msg.appendChild(icon);

  } else {

    const icon = document.createElement("img");
    icon.className = "chat-icon";
    icon.src = "logo-alice.png";

    msg.appendChild(icon);
    msg.appendChild(bubble);
  }

  chatbox.appendChild(msg);
  keepScrolled();

  if (guardar) {
    guardarEnHistorialUI(role, text);

    if (usuarioUID) {
      guardarMensajeFirestore(usuarioUID, role, text);
    }
  }
}

  /* =========================
     FIRESTORE
  ========================= */

  async function guardarMensajeFirestore(userId, role, text) {
    try {
      await addDoc(
        collection(db, "usuarios", userId, "conversaciones"),
        {
          role,
          text,
          timestamp: serverTimestamp()
        }
      );
    } catch (error) {
      console.error("Firestore error:", error);
    }
    console.log("🔥 Guardando en Firestore:", userId, role, text);
  }

  /* =========================
     TYPING
  ========================= */

  function showTyping(callback) {
    const typing = document.createElement("div");
    typing.className = "bot-message message";
    typing.innerHTML = `
      <img class="chat-icon" src="logo-alice.png"/>
      <div class="bot-bubble"><em>Alice está escribiendo…</em></div>
    `;
    chatbox.appendChild(typing);
    keepScrolled();

    setTimeout(() => {
      typing.remove();
      callback();
    }, 1000);
  }

  /* =========================
     TEST
  ========================= */

  function manejarTest(respuesta) {

    const resp = respuesta.toLowerCase();

    if (resp.includes("si") || resp.includes("sí") || resp.includes("mucho")) {
      puntajeTotal += 2;
    } else if (resp.includes("poco") || resp.includes("veces")) {
      puntajeTotal += 1;
    }

    pasoTest++;
    guardarEstadoTest();

    if (pasoTest < preguntas.length) {
      showTyping(() => renderMensaje("bot", preguntas[pasoTest]));
    } else {
      finalizarTest();
    }
  }

  function finalizarTest() {

    actualizarEstado("conversacion");

    const resultado = puntajeTotal > 6
      ? "un poco elevado"
      : "dentro de lo normal";

    showTyping(() => {
      renderMensaje("bot", "**Nota:** Esta orientación no sustituye un diagnóstico profesional.");
      renderMensaje("bot", `Tus resultados sugieren que tu nivel de ansiedad podría estar ${resultado}.`);
      renderMensaje("bot", "¿Cómo te sientes ahora que hemos hablado de esto? 🌷");
    });

    pasoTest = 0;
    puntajeTotal = 0;
    guardarEstadoTest();
  }

  /* =========================
     ENVÍO
  ========================= */

  async function enviarMensaje() {

    const userInput = userInputField.value.trim();
    if (!userInput) return;

    renderMensaje("user", userInput);
    userInputField.value = "";

    if (estadoChat === "esperando_confirmacion") {

      const resp = userInput.toLowerCase();

      if (resp.includes("si") || resp.includes("sí")) {
        actualizarEstado("test");
        showTyping(() => renderMensaje("bot", preguntas[pasoTest]));
      } else {
        actualizarEstado("conversacion");
        showTyping(() => renderMensaje("bot", "Perfecto 🌷, cuéntame ¿qué está pasando?"));
      }

      return;
    }

    if (estadoChat === "test") {
      manejarTest(userInput);
      return;
    }

    // Conversación normal (Gemini)
    showTyping(async () => {
      const respuesta = await obtenerRespuestaGemini(userInput, estadoChat);
      renderMensaje("bot", respuesta || "Cuéntame un poco más 💛");
    });
  }

  sendBtn.addEventListener("click", enviarMensaje);
  userInputField.addEventListener("keypress", e => {
    if (e.key === "Enter") enviarMensaje();
  });

async function verificarAceptacion(uid) {

  const userRef = doc(db, "usuarios", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists() || !snapshot.data().acceptedTerms) {
    mostrarModalAceptacion(uid);
  }

}
function mostrarModalAceptacion(uid) {

  const modal = document.createElement("div");

  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "9999";

  modal.innerHTML = `
    <div style="background:white;padding:20px;border-radius:10px;max-width:400px;text-align:center;">
      <h3>Aviso Importante</h3>
      <p>
        Este chat almacena conversaciones para mejorar tu experiencia.
        No sustituye atención profesional.
      </p>
      <button id="aceptarBtn" style="padding:8px 15px;border:none;background:#2c7be5;color:white;border-radius:6px;">
        Acepto
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("aceptarBtn").onclick = async () => {

    await setDoc(doc(db, "usuarios", uid), {
      acceptedTerms: true,
      acceptedAt: serverTimestamp()
    }, { merge: true });

    modal.remove();
  };
}
  /* =========================
     AUTH
  ========================= */
onAuthStateChanged(auth, async user => {

  if (user) {

    usuarioUID = user.uid;
    userEmailSpan.textContent = user.email;

    await verificarAceptacion(usuarioUID);

    reconstruirHistorial();

    // 🔥 Si NO tiene historial, mostramos saludo + test
    if (!usuarioTieneHistorial()) {

      renderMensaje("bot", "¡Hola! Soy **Alice**, tu compañera de apoyo emocional.");

      setTimeout(() => {
        renderMensaje("bot", "¿Te gustaría realizar un breve test de ansiedad?");
        actualizarEstado("esperando_confirmacion");
      }, 800);

    }

  } else {
    window.location.href = "../nav-alice-usuarios/login.html";
  }

});

  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../nav-alice-usuarios/login.html";
  });





  if (estadoChat === "test" && pasoTest < preguntas.length) {
    renderMensaje("bot", "Continuemos donde lo dejamos:");
    renderMensaje("bot", preguntas[pasoTest], false);
  }

});