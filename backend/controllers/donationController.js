import crypto from 'crypto';
import axios from 'axios';
import Donation from '../models/Donation.js';
import Wedding from '../models/Wedding.js';
import { connectDatabase, isDatabaseConnected } from '../config/database.js';

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

// Kobo → formatted Naira string (for display)
function formatAmount(kobo) {
  return `NGN ${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

/**
 * POST /api/donations/initiate
 * Body: { weddingSlug, donorName, email, amountNaira, message?, anonymous? }
 *
 * Creates a pending Donation record, then calls Paystack to initialize the
 * transaction. Returns { authorizationUrl } which the frontend redirects to.
 * The secret key NEVER leaves the server.
 */
export async function initiateDonation(req, res, next) {
  try {
    await connectDatabase();
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Donation service is not available right now.',
      });
    }

    const { weddingSlug, donorName, email, amountNaira, message, anonymous } = req.body;

    // ── Validate ──────────────────────────────────────────────
    if (!weddingSlug || typeof weddingSlug !== 'string') {
      return res.status(400).json({ success: false, message: 'Wedding identifier is required.' });
    }
    if (!donorName || typeof donorName !== 'string' || donorName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Your name is required.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    const parsedAmount = Number(amountNaira);
    if (!parsedAmount || parsedAmount < 100 || !Number.isFinite(parsedAmount)) {
      return res.status(400).json({ success: false, message: 'Minimum donation is NGN 100.' });
    }
    const amountKobo = Math.round(parsedAmount * 100);

    // ── Find the wedding ──────────────────────────────────────
    const wedding = await Wedding.findOne({ slug: sanitize(weddingSlug) }).lean();
    if (!wedding) {
      return res.status(404).json({ success: false, message: 'Wedding not found.' });
    }

    // ── Generate unique Paystack reference ─────────────────────
    const reference = `wed_${wedding._id}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // ── Create pending donation in DB ─────────────────────────
    await Donation.create({
      weddingId: wedding._id,
      donorName: sanitize(donorName).slice(0, 120),
      email: email.toLowerCase().trim().slice(0, 254),
      amount: amountKobo,
      currency: 'NGN',
      message: message ? sanitize(String(message)).slice(0, 300) : undefined,
      anonymous: Boolean(anonymous),
      reference,
      status: 'pending',
    });

    // ── Call Paystack Initialize Transaction ──────────────────
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured. Please try again later.',
      });
    }

    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ||
      `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/gift/callback`;

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email.toLowerCase().trim(),
        amount: amountKobo,
        reference,
        callback_url: callbackUrl,
        metadata: {
          donorName: sanitize(donorName),
          weddingSlug: sanitize(weddingSlug),
          cancel_action: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/gift`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!paystackRes.data?.status) {
      return res.status(502).json({
        success: false,
        message: 'Could not reach payment gateway. Please try again.',
      });
    }

    res.json({
      success: true,
      authorizationUrl: paystackRes.data.data.authorization_url,
      reference,
    });
  } catch (err) {
    if (err.response) {
      // Paystack API error
      console.error('[paystack] initiate error:', err.response.data);
      return res.status(502).json({
        success: false,
        message: 'Payment gateway returned an error. Please try again.',
      });
    }
    next(err);
  }
}

/**
 * GET /api/donations/verify/:reference
 *
 * Called by the frontend after Paystack redirects back.
 * We verify with Paystack server-to-server — NEVER trust the frontend alone.
 * Updates the Donation record only if Paystack confirms success.
 */
export async function verifyDonation(req, res, next) {
  try {
    const { reference } = req.params;
    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ success: false, message: 'Reference is required.' });
    }

    // ── Look up the pending donation ──────────────────────────
    const donation = await Donation.findOne({ reference: reference.trim() });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    // Already verified — idempotent response
    if (donation.status === 'success') {
      return res.json({
        success: true,
        status: 'success',
        amount: formatAmount(donation.amount),
        donorName: donation.anonymous ? 'Anonymous' : donation.donorName,
      });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured.',
      });
    }

    // ── Server-to-server verification with Paystack ───────────
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`,
      {
        headers: { Authorization: `Bearer ${paystackSecretKey}` },
        timeout: 10000,
      }
    );

    const tx = paystackRes.data?.data;

    if (!tx || paystackRes.data?.status !== true) {
      return res.status(502).json({ success: false, message: 'Could not verify transaction.' });
    }

    // ── Only mark success when Paystack confirms it ───────────
    if (tx.status === 'success') {
      // Extra guard: verify the amount matches what we stored
      if (tx.amount !== donation.amount) {
        console.warn(
          `[paystack] amount mismatch for ref ${reference}: expected ${donation.amount}, got ${tx.amount}`
        );
        donation.status = 'failed';
        await donation.save();
        return res.status(400).json({ success: false, message: 'Payment amount mismatch.' });
      }

      donation.status = 'success';
      donation.paidAt = new Date(tx.paid_at || Date.now());
      await donation.save();

      return res.json({
        success: true,
        status: 'success',
        amount: formatAmount(donation.amount),
        donorName: donation.anonymous ? 'Anonymous' : donation.donorName,
      });
    }

    // Paystack says not yet successful
    const newStatus =
      tx.status === 'abandoned' ? 'abandoned' : tx.status === 'failed' ? 'failed' : 'pending';
    donation.status = newStatus;
    await donation.save();

    return res.json({ success: false, status: newStatus });
  } catch (err) {
    if (err.response) {
      console.error('[paystack] verify error:', err.response.data);
      return res.status(502).json({
        success: false,
        message: 'Payment gateway returned an error during verification.',
      });
    }
    next(err);
  }
}

/**
 * POST /api/donations/webhook
 *
 * Paystack calls this URL asynchronously after every payment event.
 * We MUST verify the HMAC-SHA512 signature before trusting the payload.
 * This endpoint must receive the raw body (express.raw), not JSON-parsed.
 */
export async function paystackWebhook(req, res, next) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.sendStatus(500);
    }

    // ── Signature verification ────────────────────────────────
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      return res.sendStatus(400);
    }

    const expectedSig = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(req.body) // req.body is the raw Buffer here
      .digest('hex');

    if (signature !== expectedSig) {
      console.warn('[webhook] invalid Paystack signature');
      return res.sendStatus(401);
    }

    // ── Parse the event ───────────────────────────────────────
    let event;
    try {
      event = JSON.parse(req.body.toString());
    } catch {
      return res.sendStatus(400);
    }

    // Acknowledge immediately (Paystack requires 200 within 5 s)
    res.sendStatus(200);

    // ── Handle charge.success ─────────────────────────────────
    if (event.event === 'charge.success') {
      const tx = event.data;
      if (!tx?.reference) return;

      const donation = await Donation.findOne({ reference: tx.reference });
      if (!donation || donation.status === 'success') return;

      // Verify amount again from the webhook payload
      if (tx.amount !== donation.amount) {
        console.warn(`[webhook] amount mismatch for ref ${tx.reference}`);
        return;
      }

      donation.status = 'success';
      donation.paidAt = new Date(tx.paid_at || Date.now());
      await donation.save();

      console.log(`[webhook] donation ${tx.reference} marked success`);
    }

    // Other events (charge.failed, etc.) — update status
    if (event.event === 'charge.failed') {
      const tx = event.data;
      if (!tx?.reference) return;
      await Donation.findOneAndUpdate(
        { reference: tx.reference, status: 'pending' },
        { status: 'failed' }
      );
    }
  } catch (err) {
    console.error('[webhook] error:', err);
    // Don't call next(err) — we already sent 200
  }
}

/**
 * GET /api/donations/wall?slug=:weddingSlug
 *
 * Returns successful donations for the Gift Wall.
 * Email addresses are NEVER included.
 */
export async function getGiftWall(req, res, next) {
  try {
    const { slug } = req.query;
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Wedding slug is required.' });
    }

    await connectDatabase();
    if (!isDatabaseConnected()) {
      return res.json({ success: true, data: [] });
    }

    const wedding = await Wedding.findOne({ slug: sanitize(slug) }).lean();
    if (!wedding) {
      return res.status(404).json({ success: false, message: 'Wedding not found.' });
    }

    const donations = await Donation.find({ weddingId: wedding._id, status: 'success' })
      .sort({ paidAt: -1 })
      .limit(100)
      .select('-email -__v')
      .lean();

    // Redact email entirely — it's excluded by the projection above.
    // Also honour the anonymous flag on the name.
    const wall = donations.map((d) => ({
      id: d._id,
      name: d.anonymous ? 'Anonymous' : d.donorName,
      amount: formatAmount(d.amount),
      message: d.message || null,
      paidAt: d.paidAt,
    }));

    res.json({ success: true, data: wall });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/donations/summary?slug=:weddingSlug
 *
 * Returns aggregate contribution stats.
 * Email addresses are NEVER included.
 */
export async function getDonationSummary(req, res, next) {
  try {
    const { slug } = req.query;
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Wedding slug is required.' });
    }

    await connectDatabase();
    if (!isDatabaseConnected()) {
      return res.json({ success: true, data: { total: 0, count: 0, formatted: 'NGN 0.00' } });
    }

    const wedding = await Wedding.findOne({ slug: sanitize(slug) }).lean();
    if (!wedding) {
      return res.status(404).json({ success: false, message: 'Wedding not found.' });
    }

    const [agg] = await Donation.aggregate([
      { $match: { weddingId: wedding._id, status: 'success' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const total = agg?.total || 0;
    const count = agg?.count || 0;

    res.json({
      success: true,
      data: {
        total,
        count,
        formatted: formatAmount(total),
      },
    });
  } catch (err) {
    next(err);
  }
}
