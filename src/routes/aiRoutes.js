// routes/aiRoutes.js
import express from 'express';
import { chatWithAI, aiSearchBar, searchSuggestions } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', chatWithAI);          // Chat with AI
router.get('/search', aiSearchBar);        // AI search bar
router.get('/suggest', searchSuggestions); // autocomplete

export default router;