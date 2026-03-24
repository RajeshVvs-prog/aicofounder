import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert startup co-founder, product strategist, and investor.
Your task is to deeply analyze a startup idea and provide a thorough, structured evaluation as if you are deciding whether to invest time and money into it.
Do NOT give generic or surface-level answers. Think critically, deeply, and realistically.
Be honest and slightly critical, not overly positive. Avoid generic statements.
Depth is more important than length.

Startup Idea:
${idea}

---
Provide your response in the following sections:

1. Problem Clarity (Score /10)
2. Target Users & Need Strength (Score /10)
3. Market Opportunity (Score /10)
4. Competitive Landscape (Score /10)
5. Unique Value Proposition (UVP) (Score /10)
6. Feasibility & Execution (Score /10)
7. Monetization Potential (Score /10)
8. Risks & Challenges (Score /10)
9. Improvements (Score /10)

---
Return output in JSON format exactly as specified.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  content: { type: Type.STRING }
                },
                required: ["title", "score", "content"]
              }
            },
            final_score: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            final_opinion: { type: Type.STRING }
          },
          required: ["slides", "final_score", "verdict", "final_opinion"]
        }
      }
    });

    if (!response.text) {
      return Response.json({ error: "No response text" }, { status: 500 });
    }

    return Response.json(JSON.parse(response.text));

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}