import mongoose from 'mongoose';
import Wedding from '../models/Wedding.js';
import Rsvp from '../models/Rsvp.js';
import Donation from '../models/Donation.js';
import GalleryImage from '../models/GalleryImage.js';
import { connectDatabase } from '../config/database.js';
import { v2 as cloudinary } from 'cloudinary';

// ─── Cloudinary config (called lazily) ──────────────────────────────────────
function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sanitizeStr(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/<[^>]*>/g, '').trim();
}

function toCSV(headers, rows) {
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))];
  return lines.join('\r\n');
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 */
export async function getDashboard(req, res, next) {
  try {
    await connectDatabase();
    const weddingId = req.weddingId;

    const [rsvpStats, donationStats, recentDonations, recentRsvps] = await Promise.all([
      // RSVP counts
      Rsvp.aggregate([
        { $match: { weddingId: new mongoose.Types.ObjectId(weddingId) } },
        {
          $group: {
            _id: '$attending',
            count: { $sum: 1 },
            totalGuests: { $sum: '$guestCount' },
          },
        },
      ]).catch(() => []),

      // Donation totals
      Donation.aggregate([
        { $match: { weddingId: new mongoose.Types.ObjectId(weddingId), status: 'success' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDonors: { $sum: 1 },
          },
        },
      ]).catch(() => []),

      // Recent 5 donations
      Donation.find({ weddingId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-email')
        .lean()
        .catch(() => []),

      // Recent 5 RSVPs
      Rsvp.find({ weddingId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-__v')
        .lean()
        .catch(() => []),
    ]);

    // Shape RSVP stats
    const attending = rsvpStats.find((s) => s._id === 'yes') || { count: 0, totalGuests: 0 };
    const declining = rsvpStats.find((s) => s._id === 'no') || { count: 0 };

    // Shape donation stats
    const donations = donationStats[0] || { totalAmount: 0, totalDonors: 0 };

    res.json({
      success: true,
      data: {
        rsvp: {
          total: attending.count + declining.count,
          attending: attending.count,
          notAttending: declining.count,
          totalGuests: attending.totalGuests,
        },
        gifts: {
          totalAmount: donations.totalAmount,
          totalAmountFormatted: `₦${(donations.totalAmount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
          totalDonors: donations.totalDonors,
        },
        recentDonations: recentDonations.map((d) => ({
          id: d._id,
          donorName: d.anonymous ? 'Anonymous' : d.donorName,
          amount: `₦${(d.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
          status: d.status,
          createdAt: d.createdAt,
        })),
        recentRsvps: recentRsvps.map((r) => ({
          id: r._id,
          fullName: r.fullName,
          attending: r.attending,
          guestCount: r.guestCount,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── RSVPs ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/rsvps?page=1&limit=50&attending=yes
 */
export async function getRsvps(req, res, next) {
  try {
    await connectDatabase();
    const { page = 1, limit = 50, attending } = req.query;
    const filter = { weddingId: req.weddingId };
    if (attending === 'yes' || attending === 'no') filter.attending = attending;

    const [rsvps, total] = await Promise.all([
      Rsvp.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Rsvp.countDocuments(filter),
    ]);

    res.json({ success: true, data: rsvps, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/rsvps/export — CSV download
 */
export async function exportRsvps(req, res, next) {
  try {
    await connectDatabase();
    const rsvps = await Rsvp.find({ weddingId: req.weddingId }).sort({ createdAt: -1 }).lean();

    const headers = ['Name', 'Email', 'Attending', 'Guest Count', 'Message', 'Submitted At'];
    const rows = rsvps.map((r) => [
      r.fullName,
      r.email,
      r.attending,
      r.guestCount,
      r.message || '',
      new Date(r.createdAt).toISOString(),
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="rsvps.csv"');
    res.send(toCSV(headers, rows));
  } catch (err) {
    next(err);
  }
}

// ─── DONATIONS ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/donations?page=1&limit=50&status=success
 */
export async function getDonations(req, res, next) {
  try {
    await connectDatabase();
    const { page = 1, limit = 50, status } = req.query;
    const filter = { weddingId: req.weddingId };
    if (['pending', 'success', 'failed', 'abandoned'].includes(status)) filter.status = status;

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-__v')
        .lean(),
      Donation.countDocuments(filter),
    ]);

    // Mask email partially for display (privacy)
    const masked = donations.map((d) => {
      const [local, domain] = (d.email || '').split('@');
      const maskedEmail = local
        ? `${local[0]}${'*'.repeat(Math.max(local.length - 2, 2))}${local.slice(-1)}@${domain}`
        : '';
      return {
        ...d,
        email: maskedEmail,
        amountFormatted: `₦${(d.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      };
    });

    res.json({ success: true, data: masked, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/donations/export — CSV download
 */
export async function exportDonations(req, res, next) {
  try {
    await connectDatabase();
    const donations = await Donation.find({ weddingId: req.weddingId })
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      'Donor Name',
      'Amount (₦)',
      'Status',
      'Reference',
      'Message',
      'Anonymous',
      'Paid At',
      'Submitted At',
    ];
    const rows = donations.map((d) => [
      d.anonymous ? 'Anonymous' : d.donorName,
      (d.amount / 100).toFixed(2),
      d.status,
      d.reference,
      d.message || '',
      d.anonymous ? 'Yes' : 'No',
      d.paidAt ? new Date(d.paidAt).toISOString() : '',
      new Date(d.createdAt).toISOString(),
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
    res.send(toCSV(headers, rows));
  } catch (err) {
    next(err);
  }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/settings
 */
export async function getSettings(req, res, next) {
  try {
    await connectDatabase();
    const wedding = await Wedding.findById(req.weddingId).lean();
    if (!wedding) return res.status(404).json({ success: false, message: 'Wedding not found.' });
    res.json({ success: true, data: wedding });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/settings
 * Body: partial Wedding fields
 */
export async function updateSettings(req, res, next) {
  try {
    await connectDatabase();

    const allowed = [
      'brideName', 'groomName', 'weddingDate', 'weddingDateISO', 'location',
      'hero', 'story', 'ceremony', 'reception', 'gift', 'published',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = typeof req.body[key] === 'string' ? sanitizeStr(req.body[key]) : req.body[key];
      }
    }

    const wedding = await Wedding.findByIdAndUpdate(
      req.weddingId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!wedding) return res.status(404).json({ success: false, message: 'Wedding not found.' });

    res.json({ success: true, data: wedding });
  } catch (err) {
    next(err);
  }
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/gallery
 */
export async function getGallery(req, res, next) {
  try {
    await connectDatabase();
    const images = await GalleryImage.find({ weddingId: req.weddingId })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ success: true, data: images });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/gallery/upload
 * Body: multipart/form-data — file field: "image"
 */
export async function uploadImage(req, res, next) {
  try {
    await connectDatabase();
    configureCloudinary();

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `weddings/${req.weddingId}`,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    // Determine orientation from dimensions
    let orientation = 'landscape';
    if (result.width === result.height) orientation = 'square';
    else if (result.height > result.width) orientation = 'portrait';

    // Thumbnail URL via Cloudinary transform
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });

    // Count existing images for order
    const count = await GalleryImage.countDocuments({ weddingId: req.weddingId });

    const image = await GalleryImage.create({
      weddingId: req.weddingId,
      publicId: result.public_id,
      url: result.secure_url,
      thumbnailUrl,
      orientation,
      order: count,
      alt: sanitizeStr(req.body.alt || ''),
      caption: sanitizeStr(req.body.caption || ''),
    });

    res.status(201).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/gallery/:imageId
 * Body: { alt?, caption?, orientation?, order? }
 */
export async function updateImage(req, res, next) {
  try {
    await connectDatabase();
    const { imageId } = req.params;

    const image = await GalleryImage.findOne({ _id: imageId, weddingId: req.weddingId });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });

    if (req.body.alt !== undefined) image.alt = sanitizeStr(req.body.alt).slice(0, 200);
    if (req.body.caption !== undefined) image.caption = sanitizeStr(req.body.caption).slice(0, 300);
    if (['portrait', 'landscape', 'square'].includes(req.body.orientation)) {
      image.orientation = req.body.orientation;
    }
    if (req.body.order !== undefined) image.order = Number(req.body.order);

    await image.save();
    res.json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/gallery/:imageId
 */
export async function deleteImage(req, res, next) {
  try {
    await connectDatabase();
    configureCloudinary();

    const { imageId } = req.params;
    const image = await GalleryImage.findOne({ _id: imageId, weddingId: req.weddingId });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId).catch((e) =>
      console.warn('[cloudinary] delete failed:', e.message)
    );

    await image.deleteOne();
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/gallery/reorder
 * Body: { order: [{ id, order }] }
 */
export async function reorderGallery(req, res, next) {
  try {
    await connectDatabase();
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'order must be an array.' });
    }

    const ops = order.map(({ id, order: idx }) => ({
      updateOne: {
        filter: { _id: id, weddingId: req.weddingId },
        update: { $set: { order: idx } },
      },
    }));

    await GalleryImage.bulkWrite(ops);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
