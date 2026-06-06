import mongoose from 'mongoose';

const teamAccessSchema = new mongoose.Schema({
  // The domain/resend config that is being shared
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
  // Owner of the resend config
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User who has been granted access
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Access level
  accessLevel: {
    type: String,
    enum: ['view', 'send', 'manage', 'admin'],
    default: 'view'
  },
  // Permissions
  permissions: {
    canViewEmails: {
      type: Boolean,
      default: true
    },
    canSendEmails: {
      type: Boolean,
      default: false
    },
    canCreateCustomEmails: {
      type: Boolean,
      default: false
    },
    canDeleteCustomEmails: {
      type: Boolean,
      default: false
    },
    canManageAccess: {
      type: Boolean,
      default: false
    }
  },
  // Specific custom emails this user has access to (empty means all)
  accessibleEmails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomEmail'
  }],
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'revoked'],
    default: 'pending'
  },
  invitationToken: {
    type: String,
    default: null
  },
  tokenExpiry: {
    type: Date,
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  revokedAt: {
    type: Date,
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
teamAccessSchema.index({ ownerId: 1 });
teamAccessSchema.index({ userId: 1 });
teamAccessSchema.index({ resendConfigId: 1 });
teamAccessSchema.index({ invitationToken: 1 });
teamAccessSchema.index({ ownerId: 1, userId: 1, resendConfigId: 1 }, { unique: true });

const TeamAccess = mongoose.model('TeamAccess', teamAccessSchema);

export default TeamAccess;