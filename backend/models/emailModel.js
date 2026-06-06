import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  // Who owns this email
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Which custom email sent/received this
  customEmailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomEmail',
    required: true
  },
  // Email direction
  direction: {
    type: String,
    enum: ['sent', 'received'],
    required: true
  },
  // Email identifiers
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  // Sender and recipient
  from: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: null
    }
  },
  to: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: null
    }
  }],
  cc: [{
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: null
    }
  }],
  bcc: [{
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: null
    }
  }],
  // Email content
  subject: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['html', 'text'],
    default: 'html'
  },
  // Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    cid: {
      type: String,
      default: null
    }
  }],
  // Reply tracking
  isReply: {
    type: Boolean,
    default: false
  },
  replyToEmailId: {
    type: String,
    default: null
  },
  replyToEmail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    default: null
  },
  // Status and metadata
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'opened', 'received', 'read', 'replied'],
    default: 'sent'
  },
  // For sent emails
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  openedAt: {
    type: Date,
    default: null
  },
  // For received emails
  receivedAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  // Labels and folders
  isStarred: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isTrashed: {
    type: Boolean,
    default: false
  },
  labels: [{
    type: String,
    trim: true
  }],
  // Resend API response data
  resendResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // Webhook data for received emails
  webhookData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
emailSchema.index({ userId: 1, direction: 1, createdAt: -1 });
emailSchema.index({ userId: 1, customEmailId: 1 });
emailSchema.index({ userId: 1, isStarred: 1 });
emailSchema.index({ userId: 1, isArchived: 1 });
emailSchema.index({ userId: 1, isTrashed: 1 });
emailSchema.index({ userId: 1, status: 1 });
emailSchema.index({ emailId: 1 });
emailSchema.index({ 'from.email': 1 });
emailSchema.index({ 'to.email': 1 });
emailSchema.index({ replyToEmailId: 1 });

const Email = mongoose.model('Email', emailSchema);

export default Email;