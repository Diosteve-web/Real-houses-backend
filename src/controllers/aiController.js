// controllers/aiController.js
import { searchAndAnswer, quickSearch, getSearchSuggestions } from '../services/aiServices.js';

// POST /api/ai/chat   body: { message, sessionId?, history? }
export const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Please provide a search message.' });
    }
    // Use a logged-in user id if you have one, otherwise the sessionId sent by the app
    const result = await searchAndAnswer(message, { sessionId: sessionId || req.user?.id, history });
    res.json(result);
  } catch (error) {
    console.error('Controller Error:', error.message);
    res.status(500).json({ error: 'Our AI agent is having a small issue. Please try again.' });
  }
};

// GET /api/ai/search?q=2 bedroom near OAU under 500k   (AI search bar)
export const aiSearchBar = async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q.trim()) return res.status(400).json({ error: 'Please type something to search.' });
    res.json(await quickSearch(q));
  } catch (error) {
    console.error('Search Error:', error.message);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
};

// GET /api/ai/suggest?q=ma   (autocomplete while typing)
export const searchSuggestions = async (req, res) => {
  try {
    res.json({ suggestions: await getSearchSuggestions(String(req.query.q || '')) });
  } catch (error) {
    res.json({ suggestions: [] });
  }
};