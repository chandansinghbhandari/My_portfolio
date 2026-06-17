// /**
//  * Architecture:
//  *  1. User query arrives
//  *  2. Generate embedding for query (OpenAI text-embedding-3-small)
//  *  3. Cosine-similarity search over in-memory knowledge base
//  *  4. Retrieve top-K most relevant knowledge chunks
//  *  5. Build context-aware system prompt
//  *  6. Call GPT-4o-mini with context + conversation history
//  *  7. Return response + log interaction
//  */

// 'use strict';

// const OpenAI = require('openai');
// const knowledgeBase = require('../data/knowledge');

// // ── OpenAI Client ──────────────────────────────────────────────
// let openaiClient = null;

// function getOpenAI() {
//   if (!openaiClient) {
//     if (!process.env.OPENAI_API_KEY) {
//       throw new Error('OPENAI_API_KEY not set in environment variables');
//     }
//     openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//   }
//   return openaiClient;
// }

// // ── In-Memory Vector Store ─────────────────────────────────────
// // Stores { text, embedding, metadata } for each knowledge chunk
// const vectorStore = [];
// let vectorStoreReady = false;

// /**
//  * Cosine similarity between two vectors
//  */
// function cosineSimilarity(a, b) {
//   if (a.length !== b.length) return 0;
//   let dot = 0, normA = 0, normB = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot   += a[i] * b[i];
//     normA += a[i] * a[i];
//     normB += b[i] * b[i];
//   }
//   const denom = Math.sqrt(normA) * Math.sqrt(normB);
//   return denom === 0 ? 0 : dot / denom;
// }

// /**
//  * Generate embedding for a piece of text
//  */
// async function generateEmbedding(text) {
//   const openai = getOpenAI();
//   const response = await openai.embeddings.create({
//     model: 'text-embedding-3-small',
//     input: text.trim().replace(/\n+/g, ' ').slice(0, 8000)
//   });
//   return response.data[0].embedding;
// }

// /**
//  * Build the vector store from the knowledge base
//  * Called once on server start (lazy or explicit)
//  */
// async function buildVectorStore() {
//   if (vectorStoreReady) return;
//   console.log('  🧠 Building RAG vector store...');

//   const chunks = flattenKnowledge(knowledgeBase);

//   // Batch embed to respect rate limits
//   const BATCH_SIZE = 20;
//   for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
//     const batch = chunks.slice(i, i + BATCH_SIZE);
//     const texts  = batch.map(c => c.text);

//     const openai = getOpenAI();
//     const response = await openai.embeddings.create({
//       model: 'text-embedding-3-small',
//       input: texts
//     });

//     response.data.forEach((item, j) => {
//       vectorStore.push({
//         text:      batch[j].text,
//         metadata:  batch[j].metadata,
//         embedding: item.embedding
//       });
//     });
//   }

//   vectorStoreReady = true;
//   console.log(`  ✅ Vector store ready — ${vectorStore.length} chunks indexed`);
// }

// /**
//  * Convert structured knowledge base into flat text chunks
//  */
// function flattenKnowledge(kb) {
//   const chunks = [];

//   kb.forEach(section => {
//     // Each section becomes its own chunk
//     const text = `[${section.category.toUpperCase()}]\n${section.title}\n${section.content}`;
//     chunks.push({ text, metadata: { category: section.category, title: section.title } });

//     // Also chunk sub-items if they exist
//     if (section.items && section.items.length > 0) {
//       // Group items into chunks of 3 for context density
//       for (let i = 0; i < section.items.length; i += 3) {
//         const group = section.items.slice(i, i + 3);
//         const groupText = `[${section.category.toUpperCase()}] ${section.title}:\n` +
//           group.map(item => `- ${item}`).join('\n');
//         chunks.push({ text: groupText, metadata: { category: section.category, title: section.title } });
//       }
//     }
//   });

//   return chunks;
// }

// /**
//  * Retrieve top-K most relevant chunks for a query
//  */
// async function retrieveContext(query, topK = 5) {
//   // Ensure vector store is ready
//   if (!vectorStoreReady) {
//     await buildVectorStore();
//   }

//   // Embed the query
//   const queryEmbedding = await generateEmbedding(query);

//   // Score all chunks
//   const scored = vectorStore.map(chunk => ({
//     ...chunk,
//     score: cosineSimilarity(queryEmbedding, chunk.embedding)
//   }));

//   // Sort descending and return top K
//   return scored
//     .sort((a, b) => b.score - a.score)
//     .slice(0, topK)
//     .filter(c => c.score > 0.2) // Minimum relevance threshold
//     .map(c => ({ text: c.text, metadata: c.metadata, score: c.score }));
// }

// /**
//  * Build the system prompt from retrieved context
//  */
// function buildSystemPrompt(contextChunks) {
//   const contextText = contextChunks.length > 0
//     ? contextChunks.map(c => c.text).join('\n\n---\n\n')
//     : 'No specific context retrieved. Use general knowledge about Rahul.';

//   return `You are Rahul Khadayat's AI assistant on his portfolio website. Your job is to help visitors learn about Rahul, his work, and convert them into clients.

// ## YOUR PERSONA
// - You're professional yet friendly, knowledgeable, and slightly enthusiastic about tech
// - You answer in 2-4 sentences unless a detailed list is truly needed
// - You naturally guide conversations toward Rahul's services when relevant
// - You NEVER make up information — only use what's provided below
// - If you don't know something, say "I don't have that detail, but you can reach Rahul directly at rahul@example.com"

// ## RAHUL'S KNOWLEDGE BASE (use this as your primary source)
// ${contextText}

// ## CONVERSION GOALS
// - When someone asks about pricing or services → be specific and suggest they click the "Get Quote" button or use the contact form
// - When someone asks about projects → highlight the business impact and suggest a similar solution for their business
// - When someone asks general questions → answer helpfully and end with a relevant CTA
// - Always be helpful first, then subtly guide toward booking a call or sending a message

// ## FORMATTING
// - Use plain text (no markdown headers, minimal bullet points)
// - Keep responses concise and conversational
// - Use emojis sparingly for warmth (max 1-2 per message)`;
// }

// /**
//  * Main chat function — the public API
//  *
//  * @param {string} userMessage - The user's current message
//  * @param {Array}  history     - Previous messages [{role, content}]
//  * @returns {Object} { reply, contextUsed, tokensUsed }
//  */
// async function chat(userMessage, history = []) {
//   // 1. Retrieve relevant context
//   const contextChunks = await retrieveContext(userMessage);

//   // 2. Build system prompt with injected context
//   const systemPrompt = buildSystemPrompt(contextChunks);

//   // 3. Build message array (keep last 10 turns to manage context window)
//   const recentHistory = history.slice(-10);
//   const messages = [
//     { role: 'system', content: systemPrompt },
//     ...recentHistory,
//     { role: 'user', content: userMessage }
//   ];

//   // 4. Call OpenAI
//   const openai = getOpenAI();
//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages,
//     max_tokens: 400,
//     temperature: 0.7,
//     presence_penalty: 0.1,
//     frequency_penalty: 0.1
//   });

//   const reply = response.choices[0].message.content.trim();
//   const tokensUsed = response.usage?.total_tokens || 0;

//   return {
//     reply,
//     contextUsed: contextChunks.map(c => ({ title: c.metadata.title, score: c.score })),
//     tokensUsed
//   };
// }

// /**
//  * Fallback response when OpenAI is unavailable
//  */
// function getFallbackResponse(message) {
//   const lower = message.toLowerCase();

//   if (lower.match(/service|offer|price|cost|package|plan/)) {
//     return "Rahul offers three service tiers: Starter ($999) for responsive websites, Growth ($2,999) for full-stack apps with AI integration, and Enterprise ($7,999) for complete AI-powered platforms. Hit the 'Get Quote' button in the Services section to start a conversation!";
//   }
//   if (lower.match(/project|built|portfolio|work|case/)) {
//     return "Rahul's featured work includes an AI SaaS Platform (3x faster content creation), an Enterprise RAG Chatbot (95% query accuracy), a Full-Stack E-Commerce rebuild (2x conversion rate), and a Real-Time Analytics Dashboard (<50ms latency). Check the Projects section for full case studies!";
//   }
//   if (lower.match(/skill|tech|stack|know|language|framework/)) {
//     return "Rahul's stack covers the full spectrum: React/Next.js/TypeScript on the frontend, Node.js/Express/MongoDB/PostgreSQL on the backend, and OpenAI/LangChain/RAG/Pinecone for AI systems. Plus cloud infrastructure on AWS & GCP. 4+ years of production experience.";
//   }
//   if (lower.match(/hire|contact|reach|book|call|discuss/)) {
//     return "Ready to work with Rahul? Scroll down to the Contact section, fill out the form with your project details, and he'll reply within 24 hours. You can also email rahul@example.com directly. He's currently available for new projects! 🚀";
//   }
//   if (lower.match(/experience|year|background|about|who/)) {
//     return "Rahul is a Full Stack Developer & AI Enthusiast with 4+ years of experience. He's shipped 50+ projects for 30+ clients across SaaS, e-commerce, fintech, and enterprise. His sweet spot is building AI-integrated products that solve real business problems.";
//   }
//   if (lower.match(/ai|rag|openai|chatgpt|langchain|ml|machine/)) {
//     return "AI is Rahul's speciality! He builds RAG systems, AI chatbots, content generation tools, and intelligent automation using OpenAI GPT-4, LangChain, Pinecone, and custom embedding pipelines. He's helped clients cut operational costs by 40-80% through smart automation.";
//   }

//   return "Great question! I can tell you about Chandan's services, projects, tech skills, or how to get in touch. What would you like to know? 😊";
// }

// // Initialize vector store eagerly on module load (non-blocking)
// if (process.env.OPENAI_API_KEY) {
//   buildVectorStore().catch(err => {
//     console.warn('  ⚠️  Vector store build failed (will retry on first request):', err.message);
//     vectorStoreReady = false;
//   });
// }

// module.exports = { chat, getFallbackResponse, buildVectorStore, retrieveContext };