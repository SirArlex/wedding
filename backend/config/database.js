import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 *
 * Design note: this function never throws on connection failure. If no URI
 * is configured, or the database is unreachable, the server continues to run
 * and the API falls back to in-memory seed data. This keeps the public site
 * working during development and demos before a database is provisioned.
 *
 * @returns {Promise<boolean>} true if a live DB connection was established.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '[db] No MONGODB_URI set — running without a database. ' +
        'The API will serve in-memory seed data.'
    );
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[db] Connected to MongoDB');
    return true;
  } catch (error) {
    console.warn(
      `[db] Could not connect to MongoDB (${error.message}). ` +
        'Falling back to in-memory seed data.'
    );
    return false;
  }
}

/** True when a live Mongoose connection is currently open. */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
