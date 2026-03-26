// File: /app/api/validate/route.ts (or pages/api/validate.ts for Next.js)
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // MUST be set in Vercel
});

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    // Call Google AI
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

    // Log the raw response for debugging
    console.log("AI Response Raw:", response);

    // Some AI responses may have .text or .output[0].content[0].text
    const rawText = response.text || response.output?.[0]?.content?.[0]?.text;
    if (!rawText) {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse JSON safely
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (err) {
      console.error("JSON parse error:", err, rawText);
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return Response.json(result);

  } catch (error) {
    console.error("Server error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}