import 'dotenv/config';
import { createRouterFromFile } from 'free-llm-router';

console.log('Keys loaded:', {
  openai: !!process.env.OPENAI_API_KEY,
  aion: !!process.env.AION_LABS_API_KEY,
  cohere: !!process.env.COHERE_API_KEY,
  gemini: !!process.env.GEMINI_API_KEY,
  openrouter: !!process.env.OPENROUTER_API_KEY,
});

const router = await createRouterFromFile('./router.config.json');
const start = Date.now();
try {
  const res = await router.chat({ messages: [{ role: 'user', content: 'Say hello in Pidgin in one line.' }] });
  console.log(`✅ ${res.model} answered in ${Date.now() - start}ms:`, res.content);
} catch (e) {
  console.log(`❌ Failed after ${Date.now() - start}ms:`, e.message);
}