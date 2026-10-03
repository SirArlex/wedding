/**
 * Creates the initial admin account and links it to the seeded wedding.
 * Run once after `npm run seed`:
 *   node services/seedAdmin.js
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running, or
 * defaults will be used (change them immediately in production).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Wedding from '../models/Wedding.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@wedding.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Change-Me-Now-123!';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[seedAdmin] Connected to MongoDB');

  // Find the wedding to link
  const wedding = await Wedding.findOne({}).lean();
  if (!wedding) {
    console.error('[seedAdmin] No wedding found. Run `npm run seed` first.');
    process.exit(1);
  }

  // Check if admin already exists
  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`[seedAdmin] Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await Admin.hashPassword(ADMIN_PASSWORD);

  const admin = await Admin.create({
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    name: 'Admin',
    weddingIds: [wedding._id],
  });

  console.log(`[seedAdmin] OK Admin created:`);
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Wedding:  ${wedding.slug} (${wedding._id})`);
  console.log('');
  console.log('    Change this password immediately after first login!');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
