import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema(
  {
    weddingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
    },

    // Guest info
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Name must be 120 characters or less'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email too long'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },

    // Attendance
    attending: {
      type: String,
      enum: ['yes', 'no'],
      required: [true, 'Attendance response is required'],
    },
    guestCount: {
      type: Number,
      min: [1, 'Guest count must be at least 1'],
      max: [10, 'Guest count may not exceed 10'],
      default: 1,
    },

    // Message
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message must be 500 characters or less'],
    },

    // For duplicate-detection (email + weddingId must be unique)
    // The compound unique index is defined below.
  },
  {
    timestamps: true,
  }
);

// One RSVP per email per wedding
rsvpSchema.index({ email: 1, weddingId: 1 }, { unique: true });

const Rsvp = mongoose.model('Rsvp', rsvpSchema);
export default Rsvp;
