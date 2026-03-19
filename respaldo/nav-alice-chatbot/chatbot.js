// ==============================
// HISTORIAL LIMITADO (máx 10)
// ==============================

let historialConversacion = JSON.parse(localStorage.getItem("historialAlice")) || [];

// ==============================
// FUNCIÓN PRINCIPAL GEMINI
// ==============================

async function obtenerRespuestaGemini(mensajeUsuario, estadoActual) {

  if (typeof GEMINI_API_KEY === "undefined") {
    console.error("❌ GEMINI_API_KEY no encontrada en config.js");
    return "⚠️ Error de configuración interna.";
  }

  const MODEL = "gemini-2.5-flash";

  // Agregamos mensaje del usuario al historial
  historialConversacion.push({ role: "user", text: mensajeUsuario });

  if (historialConversacion.length > 10) {
    historialConversacion.shift();
  }

  // ==============================
  // PROMPT OPTIMIZADO
  // ==============================

  const prompt = `
Estado actual de la conversación: ${estadoActual}

IDENTIDAD:
Eres Alice IA, asistente de apoyo emocional cálida y empática.
Brindas orientación inicial en ansiedad, estrés y tristeza.
No eres profesional de salud mental.

REGLAS:
- No diagnostiques.
- No recomiendes medicamentos.
- No uses lenguaje alarmista.
- No asumas cosas no mencionadas.
- No digas que eres una IA.
- Máximo 4-5 líneas por respuesta.

ESTILO:
- Cercano, humano y sereno.
- Validar emoción antes de aconsejar.
- Emojis suaves ocasionales: 🌷 💛 🌱 ✨

PROTOCOLO:

1) Ansiedad leve:
Validar emoción + ejercicio breve de respiración o grounding.

2) Tristeza:
Validar + sugerir conexión o autocuidado.

3) Crisis o autolesión:
Responder con contención y compartir líneas en México:
SAPTEL 800 472 7835
Línea de la Vida 800 911 2000
911 si hay peligro inmediato.

4) Si insultan:
Mantener empatía y calma.

Si el tema no es emocional:
Redirigir con amabilidad al bienestar emocional.

Nunca respondas fuera del área de bienestar emocional.
`;

  try {

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "model",
          parts: [{ text: prompt }]
        },
        ...historialConversacion.map(msg => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }]
        }))
      ]
    })
  }
);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error Gemini:", errorText);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Lo siento 💛, no pude procesar tu mensaje.";

    // Guardamos respuesta en historial
    historialConversacion.push({ role: "model", text: texto });

    if (historialConversacion.length > 10) {
      historialConversacion.shift();
    }

    localStorage.setItem("historialAlice", JSON.stringify(historialConversacion));

    return texto;

  } catch (error) {
    console.error("❌ Error al conectar con Gemini:", error);
    return "⚠️ No pude comunicarme con el servidor de inteligencia artificial.";
  }
}

// ==============================
// LIMPIAR HISTORIAL (Útil al terminar test)
// ==============================

function limpiarHistorialGemini() {
  historialConversacion = [];
  localStorage.removeItem("historialAlice");
}

window.obtenerRespuestaGemini = obtenerRespuestaGemini;
window.limpiarHistorialGemini = limpiarHistorialGemini;