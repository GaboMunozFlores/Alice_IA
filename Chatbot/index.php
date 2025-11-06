<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chat Alice IA</title>
<link rel="stylesheet" href="estiloss.css">
<style>
  /* --- Modal de Opinión --- */
  .modal {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .modal-content {
    background: #fff; padding: 20px; border-radius: 15px;
    width: 90%; max-width: 400px; text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  .stars span {
    font-size: 28px; cursor: pointer; color: #ccc; transition: color 0.2s;
  }
  .stars span.selected { color: gold; }
  textarea {
    width: 100%; height: 80px; margin: 10px 0; border-radius: 10px; padding: 8px;
  }
  .modal-buttons button {
    margin: 5px; padding: 8px 15px; border: none; border-radius: 10px; cursor: pointer;
  }
  #enviarOpinionBtn { background-color: #6bcf9d; color: white; }
  #cancelarOpinionBtn { background-color: #ccc; }

  /* --- Opiniones en la parte inferior --- */
  #opinionesContainer {
    width: 100%; max-width: 700px; margin: 30px auto; padding: 10px;
  }
  .opinion-card {
    background: #fff; border-radius: 10px; padding: 10px;
    margin: 10px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
</style>
</head>

<body>
<div class="d-flex vh-100">

  <!-- Sidebar -->
  <div class="sidebar d-flex flex-column justify-content-between p-3">
    <div class="top-section d-flex flex-column align-items-center">
      <div class="d-flex align-items-center user-info mb-4">
        <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="User" class="user-icon me-2">
        <span id="userEmail" class="fw-semibold">Usuario</span>
      </div>

      <!-- Botón de Opinión -->
      <button id="opinionBtn" class="btn btn-primary w-100 btn-lg">Danos tu opinión</button>
    </div>

    <button id="logoutBtn" class="btn btn-danger w-100 mt-3">Cerrar sesión</button>
  </div>

  <!-- Chat Area -->
  <div class="chat-area flex-grow-1 d-flex flex-column justify-content-end align-items-center">
    <div class="text-center mb-3">
      <img src="logo-alice.png" alt="Logo Chat" class="logo">
      <h4 class="mt-2">Bienvenido a Alice IA!</h4>
      <p>¿Cómo te sientes hoy?🌷</p>
    </div>

    <div id="chatBox" class="chat-box"></div>

    <div class="input-group mb-3" style="max-width:700px;">
      <input type="text" id="userMessage" class="form-control" placeholder="Escribe aquí...">
      <button class="btn btn-primary" id="sendBtn">Enviar</button>
    </div>
  </div>
</div>

<!-- 🔊 Sonidos -->
<audio id="sendSound" src="sounds/send.mp3"></audio>
<audio id="receiveSound" src="sounds/receive.mp3"></audio>

<!-- 🪟 Modal de Opinión -->
<div id="opinionModal" class="modal" style="display:none;">
  <div class="modal-content">
    <h2>💬 Danos tu opinión</h2>
    <p>Tu experiencia con Alice nos ayuda a mejorar 🌷</p>

    <div class="stars">
      <span data-value="1">★</span>
      <span data-value="2">★</span>
      <span data-value="3">★</span>
      <span data-value="4">★</span>
      <span data-value="5">★</span>
    </div>

    <textarea id="opinionText" placeholder="Escribe tu comentario aquí..." maxlength="300"></textarea>

    <div class="modal-buttons">
      <button id="enviarOpinionBtn">Enviar</button>
      <button id="cancelarOpinionBtn">Cancelar</button>
    </div>
  </div>
</div>

<!-- 🗨️ Opiniones Recientes -->
<div id="opinionesContainer">
  <h3>💭 Opiniones recientes</h3>
</div>

<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="firebase-config.js"></script>

<!-- Script del Chat -->
<script src="script.js"></script>

<!-- Script Opiniones -->
<script>
window.addEventListener('DOMContentLoaded', () => {
  const opinionBtn = document.getElementById('opinionBtn');
  const opinionModal = document.getElementById('opinionModal');
  const enviarOpinionBtn = document.getElementById('enviarOpinionBtn');
  const cancelarOpinionBtn = document.getElementById('cancelarOpinionBtn');
  const opinionText = document.getElementById('opinionText');
  const stars = document.querySelectorAll('.stars span');
  const contenedor = document.getElementById('opinionesContainer');

  let calificacion = 0;

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
      cargarOpiniones(); // refresca lista
    })
    .catch(err => {
      console.error('Error al guardar la opinión:', err);
      alert('Ocurrió un error al guardar tu opinión. Intenta de nuevo.');
    });
  });

  // --- Mostrar opiniones recientes ---
  function cargarOpiniones() {
    const db = firebase.firestore();
    contenedor.innerHTML = "<h3>💭 Opiniones recientes</h3>";

    db.collection("opiniones").orderBy("fecha", "desc").limit(5).get()
      .then(snapshot => {
        if (snapshot.empty) {
          contenedor.innerHTML += "<p>Aún no hay opiniones.</p>";
          return;
        }
        snapshot.forEach(doc => {
          const op = doc.data();
          contenedor.innerHTML += `
            <div class="opinion-card">
              <p>${'⭐'.repeat(op.calificacion)}</p>
              <p>${op.texto}</p>
            </div>
          `;
        });
      })
      .catch(err => console.error('Error al cargar opiniones:', err));
  }

  cargarOpiniones();
});
</script>
</body>
</html>
