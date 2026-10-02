import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    weddingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
    },

    // Donor info
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
      maxlength: [120, 'Name must be 120 characters or less'],
    },
    // Email is stored server-side only and NEVER returned in public endpoints
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email too long'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },

    // Amount in kobo (Paystack) — integer, e.g. 5000 = ₦50.00
    amount: {
      type: Number,
      required: true,
      min: [10000, 'Minimum donation is ₦100'],
    },
    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
    },

    // Optional message for the Gift Wall
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Message must be 300 characters or less'],
    },

    // If true, display as "Anonymous" on the Gift Wall
    anonymous: {
      type: Boolean,
      default: false,
    },

    // Paystack reference — unique per transaction
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Payment status — only 'success' means money was received
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'abandoned'],
      default: 'pending',
    },

    // Timestamps
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Efficient lookups by weddingId + status for the Gift Wall
donationSchema.index({ weddingId: 1, status: 1 });
donationSchema.index({ reference: 1 });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
