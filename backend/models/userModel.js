// models/userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null
  },
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
  // App version tracking
  appVersion: {
    type: String,
    default: null // e.g., "1.0.0"
  },
  appVersionUpdatedAt: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  otp: {
    code: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  twoFactorOTP: {
    code: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  resetPasswordOTP: {
    code: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  resendConfigs: [{
    id: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    tokenExpiry: {
      type: Date,
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    webhookSecret: {
      type: String,
      default: null
    },
    webhookConfiguredAt: {
      type: Date,
      default: null
    }
  }],
  settings: {
    appearance: {
      darkMode: {
        type: Boolean,
        default: false
      },
      language: {
        type: String,
        default: 'en'
      },
      compactView: {
        type: Boolean,
        default: false
      }
    },
    email: {
      signature: {
        type: String,
        default: ''
      },
      autoSave: {
        type: Boolean,
        default: true
      },
      confirmBeforeSend: {
        type: Boolean,
        default: true
      },
      replyAboveQuote: {
        type: Boolean,
        default: true
      },
      showPreviewPane: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      readReceipts: {
        type: Boolean,
        default: false
      },
      trackOpens: {
        type: Boolean,
        default: false
      }
    }
  },
  notificationPreferences: {
    email: {
      newEmail: {
        type: Boolean,
        default: true
      },
      loginAlerts: {
        type: Boolean,
        default: true
      },
      domainVerified: {
        type: Boolean,
        default: true
      },
      teamInvites: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    push: {
      enabled: {
        type: Boolean,
        default: false
      },
      newEmail: {
        type: Boolean,
        default: true
      },
      loginAlerts: {
        type: Boolean,
        default: true
      },
      domainVerified: {
        type: Boolean,
        default: false
      },
      teamInvites: {
        type: Boolean,
        default: true
      }
    }
  },
  pushTokens: [{
    token: {
      type: String,
      required: true
    },
    deviceType: {
      type: String,
      enum: ['web', 'ios', 'android'],
      default: 'web'
    },
    subscription: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    deviceId: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ appVersion: 1 });
userSchema.index({ 'resendConfigs.domain': 1 });
userSchema.index({ 'resendConfigs.id': 1 });
userSchema.index({ 'pushTokens.token': 1 });
userSchema.index({ 'pushTokens.deviceId': 1 });

const User = mongoose.model('User', userSchema);

export default User;