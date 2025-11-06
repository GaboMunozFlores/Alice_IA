window.addEventListener('DOMContentLoaded', () => {
  const chatbox = document.getElementById('chatBox');
  const sendSound = document.getElementById('sendSound');
  const receiveSound = document.getElementById('receiveSound');
  const userInputField = document.getElementById('userMessage');
  const sendBtn = document.getElementById('sendBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userEmailSpan = document.getElementById('userEmail');
  const alertSound = document.getElementById('alertSound');
  const opinionBtn = document.getElementById('opinionBtn');
const opinionModal = document.getElementById('opinionModal');
const enviarOpinionBtn = document.getElementById('enviarOpinionBtn');
const cancelarOpinionBtn = document.getElementById('cancelarOpinionBtn');
const opinionText = document.getElementById('opinionText');
const stars = document.querySelectorAll('.stars span');

let calificacion = 0;

  if (!chatbox || !userInputField || !sendBtn || !logoutBtn || !userEmailSpan) {
    console.error('Elementos de chat no encontrados en el DOM.');
    return;
  }

  // === FUNCIONES AUXILIARES ===

  // Palabras graves o variantes (errores intencionales)
  const patronesGraves = [
    /su[i1!|]c[i1!|]d[i1!|]o/i,
    /su[i1!|]c[i1!|]d[a4]rme/i,
    /m[a4]t[a4]rme/i,
    /q[u]?i[e]?r[o]? m[o0]r[i1!|]r/i,
    /n[o0] qu[i1!|]r[o]? v[i1!|]v[i1!|]r/i,
    /d[e]?s[e]?p[e]?r[a4]c[e]?r/i,
    /t[e]?rmin[a4]r t[o0]d[o0]/i,
    /n[o0] p[u]?e?d[o0] m[a4][s5]/i,
    /est[o0]y c[a4]ns[a4]d[o0]/i,
    /aut[o0]l[e3]s[i1!|][o0]n/i,
    /d[e3]sp[e3]r[a4]d[o0][a4]?/i
  ];

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function containsGraveWord(text) {
    const normalized = normalizeText(text);
    return patronesGraves.some(regex => regex.test(normalized));
  }

  // Crear mensaje de Alice
  function createBotMessage(text, isHelp = false) {
    const botMessage = document.createElement('div');
    botMessage.className = isHelp ? 'bot-message-help message' : 'bot-message message';

    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/\n/g, '<br>');

    botMessage.innerHTML = `
      <div class="bot-bubble">
        <b>Alice:</b><br>${formattedText}
      </div>
    `;

    chatbox.appendChild(botMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Crear mensaje del usuario
  function createUserMessage(text) {
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message message';
    userMessage.innerHTML = `
      <div class="user-bubble">${text}</div>
    `;
    chatbox.appendChild(userMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Efecto de escritura
  function showTyping(callback) {
    const typingBubble = document.createElement('div');
    typingBubble.className = 'bot-message typing';
    typingBubble.innerHTML = `
      <div class="bot-bubble typing-bubble">
        <b>Alice</b> está escribiendo<span class="typing-dots"></span>
      </div>
    `;
    chatbox.appendChild(typingBubble);
    chatbox.scrollTop = chatbox.scrollHeight;

    let count = 0;
    const dots = typingBubble.querySelector('.typing-dots');
    const dotInterval = setInterval(() => {
      count = (count + 1) % 4;
      dots.textContent = '.'.repeat(count);
    }, 400);

    setTimeout(() => {
      clearInterval(dotInterval);
      chatbox.removeChild(typingBubble);
      if (callback) callback();
    }, 1800 + Math.random() * 800);
  }

  // === FIREBASE ===
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      userEmailSpan.textContent = user.email;
    } else {
      window.location.href = "inicioSesion.html";
    }
  });

  // === ENVÍO DE MENSAJE ===
  function enviarmensaje(event) {
    if (event) event.preventDefault();

    const userInput = userInputField.value.trim();
    if (!userInput) return;

    createUserMessage(userInput);

    const palabraDetectada = containsGraveWord(userInput);
    if (palabraDetectada) {
      if (alertSound) {
        try { alertSound.play(); } catch (e) { console.log("No se pudo reproducir sonido."); }
      }

      createBotMessage(`
        🕊️ <b>Entiendo que estás pasando por un momento muy difícil 💛</b><br><br>
        No estás solo/a. Hablar con alguien puede ayudarte.  
        Como asistente de IA, no estoy capacitada para ofrecerte la ayuda profesional que necesitas en este momento.  
        Te recomiendo contactar con una línea de ayuda inmediatamente:<br><br>
        ☎️ <b>SAPTEL:</b> 800 472 7835 — Apoyo emocional y crisis psicológica<br>
        ☎️ <b>Línea de la Vida:</b> 800 911 2000 — Orientación emocional<br><br>
        💬 <a href="https://www.gob.mx/lineadelavida" target="_blank">Chat Línea de la Vida</a><br>
        💬 <a href="https://saptel.org.mx/" target="_blank">Chat SAPTEL</a><br><br>
        <b>Tu vida y tu bienestar son muy valiosos 🌷</b>
      `, true);

      userInputField.value = '';
      return;
    }

    // Procesar test
    if (procesarRespuestaTest(userInput)) {
      userInputField.value = '';
      return;
    }

    // Si no es parte del test, envía al bot normal
    fetch("chatbot.php", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    })
      .then(res => res.json())
      .then(data => {
        showTyping(() => {
          const response = data.error ? `Bot: ${data.error}` : `Alice: ${data.response}`;
          createBotMessage(response);
          if (receiveSound) receiveSound.play();
        });
      })
      .catch(err => {
        showTyping(() => {
          createBotMessage('Lo siento, ocurrió un error al conectar con el servidor 💭');
          if (receiveSound) receiveSound.play();
        });
      });

    userInputField.value = '';
  }

  // === EVENTOS ===
  sendBtn.addEventListener('click', enviarmensaje);
  userInputField.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarmensaje();
    }
  });

  logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "inicioSesion.html";
    }).catch(err => alert("Error al cerrar sesión: " + err.message));
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

  // === TEST DE ANSIEDAD ===
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
      respuestas = [];
      preguntaActual = 0;
      enTest = true;
      createBotMessage("Perfecto 💛. Empecemos de nuevo. Recuerda responder con un número del 1 al 5.");
      setTimeout(() => createBotMessage(testPreguntas[preguntaActual]), 1000);
      return true;
    }

    if (!enTest && preguntaActual === 0) {
      if (respuesta === "sí" || respuesta === "si") {
        enTest = true;
        createBotMessage("Perfecto 💛. Por favor, responde con un número del 1 al 5:\n\n1️⃣ = Nunca\n2️⃣ = Rara vez\n3️⃣ = A veces\n4️⃣ = Frecuentemente\n5️⃣ = Casi siempre");
        setTimeout(() => createBotMessage(testPreguntas[preguntaActual]), 1000);
        return true;
      } else if (respuesta === "no") {
        createBotMessage("Está bien 🌿. Podemos hablar libremente sobre cómo te sientes.");
        return true;
      }
      return false;
    }

    // Validar respuestas 1-5
    const valor = parseInt(respuesta);
    if (!isNaN(valor) && valor >= 1 && valor <= 5) {
      respuestas.push(valor);
      preguntaActual++;

      if (preguntaActual < testPreguntas.length) {
        createBotMessage(`(${preguntaActual + 1}/${testPreguntas.length}) ${testPreguntas[preguntaActual]}`);
      } else {
        const promedio = respuestas.reduce((a, b) => a + b, 0) / testPreguntas.length;
        const porcentaje = Math.round((promedio - 1) / 4 * 100);
        let nivel;
        if (porcentaje < 30) nivel = "bajo 💚";
        else if (porcentaje < 60) nivel = "moderado 💛";
        else nivel = "alto ❤️";

        createBotMessage(`
          Tu nivel de ansiedad estimado es de aproximadamente <b>${porcentaje}%</b> (${nivel}).<br><br>
          ⚠️ Este resultado <b>no es un diagnóstico profesional</b>.  
          Si la ansiedad interfiere con tu vida diaria, te recomiendo hablar con un psicólogo o terapeuta. 🌱<br><br>
          Podemos seguir hablando si quieres. ¿Te gustaría que te dé algunos ejercicios para relajarte?
        `);
        enTest = false;
      }
      return true;
    }

    return false;
  }
// --- Abrir modal ---
opinionBtn.addEventListener('click', () => {
  opinionModal.style.display = 'flex';
});

// --- Cerrar modal ---
cancelarOpinionBtn.addEventListener('click', () => {
  opinionModal.style.display = 'none';
  opinionText.value = '';
  stars.forEach(s => s.classList.remove('selected'));
  calificacion = 0;
});

// --- Seleccionar estrellas ---
stars.forEach(star => {
  star.addEventListener('click', () => {
    calificacion = parseInt(star.dataset.value);
    stars.forEach(s => s.classList.remove('selected'));
    for (let i = 0; i < calificacion; i++) stars[i].classList.add('selected');
  });
});

// --- Enviar opinión ---
enviarOpinionBtn.addEventListener('click', () => {
  const texto = opinionText.value.trim();
  if (!texto || calificacion === 0) {
    alert('Por favor, escribe tu opinión y selecciona una calificación 🌟');
    return;
  }

  const db = firebase.firestore();
  const fecha = new Date().toISOString();

  db.collection("opiniones").add({
    texto,
    calificacion,
    fecha
  })
  .then(() => {
    alert('💖 ¡Gracias por tu opinión! Nos ayuda a mejorar.');
    opinionModal.style.display = 'none';
    opinionText.value = '';
    stars.forEach(s => s.classList.remove('selected'));
    calificacion = 0;
  })
  .catch(err => {
    console.error('Error al guardar la opinión:', err);
    alert('Ocurrió un error al guardar tu opinión. Intenta de nuevo.');
  });
});

});
