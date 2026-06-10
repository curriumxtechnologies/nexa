// models/appVersionModel.js
import mongoose from 'mongoose';

const appVersionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    trim: true
  },
  releaseNotes: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePublicId: {
    type: String,
    required: true
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  platform: {
    type: String,
    enum: ['android', 'ios'],
    default: 'android'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

appVersionSchema.index({ version: 1, platform: 1 }, { unique: true });

const AppVersion = mongoose.model('AppVersion', appVersionSchema);

export default AppVersion;