import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

import { login, logout, me } from '../controllers/authController.js';
import {
  getDashboard,
  getRsvps,
  exportRsvps,
  getDonations,
  exportDonations,
  getSettings,
  updateSettings,
  getGallery,
  uploadImage,
  updateImage,
  deleteImage,
  reorderGallery,
} from '../controllers/adminController.js';
import { requireAuth, requireWeddingAccess } from '../middleware/auth.js';

const router = Router();

// -- Multer -- memory storage, 10 MB limit, images only ------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// -- Auth rate limiter ---------------------------------------------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

// -- Public auth routes --------------------------------------------------------
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

// -- Protected routes (all require auth + wedding access check) ----------------
const protect = [requireAuth, requireWeddingAccess];

router.get('/dashboard', ...protect, getDashboard);

router.get('/rsvps', ...protect, getRsvps);
router.get('/rsvps/export', ...protect, exportRsvps);

router.get('/donations', ...protect, getDonations);
router.get('/donations/export', ...protect, exportDonations);

router.get('/settings', ...protect, getSettings);
router.patch('/settings', ...protect, updateSettings);

router.get('/gallery', ...protect, getGallery);
router.post('/gallery/upload', ...protect, upload.single('image'), uploadImage);
router.post('/gallery/reorder', ...protect, reorderGallery);
router.patch('/gallery/:imageId', ...protect, updateImage);
router.delete('/gallery/:imageId', ...protect, deleteImage);

export default router;
