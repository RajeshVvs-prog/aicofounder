import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function validateStartupIdea(idea: string): Promise<EvaluationResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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
   - What exact problem is being solved?
   - Is this a real and meaningful problem?
   - Who experiences this problem most?

2. Target Users & Need Strength (Score /10)
   - Who are the primary users?
   - How badly do they need this solution?
   - Is this a must-have or nice-to-have?

3. Market Opportunity (Score /10)
   - Is this a growing, stable, or declining space?
   - Approximate scale (avoid exact numbers, use terms like “large market”, “niche”, etc.)

4. Competitive Landscape (Score /10)
   - Who are the main competitors?
   - How is this different?
   - Is the market too crowded?

5. Unique Value Proposition (UVP) (Score /10)
   - What is the "unfair advantage"?
   - Why would a user switch from their current solution?

6. Feasibility & Execution (Score /10)
   - How hard is this to build?
   - What are the biggest technical or operational hurdles?

7. Monetization Potential (Score /10)
   - How will this make money?
   - Is the business model sustainable?

8. Risks & Challenges (Score /10)
   - What could kill this business in 6 months?
   - Regulatory, technical, or market risks?

9. Improvements (Score /10)
   - List 2–3 ways to make this idea 10x stronger.

---
Return output in this exact JSON format:
{
  "slides": [
    {
      "title": "Problem Clarity",
      "score": number (out of 10),
      "content": "Detailed but clear explanation answering the specific questions"
    },
    ... (repeat for all 9 sections)
  ],
  "final_score": number (sum out of 100),
  "verdict": "Strong idea / Needs improvement / Weak idea",
  "final_opinion": "Clear, honest recommendation like a co-founder"
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

  if (!response.text) {
    throw new Error("No response text from Gemini");
  }

  return JSON.parse(response.text) as EvaluationResult;
}
