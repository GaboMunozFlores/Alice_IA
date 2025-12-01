// 1. IMPORTACIONES NECESARIAS (Versión Modular)
// Asegúrate de que la ruta "./auth_firebase.js" sea correcta (si ambos archivos están en la carpeta js/)
import { auth, db } from "../nav-alice-usuarios/js/auth_firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Esperamos a que el DOM cargue
window.addEventListener('DOMContentLoaded', () => {
  const chatbox = document.getElementById('chatBox');
  const sendSound = document.getElementById('sendSound');
  const receiveSound = document.getElementById('receiveSound');
  const userInputField = document.getElementById('userMessage');
  const sendBtn = document.getElementById('sendBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userEmailSpan = document.getElementById('userEmail');
  const alertSound = document.getElementById('alertSound');

  // Elementos de Opinión
  const opinionBtn = document.getElementById('opinionBtn');
  const opinionModal = document.getElementById('opinionModal');
  const enviarOpinionBtn = document.getElementById('enviarOpinionBtn');
  const cancelarOpinionBtn = document.getElementById('cancelarOpinionBtn');
  const opinionText = document.getElementById('opinionText');
  const stars = document.querySelectorAll('.stars span');
  const verGraficaBtn = document.getElementById('verGraficaBtn');

  let calificacion = 0;

  if (!chatbox || !userInputField || !sendBtn || !logoutBtn || !userEmailSpan) {
    console.error('⚠️ Elementos del chat no encontrados en el DOM.');
    return;
  }

  // === FUNCIONES AUXILIARES (Lógica del Chat) ===

  // Palabras graves
  const patronesGraves = [
    /su[i1!|]c[i1!|]d[i1!|]o/i, /su[i1!|]c[i1!|]d[a4]rme/i, /m[a4]t[a4]rme/i,
    /q[u]?i[e]?r[o]? m[o0]r[i1!|]r/i, /n[o0] qu[i1!|]r[o]? v[i1!|]v[i1!|]r/i,
    /d[e]?s[e]?p[e]?r[a4]c[e]?r/i, /t[e]?rmin[a4]r t[o0]d[o0]/i,
    /n[o0] p[u]?e?d[o0] m[a4][s5]/i, /est[o0]y c[a4]ns[a4]d[o0]/i,
    /aut[o0]l[e3]s[i1!|][o0]n/i, /d[e3]sp[e3]r[a4]d[o0][a4]?/i
  ];

  function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function containsGraveWord(text) {
    const normalized = normalizeText(text);
    return patronesGraves.some(regex => regex.test(normalized));
  }

  function createBotMessage(text, isHelp = false) {
    const botMessage = document.createElement('div');
    botMessage.className = isHelp ? 'bot-message-help message' : 'bot-message message';
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
    botMessage.innerHTML = `<div class="bot-bubble"><b>Alice:</b><br>${formattedText}</div>`;
    chatbox.appendChild(botMessage);
    leerTexto(text);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function createUserMessage(text) {
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message message';
    userMessage.innerHTML = `<div class="user-bubble">${text}</div>`;
    chatbox.appendChild(userMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

// Modifica tu función showTyping para deshabilitar el input
// Busca la función showTyping existente y reemplázala COMPLETAMENTE por esta:
function showTyping(callback) {
  // 1. Deshabilitar controles (Mejora de usabilidad)
  const userInputField = document.getElementById('userMessage');
  const sendBtn = document.getElementById('sendBtn');
  const chatbox = document.getElementById('chatBox'); // Asegúrate de tener esta referencia

  if (userInputField) userInputField.disabled = true;
  if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = "...";
  }

  // 2. Crear burbuja de "escribiendo"
  const typingBubble = document.createElement('div');
  typingBubble.className = 'bot-message typing';
  typingBubble.innerHTML = `<div class="bot-bubble typing-bubble"><b>Alice</b> está escribiendo<span class="typing-dots"></span></div>`;
  if (chatbox) {
      chatbox.appendChild(typingBubble);
      chatbox.scrollTop = chatbox.scrollHeight;
  }

  // 3. Animación de puntos (Aquí definimos dotInterval)
  let count = 0;
  const dots = typingBubble.querySelector('.typing-dots');
  
  // ESTA ES LA VARIABLE QUE FALTABA:
  const dotInterval = setInterval(() => {
    count = (count + 1) % 4;
    if (dots) dots.textContent = '.'.repeat(count);
  }, 400);

  // 4. Finalizar animación y ejecutar callback
  setTimeout(() => {
    clearInterval(dotInterval); // Ahora sí existe
    if (typingBubble.parentNode) typingBubble.parentNode.removeChild(typingBubble);
    
    // Reactivar controles
    if (userInputField) {
        userInputField.disabled = false;
        userInputField.focus();
    }
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = "Enviar";
    }
    
    if (callback) callback();
  }, 1800 + Math.random() * 800);
}

  // === AUTENTICACIÓN (CORREGIDA A MODULAR) ===
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmailSpan.textContent = user.email;
    } else {
      window.location.href = "../nav-alice-usuarios/login.html"; // Asegúrate que sea login.html y no inicioSesion.html si cambiaste el nombre
    }
  });

  // === LÓGICA DE ENVÍO ===

  // Definimos la función principal de envío
  // (Nota: Esta función se reasigna más abajo para incluir la lógica del diario)
  let mainEnviarMensaje = async (event) => {
    if (event) event.preventDefault();

    const userInput = userInputField.value.trim();
    if (!userInput) return;

    createUserMessage(userInput);

    // 1. Detección de palabras graves
    const palabraDetectada = containsGraveWord(userInput);
    if (palabraDetectada) {
      if (alertSound) try { alertSound.play(); } catch (e) { }
      createBotMessage(`🕊️ <b>Entiendo que estás pasando por un momento muy difícil...</b> (Información de ayuda omitida por brevedad)`, true);
      userInputField.value = '';
      return;
    }

    // 2. Procesar Test de Ansiedad
    if (procesarRespuestaTest(userInput)) {
      userInputField.value = '';
      return;
    }

    // 3. Comandos de Diario/Gráfica
    if (userInput.toLowerCase().includes("ver mi diario")) {
      mostrarDiario();
      userInputField.value = '';
      return;
    }
    if (userInput.toLowerCase().includes("ver mi grafica") || userInput.toLowerCase().includes("ver mi evolución")) {
      mostrarGraficaEmocional();
      userInputField.value = '';
      return;
    }

    // 4. Respuesta Normal (Chatbot)
    showTyping(async () => {
      // Asegúrate de tener chatbot.js importado o disponible si usas obtenerRespuestaGemini
      if (typeof obtenerRespuestaGemini === 'function') {
        const respuestaIA = await obtenerRespuestaGemini(userInput);
        createBotMessage(respuestaIA);
      } else {
        createBotMessage("Lo siento, mi cerebro (Gemini) no está conectado en este momento.");
      }
      if (receiveSound) receiveSound.play();
    });

    userInputField.value = '';
  }

  // === EVENTOS ===
  sendBtn.addEventListener('click', (e) => wrappedEnviarMensaje(e));
  userInputField.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      wrappedEnviarMensaje();
    }
  });

  // CERRAR SESIÓN (CORREGIDO)
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = "../nav-alice-usuarios/login.html";
    } catch (err) {
      alert("Error al cerrar sesión: " + err.message);
    }
  });

  // === MENSAJE INICIAL ===
  if (!window._mensajeInicialMostrado) {
    showTyping(() => {
      createBotMessage("¡Hola! 🌷 Soy <b>Alice</b>.");
      showTyping(() => {
        createBotMessage("Antes de comenzar, ¿te gustaría hacer un breve test para conocer tu nivel actual de ansiedad? 😊<br><i>(Responde 'sí' o 'no')</i>");
      });
    });
    window._mensajeInicialMostrado = true;
  }

  // === LÓGICA DEL TEST DE ANSIEDAD (Sin cambios, solo funciona localmente) ===
  const testPreguntas = [
    "¿Con qué frecuencia sientes nerviosismo o inquietud sin motivo claro?",
    "¿Tienes dificultad para relajarte incluso en momentos tranquilos?",
    "¿Sueles preocuparte por cosas pequeñas o cotidianas?",
    "¿Notas tensión física (como respiración rápida o palpitaciones)?",
    "¿Tus pensamientos te hacen sentir que no puedes controlar tu ansiedad?"
  ];
  let respuestas = [];
  let preguntaActual = 0;
  let enTest = false;

  function procesarRespuestaTest(texto) {
    const respuesta = texto.toLowerCase().trim();
    if (respuesta.includes("test")) {
      respuestas = []; preguntaActual = 0; enTest = true;
      createBotMessage("Perfecto 💛. Empecemos de nuevo. Recuerda responder con un número del 1 al 5.");
      setTimeout(() => createBotMessage(testPreguntas[preguntaActual]), 1000);
      return true;
    }
    if (!enTest && preguntaActual === 0) {
      if (respuesta === "sí" || respuesta === "si") {
        enTest = true;
        createBotMessage("Perfecto 💛. Responde del 1 al 5:\n1️⃣=Nunca ... 5️⃣=Siempre");
        setTimeout(() => createBotMessage(testPreguntas[preguntaActual]), 1000);
        return true;
      } else if (respuesta === "no") {
        createBotMessage("Está bien 🌿. Hablemos de otra cosa.");
        return true;
      }
      return false;
    }
    const valor = parseInt(respuesta);
    if (!isNaN(valor) && valor >= 1 && valor <= 5) {
      respuestas.push(valor);
      preguntaActual++;
      if (preguntaActual < testPreguntas.length) {
        createBotMessage(`(${preguntaActual + 1}/${testPreguntas.length}) ${testPreguntas[preguntaActual]}`);
      } else {
        const promedio = respuestas.reduce((a, b) => a + b, 0) / testPreguntas.length;
        const porcentaje = Math.round((promedio - 1) / 4 * 100);
        createBotMessage(`Tu nivel de ansiedad estimado es <b>${porcentaje}%</b>. Recuerda que esto no es un diagnóstico.`);
        enTest = false;
      }
      return true;
    }
    return false;
  }

  // === FIREBASE: DIARIO EMOCIONAL (CORREGIDO) ===
  async function guardarEntradaDiario(texto) {
    if (!auth.currentUser) {
      createBotMessage("⚠️ Necesitas iniciar sesión para guardar tu diario.");
      return;
    }
    const entrada = {
      email: auth.currentUser.email,
      texto,
      fecha: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "diarioEmocional"), entrada);
      createBotMessage("🌿 He guardado tu reflexión. ¡Gracias! 💛");
    } catch (err) {
      console.error("Error diario:", err);
      createBotMessage("😔 Error al guardar.");
    }
  }

  function detectarDiario(texto) {
    const t = texto.toLowerCase();
    return (t.includes("diario") || t.includes("hoy me siento") || t.includes("quiero contar"));
  }

  // === MODAL DE OPINIÓN ===
  opinionBtn.addEventListener('click', () => opinionModal.style.display = 'flex');
  cancelarOpinionBtn.addEventListener('click', () => {
    opinionModal.style.display = 'none';
    opinionText.value = '';
    stars.forEach(s => s.classList.remove('selected'));
    calificacion = 0;
  });
/// === BUSCA ESTA PARTE EN TU SCRIPT.JS Y REEMPLÁZALA ===

stars.forEach((star, index) => { // Agregamos 'index' aquí para saber la posición
    
    // Función común para seleccionar
    const selectStar = () => {
        calificacion = parseInt(star.dataset.value);
        stars.forEach(s => {
            s.classList.remove('selected');
            s.setAttribute('aria-checked', 'false');
        });
        // Lógica visual
        for (let i = 0; i < calificacion; i++) {
            stars[i].classList.add('selected');
            stars[i].setAttribute('aria-checked', 'true');
        }
    };

    // 1. Evento Mouse (Clic)
    star.addEventListener('click', selectStar);
    
    // 2. Evento Teclado (Accesibilidad Completa)
    star.addEventListener('keydown', (e) => {
        // Seleccionar con Enter o Espacio
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectStar();
        }
        
        // Moverse con Flechas (Derecha -> Siguiente, Izquierda <- Anterior)
        else if (e.key === 'ArrowRight') {
            e.preventDefault();
            // Si no es la última estrella, mueve el foco a la siguiente
            if (index < stars.length - 1) {
                stars[index + 1].focus();
            }
        } 
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            // Si no es la primera estrella, mueve el foco a la anterior
            if (index > 0) {
                stars[index - 1].focus();
            }
        }
    });
});

  let enviandoOpinion = false;
// Lista de malas palabras (puedes agregar más)
const malasPalabras = ["puta", "mierda", "estupido", "idiota", "pendejo", "imbecil","huevos","prostituta","pene","culo","verga"];

function contieneGroserias(texto) {
  // 1. Convertir a minúsculas
  let textoLimpio = texto.toLowerCase();

  // 2. Reemplazar "trucos" visuales (símbolos por letras)
  textoLimpio = textoLimpio
      .replace(/@/g, 'a')
      .replace(/4/g, 'a')
      .replace(/1/g, 'i')
      .replace(/!/g, 'i')
      .replace(/3/g, 'e')
      .replace(/0/g, 'o')
      .replace(/\$/g, 's');

  // 3. Quitar acentos normales (á -> a)
  textoLimpio = textoLimpio.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 4. Verificar si contiene las palabras prohibidas
  // Usamos Regex con \b para buscar la palabra completa (evita borrar "computadora")
  return malasPalabras.some(palabra => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'i');
    return regex.test(textoLimpio);
  });
}

  enviarOpinionBtn.addEventListener('click', async () => {
    if (enviandoOpinion) return;
    enviandoOpinion = true;

    const texto = opinionText.value.trim();
if (!texto || calificacion === 0) {
      // Borraste el alert() y pones esto:
      Swal.fire({
          title: 'Faltan datos',
          text: 'Por favor escribe una opinión y selecciona las estrellas 🌟',
          icon: 'warning',
          confirmButtonColor: '#6bcf9d'
      });
      enviandoOpinion = false; 
      return;
    }

    if (contieneGroserias(texto)) {
      Swal.fire({
          title: 'Lenguaje no permitido',
          text: '⚠️ Por favor mantén un lenguaje respetuoso.',
          icon: 'error',
          confirmButtonColor: '#d33'
      });
      enviandoOpinion = false; 
      return;
    }

    const user = auth.currentUser;
    const nombreUsuario = user ? (user.displayName || user.email.split('@')[0]) : "Anónimo";

    try {
      await addDoc(collection(db, "opiniones"), {
        nombre: nombreUsuario,
        texto,
        calificacion,
        fecha: new Date().toISOString()
      });
Swal.fire({
          title: '¡Gracias!',
          text: `💖 Tu opinión ha sido guardada, ${nombreUsuario}.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
      });

      opinionModal.style.display = 'none';
      opinionText.value = '';
      stars.forEach(s => {
          s.classList.remove('selected');
          s.setAttribute('aria-checked', 'false'); // Si ya agregaste la accesibilidad
      });
      calificacion = 0;
      
    } catch (err) {
      console.error('Error opinión:', err);
      // Sugerencia: Cambia también el alert de error
      Swal.fire({
          title: 'Error',
          text: 'No se pudo guardar tu opinión.',
          icon: 'error'
      });
    } finally {
      enviandoOpinion = false;
    }
  });

  // === LÓGICA DE FLUJO DE DIARIO INTEGRADA ===
  let modoDiario = false;
  let esperandoIntensidad = false;
  let emocionActual = "";

  async function guardarEmocion(emocion, intensidad) {
    if (!auth.currentUser) return;
    await addDoc(collection(db, "diario_emocional"), {
      usuario: auth.currentUser.email,
      emocion,
      intensidad,
      fecha: Timestamp.now()
    });
  }

  // Función "wrapper" que decide si es mensaje normal o diario
  async function wrappedEnviarMensaje(event) {
    if (event) event.preventDefault();
    const userInput = userInputField.value.trim();
    if (!userInput) return;

    createUserMessage(userInput);

    // Comandos de ver gráfica
    if (userInput.toLowerCase().includes("ver gráfica") || userInput.toLowerCase().includes("ver emociones")) {
      showTyping(mostrarGraficaEmociones); // Nota: corrección de nombre abajo
      userInputField.value = "";
      return;
    }

    // Activar modo diario
    if (!modoDiario && detectarDiario(userInput)) {
      modoDiario = true;
      showTyping(() => createBotMessage("📝 Cuéntame, ¿cómo te sientes hoy?"));
      userInputField.value = "";
      return;
    }

    // Flujo de captura de diario
    if (modoDiario) {
      if (!esperandoIntensidad) {
        emocionActual = userInput;
        esperandoIntensidad = true;
        showTyping(() => createBotMessage("Del 1 al 5, ¿qué tan intensa fue esta emoción?"));
        userInputField.value = "";
        return;
      } else {
        const valor = parseInt(userInput);
        if (!isNaN(valor) && valor >= 1 && valor <= 5) {
          await guardarEmocion(emocionActual, valor);
          showTyping(() => createBotMessage("🌷 Guardado. ¡Gracias!"));
          modoDiario = false;
          esperandoIntensidad = false;
        } else {
          createBotMessage("Por favor, un número entre 1 y 5 💛");
        }
        userInputField.value = "";
        return;
      }
    }

    // Si no es diario, usar lógica normal
    // Aquí llamamos a la lógica original que movimos arriba
    // Replicamos la lógica simple del "mainEnviarMensaje" para no hacer bucles raros
    if (procesarRespuestaTest(userInput)) { userInputField.value = ''; return; }

    showTyping(async () => {
      if (typeof obtenerRespuestaGemini === 'function') {
        const r = await obtenerRespuestaGemini(userInput);
        createBotMessage(r);
      } else {
        createBotMessage("Lo siento, no puedo conectar con la IA ahora.");
      }
      if (receiveSound) receiveSound.play();
    });
    userInputField.value = '';
  }


  // === LEER DIARIO Y GRÁFICAS (CORREGIDO) ===
  async function mostrarDiario() {
    if (!auth.currentUser) { createBotMessage("⚠️ Inicia sesión."); return; }
    try {
      const q = query(collection(db, "diarioEmocional"), where("email", "==", auth.currentUser.email), orderBy("fecha", "desc"), limit(5));
      const snapshot = await getDocs(q);

      if (snapshot.empty) { createBotMessage("📭 Diario vacío."); return; }
      let texto = "📔 Tus últimas reflexiones:\n";
      snapshot.forEach(doc => {
        const data = doc.data();
        const f = new Date(data.fecha).toLocaleDateString();
        texto += `🗓️ <b>${f}</b>: ${data.texto}\n\n`;
      });
      createBotMessage(texto);
    } catch (err) { console.error(err); createBotMessage("Error al leer diario."); }
  }

  let grafica;
  async function mostrarGraficaEmociones() { // Ojo: renombré la función para que coincida
    const user = auth.currentUser;
    if (!user) { createBotMessage("Debes iniciar sesión 🌷"); return; }
    const graficaContainer = document.getElementById('graficaContainer');

    try {
      const q = query(collection(db, "diario_emocional"), where("usuario", "==", user.email), orderBy("fecha", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) { createBotMessage("📭 Sin datos para gráfica."); return; }

      const fechas = [];
      const emociones = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Convertir Timestamp de Firestore a JS Date si es necesario
        const fechaObj = data.fecha && data.fecha.toDate ? data.fecha.toDate() : new Date(data.fecha);
        fechas.push(fechaObj.toLocaleDateString());

        // Usar intensidad si existe, sino calcular (lógica original)
        let valor = data.intensidad || 3;
        emociones.push(valor);
      });

      if (graficaContainer) graficaContainer.style.display = "block";
      const ctx = document.getElementById("graficaEmociones").getContext("2d");
      if (grafica) grafica.destroy();

      grafica = new Chart(ctx, {
        type: "line",
        data: {
          labels: fechas,
          datasets: [{
            label: "Bienestar (1-5)",
            data: emociones,
            borderColor: "#4caf50",
            tension: 0.3
          }]
        }
      });
      createBotMessage("✨ Aquí tienes tu evolución.");
    } catch (err) { console.error(err); createBotMessage("Error al generar gráfica."); }
  }

  // Botón Sidebar
  if (verGraficaBtn) verGraficaBtn.addEventListener('click', mostrarGraficaEmociones);

});
// === LÓGICA DEL WIDGET DE ACCESIBILIDAD ===

// 1. Abrir/Cerrar Menú
const toggleBtn = document.getElementById('toggle-access-btn');
const menu = document.getElementById('access-menu');

if(toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = menu.style.display === 'none';
        menu.style.display = isHidden ? 'flex' : 'none';
        // Accesibilidad: cambiar el aria-expanded
        toggleBtn.setAttribute('aria-expanded', isHidden);
    });
}

// 2. Zoom de Texto
let currentZoom = 1;
window.cambiarTexto = (direction) => {
    currentZoom += direction * 0.1;
    if (currentZoom < 0.8) currentZoom = 0.8; // Mínimo
    if (currentZoom > 1.5) currentZoom = 1.5; // Máximo
    document.body.style.fontSize = `${currentZoom}em`;
};

// 3. Alto Contraste
window.toggleAltoContraste = () => {
    document.body.classList.toggle('high-contrast');
};

// 4. Reset
window.resetAccesibilidad = () => {
    currentZoom = 1;
    document.body.style.fontSize = '1em';
    document.body.classList.remove('high-contrast');
};
// === AL FINAL DE SCRIPT.JS ===

// 1. Configuración del Reconocimiento de Voz
const micBtn = document.getElementById('micBtn');
const userInput = document.getElementById('userMessage');

// Verificamos si el navegador soporta voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Idioma español
    recognition.continuous = false; // Se detiene al dejar de hablar

    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('escuchando')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        micBtn.classList.add('escuchando');
        micBtn.innerHTML = '🛑'; // Icono de Stop
        micBtn.setAttribute('aria-label', 'Detener dictado');
        userInput.placeholder = "Escuchando...";
    };

    recognition.onend = () => {
        micBtn.classList.remove('escuchando');
        micBtn.innerHTML = '🎤';
        micBtn.setAttribute('aria-label', 'Activar dictado por voz');
        userInput.placeholder = "Escribe aquí...";
        userInput.focus(); // Devolver el foco al input
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        // Opcional: Enviar automáticamente al terminar de hablar
        // document.getElementById('sendBtn').click(); 
    };
} else {
    // Si el navegador es muy viejo y no soporta voz
    if(micBtn) micBtn.style.display = 'none';
}

// 2. (OPCIONAL) Que Alice hable en voz alta
function leerTexto(texto) {
    // Cancelar si ya está hablando
    window.speechSynthesis.cancel();

    // Limpiar el texto de emojis y etiquetas HTML para que no las lea raro
    const textoLimpio = texto.replace(/<[^>]*>?/gm, ''); 
    
    const utter = new SpeechSynthesisUtterance(textoLimpio);
    utter.lang = 'es-ES';
    utter.rate = 1; // Velocidad normal
    window.speechSynthesis.speak(utter);
}

