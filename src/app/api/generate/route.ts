import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { field, problemType, targetUsers } = body;

    // Validate inputs
    if (!field || !problemType || !targetUsers) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (field.length > 200 || problemType.length > 200 || targetUsers.length > 200) {
      return Response.json(
        { error: "Field inputs must be less than 200 characters" },
        { status: 400 }
      );
    }

    const prompt = `Field: ${field}\nProblem Type: ${problemType}\nTarget Users: ${targetUsers}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an idea generation expert. Generate 3 distinct startup/business/product ideas based on the user's input.

Input:
${prompt}

For each idea, provide:
- Title of Idea
- Short Description: What the idea is, what problem it solves, and how it works.
- Target Audience: Who will use this idea.
- Unique Value / Differentiator: Why it is special.
- Feasibility / Potential Score (0–100): Likelihood of success or impact.
- Emoji / Visual Marker: To make it appealing.

Guidelines:
- Ideas should be practical, innovative, and actionable.
- Keep text concise, readable, and professional.
- Provide a balanced mix of novelty and feasibility.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  target_audience: { type: Type.STRING },
                  unique_value: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  emoji: { type: Type.STRING }
                },
                required: ["title", "description", "target_audience", "unique_value", "score", "emoji"]
              }
            }
          },
          required: ["ideas"]
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
