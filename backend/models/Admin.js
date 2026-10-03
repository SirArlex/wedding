import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'Admin',
    },
    // Which wedding(s) this admin can manage
    weddingIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding',
      },
    ],
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Never return the password hash in queries
adminSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

adminSchema.methods.verifyPassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

adminSchema.statics.hashPassword = async function (plain) {
  return bcrypt.hash(plain, 12);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
