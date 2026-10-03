import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { connectDatabase } from './config/database.js';
import weddingRoutes from './routes/weddingRoutes.js';
import rsvpRoutes from './routes/rsvpRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// -- Trust Vercel's proxy (required for express-rate-limit) --------------------
app.set('trust proxy', 1);

// -- Security headers ----------------------------------------------------------
app.use(helmet());

// -- CORS ----------------------------------------------------------------------
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true, // required for httpOnly cookie auth
  })
);

// -- Cookie parser (needed for httpOnly admin session cookie) ------------------
app.use(cookieParser());

// -- Rate limiting -------------------------------------------------------------
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

app.use(
  '/api/rsvp',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many RSVP submissions. Please try again later.' },
  })
);

app.use(
  '/api/donations/initiate',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many payment requests. Please try again later.' },
  })
);

// -- Body parsing --------------------------------------------------------------
// Paystack webhook must receive raw body -- mounted first in donationRoutes.js
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// -- Routes --------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/wedding', weddingRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);

// -- Error handling ------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// -- Start ---------------------------------------------------------------------
async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`[server] API listening on http://localhost:${PORT}`);
  });
}

start();

export default app;
