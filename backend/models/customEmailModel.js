import mongoose from 'mongoose';

const customEmailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resendConfigId: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  forwardToEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Profile picture for this custom email
  profilePicture: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      default: null
    },
    fileSize: {
      type: Number,
      default: null
    },
    mimeType: {
      type: String,
      default: null
    }
  },
  signature: {
    type: String,
    default: null
  },
  displayName: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
customEmailSchema.index({ userId: 1 });
customEmailSchema.index({ email: 1 });
customEmailSchema.index({ userId: 1, isDefault: 1 });
customEmailSchema.index({ userId: 1, domain: 1 });

const CustomEmail = mongoose.model('CustomEmail', customEmailSchema);

export default CustomEmail;