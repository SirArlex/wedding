import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    weddingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
    },
    // Cloudinary public_id — used to delete from Cloudinary
    publicId: {
      type: String,
      required: true,
    },
    // Full Cloudinary delivery URL
    url: {
      type: String,
      required: true,
    },
    // Thumbnail URL (Cloudinary transform)
    thumbnailUrl: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape', 'square'],
      default: 'landscape',
    },
    // Controls display order in gallery
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

galleryImageSchema.index({ weddingId: 1, order: 1 });

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);
export default GalleryImage;
