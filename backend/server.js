import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database.js';
import weddingRoutes from './routes/weddingRoutes.js';
import rsvpRoutes from './routes/rsvpRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      const allowed = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map((o) => o.trim());
      if (allowed.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Rate limiting ─────────────────────────────────────────────
// General API limiter
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Stricter limiter for RSVP (prevents spam)
app.use(
  '/api/rsvp',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many RSVP submissions. Please try again later.' },
  })
);

// Stricter limiter for donation initiation
app.use(
  '/api/donations/initiate',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many payment requests. Please try again later.' },
  })
);

// ── Body parsing ──────────────────────────────────────────────
// NOTE: The Paystack webhook route uses express.raw() instead (mounted in donationRoutes.js).
// Register it BEFORE express.json() so the webhook's raw-body parser takes precedence
// on that specific path.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Routes ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/wedding', weddingRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/donations', donationRoutes);

// ── Error handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
async function start() {
  await connectDatabase(); // resolves quietly if no DB; server still runs
  app.listen(PORT, () => {
    console.log(`[server] API listening on http://localhost:${PORT}`);
    console.log(`[server] Try http://localhost:${PORT}/api/health`);
  });
}

start();

export default app;
