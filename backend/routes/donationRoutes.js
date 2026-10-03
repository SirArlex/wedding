import { Router } from 'express';
import express from 'express';
import {
  initiateDonation,
  verifyDonation,
  paystackWebhook,
  getGiftWall,
  getDonationSummary,
} from '../controllers/donationController.js';

const router = Router();

// Gift Wall (public, no auth)
router.get('/wall', getGiftWall);

// Contribution summary (public, no auth)
router.get('/summary', getDonationSummary);

// Initiate a Paystack transaction
router.post('/initiate', initiateDonation);

// Verify a transaction after Paystack redirects back
router.get('/verify/:reference', verifyDonation);

// Paystack webhook -- MUST receive raw body for HMAC verification.
// We mount it with express.raw() here, scoped only to this route,
// so the rest of the app continues to use express.json().
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paystackWebhook
);

export default router;
