/**
 * MongoDB connection with Mongoose
 */

'use strict';

const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chandan_portfolio';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`  ✅ MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error('  ❌ MongoDB error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('  ⚠️  MongoDB disconnected. Reconnecting...');
      isConnected = false;
      setTimeout(connectDB, 5000);
    });

  } catch (err) {
    console.error('  ❌ MongoDB connection failed:', err.message);
    console.warn('  ⚠️  Running without database. Lead storage disabled.');
    // Don't crash — app still works for chat/contact via fallback
  }
}

module.exports = connectDB;