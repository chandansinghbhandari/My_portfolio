/**
 * lib/localrag.js — 100% FREE RAG engine (no external API calls)
 *
 * How it works:
 *  1. Knowledge base is split into chunks (data/knowledge.js)
 *  2. Each chunk is tokenized into keywords
 *  3. User query is tokenized the same way
 *  4. Score = overlap between query keywords and chunk keywords
 *     (weighted TF-IDF-ish: rare words count more)
 *  5. Best-matching chunk(s) are combined into a natural response
 *
 * No OpenAI, no Pinecone, no paid services. Pure JS.
 */

'use strict';

const knowledgeBase = require('../data/knowledge');

// ── Stopwords (ignored when scoring) ───────────────────────────
const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','must','can',
  'i','you','he','she','it','we','they','me','him','her','us','them',
  'my','your','his','its','our','their','this','that','these','those',
  'and','or','but','if','then','else','for','to','of','in','on','at','by',
  'with','about','as','from','into','like','through','after','over','between',
  'out','against','during','without','before','under','around','among',
  'what','which','who','whom','whose','when','where','why','how',
  'all','any','both','each','few','more','most','other','some','such',
  'no','nor','not','only','own','same','so','than','too','very',
  's','t','just','don','now','tell','about','please','hi','hello','hey'
]);

// ── Tokenize: lowercase, strip punctuation, remove stopwords ──
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

// ── Build flat chunks from knowledge base ──────────────────────
function buildChunks() {
  const chunks = [];

  knowledgeBase.forEach(section => {
    // Section-level chunk
    chunks.push({
      text: section.content,
      title: section.title,
      category: section.category,
      tokens: tokenize(section.title + ' ' + section.content + ' ' + (section.items || []).join(' '))
    });

    // Item-level chunks (finer granularity)
    (section.items || []).forEach(item => {
      chunks.push({
        text: item,
        title: section.title,
        category: section.category,
        tokens: tokenize(section.title + ' ' + item)
      });
    });
  });

  return chunks;
}

const CHUNKS = buildChunks();

// ── Compute document frequency for IDF weighting ───────────────
const DOC_FREQ = {};
CHUNKS.forEach(chunk => {
  const seen = new Set(chunk.tokens);
  seen.forEach(token => {
    DOC_FREQ[token] = (DOC_FREQ[token] || 0) + 1;
  });
});
const TOTAL_DOCS = CHUNKS.length;

function idf(token) {
  const df = DOC_FREQ[token] || 1;
  return Math.log((TOTAL_DOCS + 1) / df) + 1;
}

// ── Score a chunk against query tokens ──────────────────────────
function scoreChunk(queryTokens, chunk) {
  let score = 0;
  const chunkTokenSet = new Set(chunk.tokens);

  queryTokens.forEach(qt => {
    if (chunkTokenSet.has(qt)) {
      score += idf(qt);
    }
    // Partial / substring match (lower weight) — handles plurals etc.
    else {
      for (const ct of chunkTokenSet) {
        if (ct.length > 3 && (ct.includes(qt) || qt.includes(ct))) {
          score += idf(qt) * 0.4;
          break;
        }
      }
    }
  });

  return score;
}

// ── Retrieve top-K relevant chunks ──────────────────────────────
function retrieve(query, topK = 4) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  return CHUNKS
    .map(chunk => ({ ...chunk, score: scoreChunk(queryTokens, chunk) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ──────────────────────────────────────────────────────────────
// INTENT DETECTION (regex-based, fast)
// ──────────────────────────────────────────────────────────────
const INTENTS = [
  { name: 'greeting', pattern: /^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|yo)\b/i },
  { name: 'farewell', pattern: /\b(bye|goodbye|see\s*you|take\s*care|thanks?\s*(a\s*lot|so\s*much)?\s*bye?)\b/i },
  { name: 'services', pattern: /\b(service|offer|package|price|cost|rate|charge|plan|tier|starter|growth|enterprise|how much|fee|pricing|quote)\b/i },
  { name: 'projects', pattern: /\b(project|portfolio|work|case\s*stud|built|made|example|demo|showcase|app)\b/i },
  { name: 'hiring', pattern: /\b(hire|work\s*with|engage|freelance|available|book|contract|let'?s\s*start|collaborat)\b/i },
  { name: 'skills', pattern: /\b(skill|tech|stack|language|framework|proficien|expert|good\s*at|know)\b/i },
  { name: 'about', pattern: /\b(who\s*(is|are)|about\s*you|background|your\s*story|introduce|experience\s*level|years?\s*of\s*experience)\b/i },
  { name: 'contact', pattern: /\b(contact|email|reach|get\s*in\s*touch|phone|linkedin|github|message\s*you)\b/i },
  { name: 'ai', pattern: /\b(ai|artificial\s*intelligence|machine\s*learning|\bml\b|rag|openai|gpt|chatgpt|langchain|llm|embedding|vector)\b/i },
];

function detectIntent(message) {
  for (const { name, pattern } of INTENTS) {
    if (pattern.test(message)) return name;
  }
  return 'general';
}

function isLeadIntent(message) {
  return /\b(hire|quote|proposal|let'?s\s*(talk|discuss|start|connect|work)|i\s*(want|need|would\s*like)\s*to\s*(hire|build|start|work)|interested\s*in\s*(working|hiring))\b/i
    .test(message.toLowerCase());
}

// ──────────────────────────────────────────────────────────────
// RESPONSE GENERATION
// ──────────────────────────────────────────────────────────────

// Intent-specific opening lines (rotated for variety)
const OPENERS = {
  greeting: [
    "👋 Hey there! I'm here to help you learn about Chandan's work.",
  ],
  services: [
    "💼 Here's what Chandan offers:",
    "💰 On pricing and packages:",
  ],
  projects: [
    "🚀 Here's a project that fits:",
    "📂 Check this out from Chandan's portfolio:",
  ],
  hiring: [
    "🎯 Great — here's how to get started:",
  ],
  skills: [
    "⚡ Here's what Chandan brings to the table:",
  ],
  about: [
    "👤 A bit about Chandan:",
  ],
  contact: [
    "📩 Here's how to reach Chandan:",
  ],
  ai: [
    "🧠 AI is Chandan's specialty —",
  ],
  farewell: [
    "👋 Thanks for stopping by!",
  ],
  general: [
    "Here's what I found:",
  ]
};

const CLOSERS = {
  services: "\n\nWant a custom quote? Use the **Get Quote** button in the Services section, or the Contact form below. 🚀",
  projects: "\n\nWant something similar built for you? Hit **Hire Me** to get started. 💡",
  hiring:   "\n\nJust fill out the **Contact form** below — Chandan replies within 24 hours. 📩",
  ai:       "\n\nInterested in an AI feature for your project? The **Enterprise package** is built for exactly this. 🧠",
  general:  "\n\nWant to know more about services, projects, or how to get in touch? Just ask! 😊",
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Main entry point — generates a contextual reply with ZERO external APIs.
 *
 * @param {string} message - user's message
 * @returns {{ reply: string, intent: string, leadDetected: boolean, sources: string[] }}
 */
function generateReply(message) {
  const intent = detectIntent(message);
  const leadDetected = isLeadIntent(message);

  // Greeting / farewell — short, no retrieval needed
  if (intent === 'greeting') {
    return {
      reply: "👋 Hi! I'm Chandan's AI assistant. Ask me about his **skills**, **projects**, **services & pricing**, or **how to hire him** — what would you like to know?",
      intent, leadDetected, sources: []
    };
  }
  if (intent === 'farewell') {
    return {
      reply: "👋 Thanks for stopping by! If you'd like to work with Chandan, just use the Contact form — he replies within 24 hours. Have a great day!",
      intent, leadDetected, sources: []
    };
  }

  // Retrieve relevant knowledge chunks
  const results = retrieve(message, 4);

  if (results.length === 0) {
    return {
      reply: "🤔 I don't have specific info on that. I can tell you about Chandan's **services & pricing**, **featured projects**, **tech stack**, or **how to hire him**. What interests you?",
      intent, leadDetected, sources: []
    };
  }

  // Build response from top results
  const opener = pick(OPENERS[intent] || OPENERS.general);
  const closer = CLOSERS[intent] || CLOSERS.general;

  // De-duplicate by title, take top 1-2 distinct sections
  const seenTitles = new Set();
  const bullets = [];

  for (const r of results) {
    const key = r.title + '|' + r.text;
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    bullets.push(r.text);
    if (bullets.length >= 3) break;
  }

  let body;
  if (bullets.length === 1) {
    body = bullets[0];
  } else {
    body = bullets.map(b => `• ${b}`).join('\n');
  }

  const reply = `${opener}\n\n${body}${closer}`;
  const sources = [...new Set(results.map(r => r.title))];

  return { reply, intent, leadDetected, sources };
}

module.exports = { generateReply, retrieve, detectIntent, isLeadIntent, tokenize };