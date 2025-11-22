<?php
$api_key = "AIzaSyBcoTlwPS3y1EKmZ4e3AbPcJV4_7_BPlOI"; // ⚠️ Reemplázala por tu clave real
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $api_key;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Leer input JSON
$input = json_decode(file_get_contents("php://input"), true);
if (!$input || !isset($input['message'])) {
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$user_message = trim($input['message']);

// --- PROMPT PRINCIPAL ---
$system_prompt = "
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

---

💬 **Ejemplo general**:
'Gracias por confiar en mí 🌱. Lo que sientes importa. Respira profundo, date permiso de sentir y recuerda que pedir ayuda está bien. Estoy aquí para escucharte.'
";

// --- Datos para Gemini ---
$data = [
    "contents" => [
        [
            "parts" => [
                ["text" => $system_prompt]
            ]
        ],
        [
            "parts" => [
                ["text" => $user_message]
            ]
        ]
    ]
];

// --- Envío a Gemini ---
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    echo json_encode(['error' => 'Google Gemini API error']);
    exit;
}

$response_data = json_decode($response, true);

if (!isset($response_data['candidates'][0]['content']['parts'][0]['text'])) {
    echo json_encode(['error' => 'Unexpected API response format']);
    exit;
}

$ai_response = trim($response_data['candidates'][0]['content']['parts'][0]['text']);
echo json_encode(['response' => $ai_response]);
?>
