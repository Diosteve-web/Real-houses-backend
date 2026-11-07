// If your file is named aiServices.js, make sure this line matches!
import { searchAndAnswer } from '../services/aiServices.js'; 

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Please provide a search message." });
    }

    const result = await searchAndAnswer(message);
    res.json(result); 
    
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};