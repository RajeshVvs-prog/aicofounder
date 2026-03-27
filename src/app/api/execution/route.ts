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
              text: `You are an MVP building expert. Generate a 7-day MVP development plan for building a startup/product using AI tools primarily and minimal coding.

Startup Idea:
${sanitizedIdea}

For each day (Card 1 to Card 7), include:
- Day Title / Number
- Objective: What to achieve that day
- Tools & Resources: AI tools, software, or minimal coding solutions to use
- Deliverables / Output: Tangible result for that day
- Tips / Notes: Best practices, focus areas, or cautions

Guidelines:
- Highlight AI-first approach with minimal coding.
- Make the text concise, professional, and readable.
- Use bullet points for clarity.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  tools: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  deliverables: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  tips: { type: Type.STRING }
                },
                required: ["day", "title", "objective", "tools", "deliverables", "tips"]
              }
            }
          },
          required: ["days"]
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
