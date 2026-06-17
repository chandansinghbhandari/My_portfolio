require('dotenv').config();


'use strict';

const connectDB = require("./lib/db");
const { generateReplyWithGroq, getGroqStatus } = require('./lib/groq');
const contactRoutes = require("./routes/contact");
// import contactRoutes from "./routes/contact.js";

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

/* -----------------------------
   Middleware
----------------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(helmet());

app.use(compression());

app.use(morgan('dev'));

/* -----------------------------
   Custom Middleware
----------------------------- */

const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

app.use(globalLimiter);

/* -----------------------------
   Routes
----------------------------- */

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chandan Portfolio Backend Running Successfully 🚀',
  });
});

// Health Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.get('/api/groq-health', (req, res) => {
  res.json(getGroqStatus());
});

// Chat Route
app.post('/api/chat', async (req, res) => {
  try {
    console.log("Received:", req.body.message);

    const result = await generateReplyWithGroq(req.body.message);

    console.log("Response Source:", result.source);

    res.json(result);

  } catch (err) {
    console.error("Chat Error:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Contact Route
app.use("/api/contact", contactRoutes);

// Leads Route
app.get('/api/leads', (req, res) => {
  res.json({
    success: true,
    leads: [],
  });
});

/* -----------------------------
   404 Handler
----------------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* -----------------------------
   Error Handler
----------------------------- */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

/* -----------------------------
   Start Server
----------------------------- */

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});