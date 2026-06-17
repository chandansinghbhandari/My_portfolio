'use strict';

const mongoose = require('mongoose');

// ── Lead Model ─────────────────────────────────────────────────
const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
    },
    budget: {
      type: String,
      enum: ['starter', 'growth', 'enterprise', ''],
      default: ''
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    source: {
      type: String,
      enum: ['contact_form', 'chatbot', 'direct'],
      default: 'contact_form'
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new'
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true // adds createdAt, updatedAt
  }
);

// Index for fast queries
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

// ── Chat Session Model ─────────────────────────────────────────
const chatMessageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    messages: [chatMessageSchema],
    ipAddress: { type: String },
    userAgent: { type: String },
    // Analytics
    totalMessages: { type: Number, default: 0 },
    totalTokens:   { type: Number, default: 0 },
    convertedToLead: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Auto-expire sessions after 30 days
chatSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Lead        = mongoose.models.Lead        || mongoose.model('Lead', leadSchema);
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);

module.exports = { Lead, ChatSession };