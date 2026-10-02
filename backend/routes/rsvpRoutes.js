import { Router } from 'express';
import { submitRsvp } from '../controllers/rsvpController.js';

const router = Router();

// POST /api/rsvp
router.post('/', submitRsvp);

export default router;
