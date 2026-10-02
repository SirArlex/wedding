import Wedding from '../models/Wedding.js';
import { isDatabaseConnected } from '../config/database.js';
import { developmentWedding } from '../services/weddingData.js';

/**
 * GET /api/wedding
 * Returns the current (development) wedding.
 *
 * In Phase 1 there is a single wedding. When multi-tenancy arrives,
 * this becomes GET /api/wedding/:slug and looks the slug up directly.
 */
export async function getWedding(req, res, next) {
  try {
    if (isDatabaseConnected()) {
      const wedding = await Wedding.findOne({ published: true }).lean();
      if (wedding) {
        return res.json({ source: 'database', data: wedding });
      }
      // DB is up but empty — fall through to seed so the site still renders.
    }

    return res.json({ source: 'seed', data: developmentWedding });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wedding/:slug
 * Scaffolding for the multi-tenant future. For now it resolves the
 * development wedding by slug, or falls back to seed data.
 */
export async function getWeddingBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    if (isDatabaseConnected()) {
      const wedding = await Wedding.findOne({ slug, published: true }).lean();
      if (wedding) {
        return res.json({ source: 'database', data: wedding });
      }
    }

    if (slug === developmentWedding.slug) {
      return res.json({ source: 'seed', data: developmentWedding });
    }

    return res.status(404).json({ error: 'Wedding not found' });
  } catch (error) {
    next(error);
  }
}
