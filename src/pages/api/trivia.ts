import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Ya no necesitamos extraer "dificultad" del body, 
    // pero mantenemos la estructura por si envías otros datos.
    const body = await request.json().catch(() => ({}));

    const apiKey = import.meta.env.GEMINI_API_KEY;
    const modelName = "gemini-2.5-flash-lite"; 

    const prompt = `
Actúa como un teólogo y experto en trivias bíblicas. Tu objetivo es generar una pregunta que sea doctrinalmente sólida o de cultura general bíblica.

REQUISITOS DE LA PREGUNTA:
- Puede variar entre temas sencillos (personajes, historias) y temas profundos (doctrina, profecía, teología).
- La pregunta debe ser clara y no prestarse a confusión.
- La respuesta debe ser breve (una palabra o una frase corta).
- Debes incluir la cita bíblica como referencia para validar la respuesta.

RESTRICCIONES EXTRICTAS:
- No menciones la dificultad en el texto.
- Evita preguntas extremadamente obvias (ej. ¿Quién murió por nosotros?).
- NO uses a Adán, Eva, Jonás, Moisés ni Jesús para mantener la trivia variada.

FORMATO DE SALIDA (ESTRICTO JSON):
Responde solo con este objeto:
{
  "pregunta": "Aquí va la pregunta",
  "respuesta": "Aquí la respuesta corta",
  "referencia": "Libro Capítulo:Versículo",
  "categoria": "General o Doctrinal"
}

Hash de aleatoriedad: ${Date.now()}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8, // Bajamos un poco la temperatura para mayor precisión doctrinal
          maxOutputTokens: 300
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error API Gemini:", errorData);
      return new Response(JSON.stringify({ error: "Error al conectar con el motor de IA" }), { status: 500 });
    }

    const result = await response.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    try {
      const parsed = JSON.parse(rawText);
      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (parseError) {
      return new Response(JSON.stringify({ error: "Error procesando el JSON de la IA" }), { status: 500 });
    }

  } catch (error) {
    console.error("Error en el servidor:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 }
    );
  }
};