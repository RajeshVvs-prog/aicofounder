const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

console.log("Server starting...");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/validate", async (req, res) => {
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
    res.json(result);

  } catch (error) {
    console.error("Validate error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

app.post("/api/generate", async (req, res) => {
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
    res.json(result);

  } catch (error) {
    console.error("Generate error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

app.post("/api/market", async (req, res) => {
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
    res.json(result);

  } catch (error) {
    console.error("Market error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

app.post("/api/execution", async (req, res) => {
  try {
    const { idea } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Create a detailed 7-day MVP execution plan for this startup idea:
${idea}

Return ONLY valid JSON in this format:
{
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "objective": "What to achieve",
      "tools": ["Tool 1", "Tool 2"],
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "tips": "Helpful tips"
    }
  ]
}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error("Execution error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001");
  console.log("🤖 Using Groq AI (Llama 3.3 70B)");
});
