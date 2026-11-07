import { searchAndAnswer } from '../services/aiServices.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Please provide a message." });
    }

    const result = await searchAndAnswer(message);
    res.json(result); 
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};