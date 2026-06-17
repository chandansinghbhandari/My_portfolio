/**
 * routes/chat.js — Chat endpoint with Groq tier + free localRag fallback
 *
 * Resolution order per request:
 *   1. GROQ_API_KEY set & Groq responds  → AI-generated reply (best quality)
 *   2. GROQ_API_KEY missing               → localRag.js (free, instant, always works)
 *   3. GROQ_API_KEY set but call fails    → localRag.js (auto-fallback, never crashes)
 *
 * Conversation history is loaded from MongoDB (if available) so Groq
 * gets multi-turn context. localRag mode ignores history (stateless).
 */

'use strict';

const express  = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { generateReplyWithGroq } = require('../lib/groq');
const { ChatSession }           = require('../lib/models');
const { chatLimiter }           = require('../middleware/rateLimiter');
const validate                  = require('../middleware/validate');

const router = express.Router();

const chatValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 1000 }).withMessage('Message must be under 1000 characters'),
  body('sessionId').optional().isUUID().withMessage('Invalid sessionId')
];

router.post('/', chatLimiter, chatValidation, validate, async (req, res, next) => {
  try {
    const { message, sessionId: clientId } = req.body;
    const sessionId = clientId || uuidv4();

    // ── Load session + history (optional — works without DB too) ──
    let session = null;
    let history = [];

    try {
      session = await ChatSession.findOne({ sessionId });
      if (session) {
        history = session.messages.slice(-8).map(m => ({
          role:    m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));
      }
    } catch (_) { /* DB optional */ }

    // ── Generate reply: Groq → localRag fallback (automatic) ──────
    const { reply, intent, leadDetected, source } = await generateReplyWithGroq(message, history);

    // ── Persist conversation (non-blocking, optional) ─────────────
    try {
      if (!session) {
        session = new ChatSession({
          sessionId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || ''
        });
      }
      session.messages.push({ role: 'user', content: message });
      session.messages.push({ role: 'assistant', content: reply });
      session.totalMessages = (session.totalMessages || 0) + 2;
      if (session.messages.length > 100) session.messages = session.messages.slice(-100);
      await session.save();
    } catch (_) { /* DB optional */ }

    res.json({
      success: true,
      reply,
      sessionId,
      intent,
      leadDetected,
      ...(process.env.NODE_ENV === 'development' && { source }) // debug only
    });

  } catch (err) {
    next(err);
  }
});

// ── GET /api/chat/config — suggestion chips + UI strings ─────────
router.get('/config', (req, res) => {
  res.json({
    success: true,
    suggestions: [
      { label: 'Services & Pricing', message: 'What services does Chandan offer and what are the prices?' },
      { label: 'Featured Projects',  message: "Tell me about Chandan's best projects" },
      { label: 'Tech Stack',         message: "What is Chandan's tech stack?" },
      { label: 'How to Hire',        message: 'How can I hire Chandan for my project?' },
    ],
    ui: {
      headerTitle: "Chandan's AI Assistant",
      headerSubtitle: 'Ask me anything',
      welcome: "👋 Hi! I'm Chandan's AI assistant. Ask me about his skills, projects, services, or how to hire him.",
      placeholderText: 'Ask about projects, skills, pricing...'
    }
  });
});

module.exports = router;