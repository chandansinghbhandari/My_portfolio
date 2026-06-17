/**
 * Centralised Express error handler
 */

'use strict';

function errorHandler(err, req, res, next) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('\n  ❌ Error:', err.message);
    console.error(err.stack);
  } else {
    console.error(`  ❌ [${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, error: 'Validation failed', details: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ success: false, error: `Duplicate ${field}` });
  }

  // OpenAI API errors
  if (err.constructor?.name === 'APIError' || err.status) {
    const status = err.status || 502;
    return res.status(status).json({
      success: false,
      error: 'AI service error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'AI service temporarily unavailable'
    });
  }

  // CORS error
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ success: false, error: err.message });
  }

  // Default 500
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error:   process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
}

module.exports = errorHandler;