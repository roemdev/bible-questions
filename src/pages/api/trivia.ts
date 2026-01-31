// src/pages/api/trivia.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { dificultad } = await request.json();
    const apiKey = import.meta.env.GEMINI_API_KEY;
    const modelName = "gemini-2.5-flash";

    const prompt = `Genera una pregunta de trivia bíblica nivel ${dificultad}. REGLAS: JSON puro, español neutro, incluye referencia exacta. Estructura: {"pregunta": "...", "respuesta": "...", "referencia": "...", "dificultad": "..."}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.9 }
      })
    });

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Fallo en el servidor" }), { status: 500 });
  }
}