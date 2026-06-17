/**
 * routes/health.js — System health check (Groq-aware version)
 *
 * GET /api/health — Full system status including Groq tier
 */

'use strict';

const express  = require('express');
const mongoose = require('mongoose');
const { getGroqStatus } = require('../lib/groqAI');

const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/', async (req, res) => {
  const dbState = mongoose.connection.readyState;

  const checks = {
    database: {
      status: dbState === 1 ? 'connected' : 'disconnected',
      state:  ['disconnected','connected','connecting','disconnecting'][dbState] || 'unknown'
    },
    ai: getGroqStatus(), // { configured, model, status }
    email: {
      configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      status: (process.env.SMTP_USER && process.env.SMTP_PASS) ? 'configured' : 'missing'
    },
    memory: (() => {
      const mem = process.memoryUsage();
      return {
        heapUsed:  Math.round(mem.heapUsed  / 1024 / 1024) + ' MB',
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB'
      };
    })()
  };

  res.json({
    status:    'healthy', // local RAG always works regardless of Groq/DB
    version:   '2.0.0',
    uptime:    Math.round(process.uptime()) + 's',
    env:       process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    checks
  });
});

module.exports = router;