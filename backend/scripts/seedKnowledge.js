/**
 * Run once to pre-build and validate the RAG vector store.
 * Also seeds a test lead in MongoDB.
 *
 * Usage:
 *   node scripts/seedKnowledge.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { buildVectorStore, retrieveContext } = require('../lib/ai');
const { Lead } = require('../lib/models');

async function seed() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🌱 Seeding RAG knowledge base...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rahul_portfolio');
    console.log('  ✅ MongoDB connected');
  } catch (err) {
    console.warn('  ⚠️  MongoDB unavailable — skipping DB seed:', err.message);
  }

  // 2. Build vector store
  if (!process.env.OPENAI_API_KEY) {
    console.error('  ❌ OPENAI_API_KEY not set — cannot build vector store');
    process.exit(1);
  }

  await buildVectorStore();

  // 3. Test retrieval
  console.log('\n  🔍 Testing retrieval...\n');

  const testQueries = [
    'What services does Chandan offer?',
    'What is the price of the Growth package?',
    'What AI projects has Chandan built?',
    'How can I hire Chandan?'
  ];

  for (const q of testQueries) {
    const results = await retrieveContext(q, 3);
    console.log(`  Query: "${q}"`);
    results.forEach(r => {
      console.log(`    → [${r.score.toFixed(3)}] ${r.metadata.title}`);
    });
    console.log();
  }

  // 4. Seed a test lead
  if (mongoose.connection.readyState === 1) {
    try {
      await Lead.deleteOne({ email: 'test@seed.dev' });
      await Lead.create({
        name:    'Test Lead',
        email:   'test@seed.dev',
        budget:  'growth',
        message: 'This is a seeded test lead. You can delete it.',
        source:  'direct',
        status:  'new'
      });
      console.log('  ✅ Test lead created in MongoDB');
    } catch (err) {
      console.warn('  ⚠️  Could not seed test lead:', err.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('  ❌ Seed failed:', err);
  process.exit(1);
});