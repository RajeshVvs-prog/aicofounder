const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function listModels() {
  try {
    console.log("Fetching available models...\n");
    const models = await ai.models.list();
    
    console.log("Available models:");
    console.log("=================\n");
    
    if (models && models.models) {
      models.models.forEach(model => {
        console.log(`✓ ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`  Methods: ${model.supportedGenerationMethods.join(", ")}`);
        }
        console.log();
      });
    } else {
      console.log("No models found or unexpected response format");
      console.log("Response:", JSON.stringify(models, null, 2));
    }
  } catch (error) {
    console.error("Error listing models:", error.message);
    console.error("Full error:", error);
  }
}

listModels();
