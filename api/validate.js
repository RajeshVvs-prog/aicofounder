const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
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
          content: `You are an expert startup co-founder, product strategist, and investor.
Your task is to deeply analyze a startup idea and provide a thorough, structured evaluation.

Startup Idea: ${idea}

Provide your response in the following sections:
1. Problem Clarity (Score /10)
2. Target Users & Need Strength (Score /10)
3. Market Opportunity (Score /10)
4. Competitive Landscape (Score /10)
5. Unique Value Proposition (Score /10)
6. Feasibility & Execution (Score /10)
7. Monetization Potential (Score /10)
8. Risks & Challenges (Score /10)
9. Improvements

Return ONLY valid JSON in this format:
{
  "slides": [
    {"title": "Problem Clarity", "score": 8, "content": "..."},
    {"title": "Target Users & Need", "score": 7, "content": "..."},
    {"title": "Market Opportunity", "score": 9, "content": "..."},
    {"title": "Competitive Landscape", "score": 6, "content": "..."},
    {"title": "Unique Value Proposition", "score": 8, "content": "..."},
    {"title": "Feasibility & Execution", "score": 7, "content": "..."},
    {"title": "Monetization Potential", "score": 8, "content": "..."},
    {"title": "Risks & Challenges", "score": 6, "content": "..."},
    {"title": "Improvements", "score": 0, "content": "..."}
  ],
  "final_score": 59,
  "verdict": "Strong idea",
  "final_opinion": "..."
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
    console.error("Validate error:", error.message);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};
