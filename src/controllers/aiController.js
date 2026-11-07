import { searchAndAnswer } from '../services/aiServices.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Check if the user actually typed something
    if (!message) {
      return res.status(400).json({ error: "Please provide a search message." });
    }

    // Pass the message to the service
    const result = await searchAndAnswer(message);
    
    // Send the AI reply + property data back to Postman
    res.json(result); 
    
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};