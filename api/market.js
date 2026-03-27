import Groq from "groq-sdk";

export default async function handler(req, res) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idea } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Provide comprehensive market research for this startup idea:
${idea}

Return ONLY valid JSON in this format:
{
  "cards": [
    {"title": "Market Overview", "points": ["Point 1", "Point 2", "Point 3"], "score": 85},
    {"title": "Target Audience", "points": ["Point 1", "Point 2", "Point 3"], "score": 80},
    {"title": "Competitors", "points": ["Point 1", "Point 2", "Point 3"], "score": 75},
    {"title": "Opportunities", "points": ["Point 1", "Point 2", "Point 3"], "score": 90},
    {"title": "Risks", "points": ["Point 1", "Point 2", "Point 3"], "score": 70},
    {"title": "Go-to-Market", "points": ["Point 1", "Point 2", "Point 3"], "score": 85}
  ],
  "overall_score": 80,
  "recommendation": "Overall recommendation"
}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(result);

  } catch (error) {
    console.error("Market error:", error.message);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
}
