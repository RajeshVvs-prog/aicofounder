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
    const { field, problemType, targetUsers } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Generate 3 innovative startup ideas based on:
Field: ${field}
Problem Type: ${problemType}
Target Users: ${targetUsers}

Return ONLY valid JSON in this format:
{
  "ideas": [
    {
      "title": "Idea name",
      "description": "Brief description",
      "target_audience": "Who it's for",
      "unique_value": "What makes it unique",
      "score": 85,
      "emoji": "💡"
    }
  ]
}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(result);

  } catch (error) {
    console.error("Generate error:", error.message);
    console.error("Stack:", error.stack);
    console.error("API Key exists:", !!process.env.GROQ_API_KEY);
    res.status(500).json({ 
      error: "An error occurred. Please try again.",
      details: error.message 
    });
  }
}
