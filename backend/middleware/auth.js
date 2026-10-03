import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { connectDatabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

/**
 * Sign a JWT for an admin session.
 * @param {string} adminId  Mongoose _id
 * @param {string} weddingId  The wedding this admin is managing
 */
export function signToken(adminId, weddingId) {
  return jwt.sign(
    { sub: adminId.toString(), weddingId: weddingId?.toString() },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

/**
 * Express middleware — verifies the JWT from the Authorization header
 * or from an httpOnly cookie, then attaches `req.admin` and `req.weddingId`.
 */
export async function requireAuth(req, res, next) {
  try {
    // Accept token from Authorization header OR cookie
    let token =
      req.cookies?.adminToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
    }

    await connectDatabase();

    const admin = await Admin.findById(payload.sub).lean();
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin account not found.' });
    }

    req.admin = admin;
    req.weddingId = payload.weddingId || admin.weddingIds?.[0]?.toString();
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware — confirms the authenticated admin has access to
 * the weddingId being requested (prevents cross-tenant data access).
 *
 * Expects req.admin and req.weddingId to be set by requireAuth first.
 * The requested weddingId comes from req.query.weddingId or req.body.weddingId
 * or falls back to the token's weddingId.
 */
export function requireWeddingAccess(req, res, next) {
  const requested =
    req.params.weddingId ||
    req.query.weddingId ||
    req.body?.weddingId ||
    req.weddingId;

  if (!requested) {
    return res.status(400).json({ success: false, message: 'Wedding ID is required.' });
  }

  const allowed = req.admin.weddingIds?.map((id) => id.toString()) || [];

  if (!allowed.includes(requested.toString())) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  req.weddingId = requested;
  next();
}
