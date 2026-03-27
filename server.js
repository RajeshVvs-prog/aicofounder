import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Validate API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in .env file');
  process.exit(1);
}
if (apiKey.startsWith('gsk_')) {
  console.error('❌ ERROR: You are using a Groq API key (starts with gsk_)');
  console.error('   This app needs a Google Gemini API key (starts with AIza)');
  console.error('   Get one at: https://aistudio.google.com/app/apikey');
  process.exit(1);
}
if (!apiKey.startsWith('AIza')) {
  console.warn('⚠️  WARNING: API key format looks unusual. Gemini keys usually start with "AIza"');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Validation helper
function validateIdea(idea) {
  if (!idea || typeof idea !== 'string') {
    return { valid: false, error: 'Idea is required' };
  }
  const trimmed = idea.trim();
  if (trimmed.length < 10) {
    return { valid: false, error: 'Idea must be at least 10 characters long' };
  }
  if (trimmed.length > 5000) {
    return { valid: false, error: 'Idea must be less than 5000 characters' };
  }
  return { valid: true };
}

// Generate Ideas Endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { field, problemType, targetUsers } = req.body;

    if (!field || !problemType || !targetUsers) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Generate 3 startup ideas based on:
Field: ${field}
Problem: ${problemType}
Users: ${targetUsers}

Return ONLY valid JSON (no markdown):
{
  "ideas": [
    {"title": "...", "description": "...", "target_audience": "...", "unique_value": "...", "score": 85, "emoji": "💡"}
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const json = JSON.parse(text);
    res.json(json);
  } catch (error) {
    console.error('Generate error:', error.message);
    res.status(500).json({ error: 'Failed to generate ideas. Please try again.' });
  }
});

// Validate Idea Endpoint
app.post('/api/validate', async (req, res) => {
  try {
    const { idea } = req.body;
    const validation = validateIdea(idea);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this startup idea: "${idea}"

Return ONLY valid JSON (no markdown):
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
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const json = JSON.parse(text);
    res.json(json);
  } catch (error) {
    console.error('Validate error:', error.message);
    res.status(500).json({ error: 'Failed to validate idea. Please try again.' });
  }
});

// Market Research Endpoint
app.post('/api/market', async (req, res) => {
  try {
    const { idea } = req.body;
    const validation = validateIdea(idea);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Market research for: "${idea}"

Return ONLY valid JSON (no markdown):
{
  "cards": [
    {"title": "Market Overview", "points": ["...", "..."], "score": 85},
    {"title": "Target Audience", "points": ["...", "..."], "score": 80},
    {"title": "Competitors", "points": ["...", "..."], "score": 75},
    {"title": "Opportunities", "points": ["...", "..."], "score": 90},
    {"title": "Risks", "points": ["...", "..."], "score": 70},
    {"title": "Go-to-Market", "points": ["...", "..."], "score": 85}
  ],
  "overall_score": 80,
  "recommendation": "..."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const json = JSON.parse(text);
    res.json(json);
  } catch (error) {
    console.error('Market error:', error.message);
    res.status(500).json({ error: 'Failed to generate market research. Please try again.' });
  }
});

// Execution Plan Endpoint
app.post('/api/execution', async (req, res) => {
  try {
    const { idea } = req.body;
    const validation = validateIdea(idea);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `7-day MVP plan for: "${idea}"

Return ONLY valid JSON (no markdown):
{
  "days": [
    {"day": 1, "title": "...", "objective": "...", "tools": ["...", "..."], "deliverables": ["...", "..."], "tips": "..."},
    {"day": 2, "title": "...", "objective": "...", "tools": ["...", "..."], "deliverables": ["...", "..."], "tips": "..."},
    {"day": 3, "title": "...", "objective": "...", "tools": ["...", "..."], "deliverables": ["...", "..."], "tips": "..."},
    {"day": 4, "title": "...", "objective": "...", "tools": ["...", "..."], "deliverables": ["...", "..."], "tips": "..."},
    {"day": 5, "title": "...", "objective": "...", "tools": ["...", "..."], "deliverables": ["...", "..."], "tips": "..."},
    {"day": 6, "title": "...", "objective": "...", "tools": ["...", "..."], "deliverables": ["...", "..."], "tips": "..."},
    {"day": 7, "title": "...", "objective": "...", "tools": ["...", "..."], "deliverables": ["...", "..."], "tips": "..."}
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const json = JSON.parse(text);
    res.json(json);
  } catch (error) {
    console.error('Execution error:', error.message);
    res.status(500).json({ error: 'Failed to generate execution plan. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoints at http://localhost:${PORT}/api/*\n`);
});
