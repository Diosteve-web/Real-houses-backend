// test-router.mjs
// Tests EVERY model in router.config.json one by one, directly against each provider.
//
//   node test-router.mjs           -> test all models, print a report
//   node test-router.mjs --write   -> also save router.config.working.json (working models only, fastest first)

import 'dotenv/config';
import fs from 'node:fs';

const CONFIG_PATH = process.argv.find((a) => a.endsWith('.json')) ?? './router.config.json';
const WRITE = process.argv.includes('--write');
const TIMEOUT_MS = 30_000;
const PAUSE_MS = 1_500;
const PROMPT = 'You are a Nigerian real estate agent. Reply in ONE short Pidgin sentence welcoming a customer.';

const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const getKey = (k) => (k?.startsWith('env/') ? process.env[k.slice(4)] : k);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function explain(status, body) {
  const snippet = body.replace(/\s+/g, ' ').slice(0, 140);
  if (status === 401 || status === 403) return `HTTP ${status}: bad or missing API key`;
  if (status === 404) return `HTTP 404: wrong model name (or wrong baseUrl) | ${snippet}`;
  if (status === 429) return `HTTP 429: rate limit or daily quota finished | ${snippet}`;
  return `HTTP ${status}: ${snippet}`;
}

async function testModel(provider, model) {
  const key = getKey(provider.apiKey);
  if (!key) return { ok: false, ms: 0, reason: `NO KEY: add ${provider.apiKey} to .env` };
  const isAnthropic = provider.type === 'anthropic-messages';
  if (!isAnthropic && provider.type !== 'openai-compatible') {
    return { ok: false, ms: 0, reason: `skipped (type ${provider.type})` };
  }

  const base = provider.baseUrl.replace(/\/+$/, '');
  const url = isAnthropic ? `${base}/v1/messages` : `${base}/chat/completions`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: isAnthropic
        ? { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }
        : { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: PROMPT }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const ms = Date.now() - start;
    const body = await res.text();
    if (!res.ok) return { ok: false, ms, reason: explain(res.status, body) };
    const data = JSON.parse(body);
    const text = (isAnthropic ? data.content?.[0]?.text : data.choices?.[0]?.message?.content)?.trim();
    if (!text) return { ok: false, ms, reason: 'EMPTY reply (reasoning model spent all tokens thinking?)' };
    return { ok: true, ms, text };
  } catch (e) {
    const ms = Date.now() - start;
    return { ok: false, ms, reason: e.name === 'AbortError' ? `TIMEOUT (more than ${TIMEOUT_MS / 1000}s)` : e.message };
  } finally {
    clearTimeout(timer);
  }
}

console.log(`\n🔎 Testing models from ${CONFIG_PATH}\n`);
const results = [];

for (const provider of cfg.providers) {
  console.log(`── ${provider.name} ──`);
  for (const model of provider.models) {
    const r = await testModel(provider, model);
    results.push({ provider: provider.name, model, ...r });
    if (r.ok) console.log(`  ✅ ${model}  (${r.ms}ms)\n     "${r.text.slice(0, 110)}"`);
    else console.log(`  ❌ ${model}  (${r.ms}ms)  ${r.reason}`);
    await sleep(PAUSE_MS);
  }
}

const good = results.filter((r) => r.ok).sort((a, b) => a.ms - b.ms);
console.log('\n════════ SUMMARY ════════');
console.log(`Working: ${good.length} / ${results.length}`);
good.forEach((r, i) => console.log(`  ${i + 1}. ${r.provider} / ${r.model}  ${r.ms}ms`));
const bad = results.filter((r) => !r.ok);
if (bad.length) {
  console.log('\nNot working (fix or remove from config):');
  bad.forEach((r) => console.log(`  - ${r.provider} / ${r.model}: ${r.reason}`));
}

if (WRITE) {
  const providers = cfg.providers
    .map((p) => {
      const mine = good.filter((r) => r.provider === p.name).map((r) => r.model);
      return mine.length ? { ...p, models: mine } : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const fastest = (name) => Math.min(...good.filter((r) => r.provider === name).map((r) => r.ms));
      return fastest(a.name) - fastest(b.name);
    });
  fs.writeFileSync('./router.config.working.json', JSON.stringify({ providers }, null, 2));
  console.log('\n💾 Saved router.config.working.json');
}
console.log('');