import Admin from '../models/Admin.js';
import { connectDatabase } from '../config/database.js';
import { signToken } from '../middleware/auth.js';

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * POST /api/admin/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
  try {
    await connectDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      // Constant-time-ish response to avoid user enumeration
      await new Promise((r) => setTimeout(r, 400));
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const valid = await admin.verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Record last login
    admin.lastLoginAt = new Date();
    await admin.save();

    const weddingId = admin.weddingIds?.[0]?.toString();
    const token = signToken(admin._id, weddingId);

    // Set httpOnly cookie (preferred) + also return in body for clients that need it
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        weddingId,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/logout
 */
export function logout(req, res) {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logged out.' });
}

/**
 * GET /api/admin/me
 * Returns the currently authenticated admin (token already verified by middleware).
 */
export function me(req, res) {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      weddingId: req.weddingId,
    },
  });
}
