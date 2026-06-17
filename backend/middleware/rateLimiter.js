/**
 * Express rate limiting
 */

'use strict';

const rateLimit = require('express-rate-limit');

// ── Global API limiter ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   'Too many requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  skip: (req) => process.env.NODE_ENV === 'development'
});

// ── Chat-specific limiter (stricter — costs OpenAI tokens) ─────
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      parseInt(process.env.CHAT_RATE_LIMIT_MAX || '30', 10),
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => req.ip + ':' + (req.body?.sessionId || 'anon'),
  message: {
    success: false,
    error:   'Chat limit reached. You can send 30 messages per hour.',
    retryAfter: '1 hour'
  },
  skip: (req) => process.env.NODE_ENV === 'development'
});

// ── Contact form limiter (strict — prevent spam) ───────────────
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   'Too many form submissions. Please try again in an hour.'
  }
});

module.exports = { globalLimiter, chatLimiter, contactLimiter };