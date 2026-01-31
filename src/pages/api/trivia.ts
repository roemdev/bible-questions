import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { dificultad } = await request.json();
    const apiKey = import.meta.env.GEMINI_API_KEY;
    
    // Usamos el modelo flash para mayor velocidad
    const modelName = "gemini-2.5-flash-lite"; 

    const prompt = `Actúa como un experto en teología bíblica. 
    Genera una pregunta de trivia nivel ${dificultad}. 
    REGLAS: 
    - Responde EXCLUSIVAMENTE con un objeto JSON puro.
    - No uses bloques de código markdown (sin \`\`\`json).
    - Español neutro (sin modismos argentinos ni castellanos).
    - Incluye referencia bíblica exacta.
    - Estructura: {"pregunta": "...", "respuesta": "...", "referencia": "...", "dificultad": "${dificultad}"}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json", 
          temperature: 0.8 
        }
      })
    });

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
}