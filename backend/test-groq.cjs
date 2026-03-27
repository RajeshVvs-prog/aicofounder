const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test() {
  try {
    console.log("Testing Groq API key...\n");
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say hello in one word" }],
      model: "llama-3.3-70b-versatile",
    });

    console.log("✅ SUCCESS! Groq API key works!");
    console.log("Response:", completion.choices[0].message.content);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

test();
