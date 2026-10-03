import Rsvp from '../models/Rsvp.js';
import Wedding from '../models/Wedding.js';
import { isDatabaseConnected } from '../config/database.js';

// Strip all HTML tags and decode common entities from user-supplied strings
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * POST /api/rsvp
 * Body: { weddingSlug, fullName, email, attending, guestCount?, message? }
 */
export async function submitRsvp(req, res, next) {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'RSVP service is not available right now. Please try again later.',
      });
    }

    const { weddingSlug, fullName, email, attending, guestCount, message } = req.body;

    // ── Basic server-side validation ─────────────────────────
    if (!weddingSlug || typeof weddingSlug !== 'string') {
      return res.status(400).json({ success: false, message: 'Wedding identifier is required.' });
    }
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!['yes', 'no'].includes(attending)) {
      return res.status(400).json({ success: false, message: 'Attendance selection is required.' });
    }
    const count = Number(guestCount) || 1;
    if (count < 1 || count > 10) {
      return res.status(400).json({ success: false, message: 'Guest count must be between 1 and 10.' });
    }

    // ── Find the wedding ──────────────────────────────────────
    const wedding = await Wedding.findOne({ slug: sanitize(weddingSlug) }).lean();
    if (!wedding) {
      return res.status(404).json({ success: false, message: 'Wedding not found.' });
    }

    // ── Duplicate check (same email + wedding) ────────────────
    const existing = await Rsvp.findOne({
      email: email.toLowerCase().trim(),
      weddingId: wedding._id,
    }).lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_RSVP',
        message: `We already have an RSVP for ${email}. If you need to make changes, please contact us directly.`,
      });
    }

    // ── Create RSVP ───────────────────────────────────────────
    const rsvp = await Rsvp.create({
      weddingId: wedding._id,
      fullName: sanitize(fullName).slice(0, 120),
      email: email.toLowerCase().trim().slice(0, 254),
      attending,
      guestCount: count,
      message: message ? sanitize(String(message)).slice(0, 500) : undefined,
    });

    res.status(201).json({
      success: true,
      message: attending === 'yes'
        ? `We can't wait to celebrate with you, ${rsvp.fullName.split(' ')[0]}!`
        : `Thank you for letting us know, ${rsvp.fullName.split(' ')[0]}. You'll be in our thoughts.`,
      data: {
        id: rsvp._id,
        fullName: rsvp.fullName,
        attending: rsvp.attending,
        guestCount: rsvp.guestCount,
      },
    });
  } catch (err) {
    // Mongoose duplicate-key error (race condition)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_RSVP',
        message: 'We already have an RSVP for this email address.',
      });
    }
    next(err);
  }
}
