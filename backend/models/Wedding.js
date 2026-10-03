import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Sub-schema for a single event (ceremony or reception).
 * Kept flexible so additional events can be added later without migration.
 */
const eventSchema = new Schema(
  {
    title: { type: String, required: true }, // e.g. "Ceremony"
    date: { type: String, required: true }, // human-readable, e.g. "Saturday, June 14, 2025"
    time: { type: String, required: true }, // e.g. "4:00 in the afternoon"
    venue: { type: String, required: true },
    address: { type: String, required: true },
    mapUrl: { type: String, default: '' }, // external maps link
    note: { type: String, default: '' }, // optional dress code / extra info
  },
  { _id: false }
);

/**
 * Sub-schema for a gallery image.
 * `orientation` lets the frontend build an intentional masonry layout.
 */
const galleryImageSchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, default: '' },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape', 'square'],
      default: 'landscape',
    },
  },
  { _id: false }
);

/**
 * The Wedding document -- the single source of truth for one wedding.
 *
 * `slug` is unique and will become the multi-tenant key in a later phase
 * (e.g. /w/sarah-and-james). For Phase 1 there is one development wedding.
 */
const weddingSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Couple
    brideName: { type: String, required: true },
    groomName: { type: String, required: true },

    // Headline details
    weddingDate: { type: String, required: true }, // display string
    weddingDateISO: { type: String, default: '' }, // machine-readable, for countdowns later
    location: { type: String, required: true }, // e.g. "Tuscany, Italy"

    // Hero
    hero: {
      image: { type: String, default: '' },
      kicker: { type: String, default: 'The Wedding Of' },
    },

    // Story (editorial)
    story: {
      intro: { type: String, default: '' },
      paragraphs: { type: [String], default: [] },
      image: { type: String, default: '' },
      quote: { type: String, default: '' },
    },

    // Events
    ceremony: { type: eventSchema, required: true },
    reception: { type: eventSchema, required: true },

    // Gallery
    gallery: { type: [galleryImageSchema], default: [] },

    // Gift section copy (Paystack wiring comes in a later phase)
    gift: {
      heading: { type: String, default: '' },
      message: { type: String, default: '' },
    },

    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Wedding = mongoose.model('Wedding', weddingSchema);

export default Wedding;
