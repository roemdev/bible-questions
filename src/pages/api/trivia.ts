import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = import.meta.env.GEMINI_API_KEY;
    const modelName = "gemini-2.5-flash-lite"; 

    // Temas de discipulado pero abordados de forma sencilla
    const temas = ["Arrepentimiento", "Salvación", "Fe", "El pecado", "La mente"];
    const temaAzar = temas[Math.floor(Math.random() * temas.length)];

    const prompt = `
Genera una pregunta de trivia bíblica para un grupo de jóvenes. El objetivo es que sea divertida, simple y fácil de responder.

TEMA: ${temaAzar}

REQUISITOS:
- Usa un lenguaje muy sencillo y amigable (nada de términos técnicos complejos).
- La pregunta debe ser directa y fácil de entender.
- La respuesta debe ser muy corta (una o dos palabras).
- Incluye la cita bíblica (referencia) para que el grupo pueda verificarla.
- Asegúrate de que la respuesta sea correcta según la Biblia.

RESTRICCIONES:
- No uses preguntas difíciles ni rebuscadas. 
- No menciones temas aburridos o demasiado densos.
- No incluyas explicaciones largas, solo el JSON.

FORMATO DE SALIDA (JSON ESTRICTO):
{
  "pregunta": "Aquí la pregunta simple",
  "respuesta": "Aquí la respuesta corta",
  "referencia": "Libro Capítulo:Versículo",
  "categoria": "${temaAzar}"
}

ID de juego: ${Math.random().toString(36).substring(7)}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.9, // Subimos un poco para que sea más creativo y variado
          maxOutputTokens: 250
        }
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Error de conexión" }), { status: 500 });
    }

    const result = await response.json();
    let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // Limpieza por si la IA agrega etiquetas markdown
    rawText = rawText.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(rawText);
      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ error: "Error de formato" }), { status: 500 });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
  }
};