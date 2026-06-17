/**
 * lib/groqAI.js — FREE Groq-powered chat tier with graceful fallback
 *
 * ─────────────────────────────────────────────────────────────
 * WHY GROQ?
 * ─────────────────────────────────────────────────────────────
 * - Free tier, no credit card required: https://console.groq.com
 * - Extremely fast (LPU inference — often <500ms)
 * - Models: llama-3.1-8b-instant, llama-3.3-70b-versatile, etc.
 * - OpenAI-compatible SDK — same `openai` npm package works
 *
 * SETUP:
 *  1. Sign up free at https://console.groq.com
 *  2. Create an API key
 *  3. Add to .env:  GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
 *  4. npm install openai   (works for Groq too — different baseURL)
 *
 * BEHAVIOUR:
 *  - If GROQ_API_KEY is set      → uses Groq LLM with RAG context
 *  - If GROQ_API_KEY is missing  → falls back to localRag.js (always works)
 *  - If Groq API call fails      → falls back to localRag.js (never crashes)
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

const { retrieve, detectIntent, isLeadIntent, generateReply } = require('./localRag');

// ── Lazy Groq client (OpenAI SDK pointed at Groq's endpoint) ──
let groqClient = null;
let groqReady  = !!process.env.GROQ_API_KEY;

function getGroqClient() {
  if (groqClient) return groqClient;

  // Avoid hard dependency error if 'openai' package isn't installed
  let OpenAI;
  try {
    OpenAI = require('openai');
  } catch (_) {
    console.warn('  ⚠️  "openai" package not installed — run: npm install openai');
    groqReady = false;
    return null;
  }

  groqClient = new OpenAI({
    apiKey:  process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
  return groqClient;
}

// ── Model config (overridable via .env) ────────────────────────
const GROQ_MODEL        = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_MAX_TOKENS   = parseInt(process.env.GROQ_MAX_TOKENS || '350', 10);
const GROQ_TEMPERATURE  = parseFloat(process.env.GROQ_TEMPERATURE || '0.7');

// ── System prompt builder (injects RAG context) ────────────────
function buildSystemPrompt(contextChunks, intent) {
  const context = contextChunks.length
    ? contextChunks.map(c => `[${c.category.toUpperCase()}] ${c.title}: ${c.text}`).join('\n')
    : 'No specific match found — answer generally based on the persona below.';

  return `You are Chandan Singh's AI assistant on his portfolio website. You help visitors learn about Chandan and guide them toward hiring him.

RULES:
- Speak about Chandan in third person ("Chandan offers...", "He built...")
- Use ONLY the information below — never invent prices, project names, or stats
- Keep replies to 2-4 short sentences, conversational tone
- Use 1-2 emojis max
- If relevant, end with a soft nudge toward the Contact form or "Get Quote" button
- If the context doesn't answer the question, say: "I don't have that detail — email chandanbhandari596@gmail.com directly"

KNOWLEDGE CONTEXT (intent detected: ${intent}):
${context}`;
}

/**
 * Generate a reply using Groq (with RAG context from localRag retrieval).
 * Falls back to pure localRag.generateReply() on any failure.
 *
 * @param {string} message
 * @param {Array}  history - [{role:'user'|'assistant', content:string}]
 * @returns {Promise<{reply, intent, leadDetected, source: 'groq'|'local'}>}
 */
async function generateReplyWithGroq(message, history = []) {
  const intent       = detectIntent(message);
  const leadDetected = isLeadIntent(message);


  console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);
  // ── No Groq key → use local engine immediately ────────────────
  if (!process.env.GROQ_API_KEY) {
    const local = generateReply(message);
    return { ...local, source: 'local' };
  }

  // ── Attempt Groq ───────────────────────────────────────────────
  try {
    const client = getGroqClient();
    if (!client) throw new Error('Groq client unavailable');

    const contextChunks = retrieve(message, 4);
    console.log(contextChunks);
    const systemPrompt  = buildSystemPrompt(contextChunks, intent);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8), // last 4 turns
      { role: 'user', content: message }
    ];

    console.log("Using Groq");
    const completion = await client.chat.completions.create({
      model:   GROQ_MODEL,
      messages,
      max_tokens:  GROQ_MAX_TOKENS,
      temperature: GROQ_TEMPERATURE,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    console.log("Groq reply:", reply);

    if (!reply) throw new Error('Empty response from Groq');

    return { reply, intent, leadDetected, source: 'groq' };

  } catch (err) {
    // console.warn('  ⚠️  Groq request failed, falling back to local RAG:', err.message);
    console.error("Groq Error:", err);
    const local = generateReply(message);
    return { ...local, source: 'local-fallback' };
  }
}

/** Quick health check — used by /api/health */
function getGroqStatus() {
  return {
    configured: !!process.env.GROQ_API_KEY,
    model:      GROQ_MODEL,
    status:     process.env.GROQ_API_KEY ? 'enabled' : 'disabled (using localRag fallback)'
  };
}

module.exports = { generateReplyWithGroq, getGroqStatus };