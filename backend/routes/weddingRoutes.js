import { Router } from 'express';
import { getWedding, getWeddingBySlug } from '../controllers/weddingController.js';

const router = Router();

// Current development wedding.
router.get('/', getWedding);

// Multi-tenant lookup scaffolding (unused by the Phase 1 frontend).
router.get('/:slug', getWeddingBySlug);

export default router;
