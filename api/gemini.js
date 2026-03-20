export default async function handler(req, res) {

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
}