// Test with standard Google AI package
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: "./backend/.env" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    console.log("Testing API key with @google/generative-ai package...\n");
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ SUCCESS! API key works!");
    console.log("Response:", text);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

test();
