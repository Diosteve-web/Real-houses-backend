import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Property from '../models/Property.js';

// Initialize both AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
// ---------------------------------------------------------
// HELPER: The Dual-AI Fallback Logic
// ---------------------------------------------------------
async function askAI(prompt) {
  // 1. Try OpenAI
  try {
    console.log("🤖 Trying OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    console.log("✅ OpenAI Success!");
    return response.choices[0].message.content;
  } catch (openaiError) {
    console.warn(`⚠️ OpenAI failed: ${openaiError.message}. Falling back to Gemini...`);
  }

  // 2. Fallback to Gemini
  try {
    console.log("🤖 Trying Google Gemini...");
    const result = await geminiModel.generateContent(prompt);
    console.log("✅ Gemini Success!");
    return result.response.text();
  } catch (geminiError) {
    console.error(`❌ Both AIs failed. Gemini error: ${geminiError.message}`);
    throw new Error("Our AI agents are currently offline. Please try again later.");
  }
}

// ---------------------------------------------------------
// MAIN FUNCTION: Search DB and Answer User
// ---------------------------------------------------------
export const searchAndAnswer = async (userQuery) => {
  try {
    // STEP 1: Ask AI to write a MongoDB query
    const queryPrompt = `
      You are a MongoDB query generator for a real estate app.
      The Property schema has fields: title, description, price (Number), locationName (String), bedrooms (Number), bathrooms (Number).
      User's request: "${userQuery}"
      
      Generate a valid JSON MongoDB query to find matching houses. 
      Rules:
      - If they say "under 500k", use {"price": {"$lte": 500000}}
      - If they say "2 or 4 bedrooms", use {"bedrooms": {"$in": [2, 4]}}
      - If they say "near campus" or "Archie", use {"locationName": {"$regex": "campus|archie", "$options": "i"}}
      - Return ONLY the raw JSON object. Do NOT wrap it in markdown or backticks.
    `;

    // Use the Dual-AI helper
    let queryText = await askAI(queryPrompt);
    
    // Clean up in case Gemini adds markdown backticks
    queryText = queryText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const mongoQuery = JSON.parse(queryText);
    console.log("🔍 Generated MongoDB Query:", mongoQuery);

    // STEP 2: Search MongoDB using the AI's query
    const houses = await Property.find(mongoQuery).limit(3);
    console.log(`🏠 Found ${houses.length} houses in database.`);

    // Format data to include images
    const housesData = houses.map(h => ({
      id: h._id,
      title: h.title,
      price: h.price,
      location: h.locationName,
      bedrooms: h.bedrooms,
      imageUrl: h.imageUrl, // Cloudinary image
    }));

    // STEP 3: Ask AI to write the final friendly reply
    const answerPrompt = `
      You are a helpful real estate agent for Johnny Houses.
      User asked: "${userQuery}"
      
      The database search returned these houses:
      ${JSON.stringify(housesData, null, 2)}
      
      Instructions:
      - If houses are found, write a friendly reply highlighting the price, bedrooms, and location.
      - Tell them to tap the images below to see more details.
      - If the list is empty, apologize and tell them we have no matches right now.
    `;

    // Use the Dual-AI helper again
    const finalReply = await askAI(answerPrompt);

    // Return BOTH the text and the property data to the frontend
    return {
      reply: finalReply,
      properties: housesData, 
    };

  } catch (error) {
    console.error("❌ AI Search Error:", error);
    throw new Error(error.message);
  }
};