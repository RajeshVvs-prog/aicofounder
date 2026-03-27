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
              text: `You are a market research expert. Conduct a deep, structured market research report for the following product/market.

Startup Idea:
${sanitizedIdea}

Sections to include:
1. Market Overview: Description, Size & Growth, Trends, Score (0–100).
2. Target Audience Analysis: Customer Segments, Pain Points, Willingness to Pay, Score (0–100).
3. Competitor Analysis: Direct Competitors, Indirect Competitors, Market Positioning, Score (0–100).
4. Market Opportunities: Gaps, Trends to Leverage, Score (0–100).
5. Market Risks & Barriers: Challenges, Threats, Score (0–100).
6. Go-to-Market Insights: Channels, Pricing Strategy, Marketing Hooks, Score (0–100).
7. Overall Market Score: Aggregate score (0–100), Actionable Recommendation.

Guidelines:
- Write in professional, readable, slide-ready style.
- Use bullet points for key points.
- Be deep and realistic.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  score: { type: Type.NUMBER }
                },
                required: ["title", "points", "score"]
              }
            },
            overall_score: { type: Type.NUMBER },
            recommendation: { type: Type.STRING }
          },
          required: ["cards", "overall_score", "recommendation"]
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
