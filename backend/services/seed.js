/**
 * Seeds the database with the single development wedding.
 *
 * Usage:  npm run seed
 *
 * Requires MONGODB_URI to be set in .env. Safe to run repeatedly —
 * it upserts by slug, so it won't create duplicates.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import Wedding from '../models/Wedding.js';
import { developmentWedding } from './weddingData.js';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      '[seed] MONGODB_URI is not set. Add it to backend/.env and try again.'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[seed] Connected to MongoDB');

    const result = await Wedding.findOneAndUpdate(
      { slug: developmentWedding.slug },
      developmentWedding,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(
      `[seed] Upserted wedding "${result.brideName} & ${result.groomName}" (slug: ${result.slug})`
    );
  } catch (error) {
    console.error('[seed] Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[seed] Done.');
  }
}

seed();
