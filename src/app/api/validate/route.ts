import { GoogleGenAI, Type } from "@google/genai";
import { validateIdea, sanitizeInput } from "@/src/lib/validation";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea } = body;

    // Validate input
    const validation = validateIdea(idea);
    if (!validation.valid) {
      return Response.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedIdea = sanitizeInput(idea);

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
${sanitizedIdea}

---
Provide your response in the following sections:

1. Problem Clarity (Score /10)
   - What exact problem is being solved?
   - Is this a real and meaningful problem?
   - Who experiences this problem most?

2. Target Users & Need Strength (Score /10)
   - Who are the primary users?
   - How badly do they need this solution?
   - Is this a must-have or nice-to-have?

3. Market Opportunity (Score /10)
   - Is this a growing, stable, or declining space?
   - Approximate scale (large market, niche, etc.)

4. Competitive Landscape (Score /10)
   - Who are the main competitors?
   - How is this different?
   - Is the market too crowded?

5. Unique Value Proposition (UVP) (Score /10)
   - What is the "unfair advantage"?
   - Why would users switch?

6. Feasibility & Execution (Score /10)
   - How hard is this to build?
   - Key technical or operational challenges?

7. Monetization Potential (Score /10)
   - How will this make money?
   - Is it sustainable?

8. Risks & Challenges (Score /10)
   - What could kill this in 6 months?

9. Improvements (Score /10)
   - 2–3 ways to make this 10x better

---
Return output STRICTLY in JSON:

{
  "slides": [
    {
      "title": "Problem Clarity",
      "score": 0,
      "content": ""
    }
  ],
  "final_score": 0,
  "verdict": "",
  "final_opinion": ""
}`
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

    const rawText = response.text;

    if (!rawText) {
      return Response.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let result;
    try {
      result = JSON.parse(rawText);
    } catch (err) {
      console.error("Parse error:", err);
      return Response.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    return Response.json(result);

  } catch (error) {
    console.error("Server error:", error);
    return Response.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}