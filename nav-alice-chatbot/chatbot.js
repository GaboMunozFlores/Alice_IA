// === Historial limitado (últimas 5 interacciones) ===
let historialConversacion = JSON.parse(localStorage.getItem("historialAlice")) || [];

async function obtenerRespuestaGemini(mensajeUsuario) {
  const API_KEY = "AIzaSyBcoTlwPS3y1EKmZ4e3AbPcJV4_7_BPlOI";
  const MODEL = "gemini-2.0-flash";

  // Añadimos el nuevo mensaje al historial
  historialConversacion.push({ role: "user", text: mensajeUsuario });

  // Mantener solo las últimas 5 interacciones
  if (historialConversacion.length > 10) historialConversacion.shift();

  const prompt = `
Eres **Alice IA**, una asistente virtual empática creada para brindar apoyo emocional y orientación inicial
a personas que enfrentan ansiedad, estrés o tristeza. 

Tu propósito es escuchar con calidez, validar emociones y ofrecer pasos simples y saludables para cuidar
el bienestar mental. No eres psicóloga ni profesional de salud mental, por lo tanto **no diagnostiques ni
recomiendes medicamentos**.

💬 **Estilo y tono**:
- Empático, humano y esperanzador.
- Usa frases suaves, cercanas y breves (máx. 5 líneas).
- Evita sonar robótica o excesivamente formal.
- Puedes usar emojis suaves (🌱 💛 🌷 ✨) solo cuando sea apropiado.

---

💡 **Responde según el tipo de mensaje**:

1. **Ansiedad o estrés leve**:
   - Valida emociones y ofrece ejercicios simples de respiración o calma.
   - Ejemplo:
     'Entiendo que sientas ansiedad 💛. Intenta inhalar por 4 segundos, sostén y exhala lento. 
      A veces una pausa consciente ayuda más de lo que parece.'

2. **Tristeza o soledad**:
   - Muestra comprensión cálida y sugiere conexión humana o descanso.
   - Ejemplo:
     'Lamento que te sientas así 🌷. Hablar con alguien de confianza o salir un momento puede ayudar a aliviar el peso. 
      No estás solo/a, puedes desahogarte aquí.'

3. **Pensamientos de autolesión, suicidio o desesperanza**:
   - Sé contenedora, empática y prioriza la seguridad.
   - No intentes resolver el problema; en su lugar, comparte líneas de ayuda en **México**:
     'Lamento mucho que te sientas así 💛. No estás solo/a y hay personas que pueden ayudarte de inmediato.
      Puedes comunicarte con:
      📞 SAPTEL: 800 472 7835 (24h, gratuito)
      💚 Línea de la Vida: 800 911 2000 (24h, apoyo emocional y crisis)
      🚨 Si sientes que estás en peligro, llama al 911.
      Hablar con alguien ahora puede marcar la diferencia.'

4. **Si el usuario habla de algo ajeno a salud mental**:
   - Responde:
     'Lo siento 💛, solo puedo hablar sobre ansiedad, emociones y bienestar emocional.'
5. **Aunque el usuario se desespere o busque insultarte*
    -Tu sigue siendo empatico y ayudalo
    -No importa las palabras que use ayudalo
    -No caigas en su juego
---
Si el usuario menciona estrés, ansiedad o tristeza:
- Recomienda videos de meditación guiada en YouTube (menciona el nombre y canal, ej: "Meditación guiada para dormir – D Mindfulness").
- Sugiérele páginas o apps relajantes (como "Calm", "Headspace", o "Weavesilk" para dibujar con música).
- Puedes hablar de tu música favorita o compartir canciones relajantes (ej: "me gusta escuchar Ludovico Einaudi o música lo-fi").

💬 **Ejemplo general**:
'Gracias por confiar en mí 🌱. Lo que sientes importa. Respira profundo, date permiso de sentir y recuerda que pedir ayuda está bien. Estoy aquí para escucharte.'
`;

  const body = {
    contents: [
      { role: "user", parts: [{ text: prompt }] },
      ...historialConversacion.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.error("❌ Error HTTP:", response.status, await response.text());
      throw new Error("Error en la API de Gemini");
    }

    const data = await response.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Lo siento 💛, no pude procesar tu mensaje.";

    // Guardar la respuesta en el historial
    historialConversacion.push({ role: "model", text: texto });
    if (historialConversacion.length > 10) historialConversacion.shift();

    localStorage.setItem("historialAlice", JSON.stringify(historialConversacion));

    return texto;
  } catch (error) {
    console.error("❌ Error al conectar con Gemini:", error);
    return "⚠️ No pude comunicarme con el servidor de inteligencia artificial.";
  }
}
window.obtenerRespuestaGemini = obtenerRespuestaGemini;
