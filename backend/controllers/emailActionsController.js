// controllers/email/emailActionsController.js
import Email from '../models/emailModel.js';
import CustomEmail from '../models/customEmailModel.js';
import TeamAccess from '../models/teamAccessModel.js';
import User from '../models/userModel.js';

// ==================== HELPER FUNCTIONS ====================

// Helper function to get accessible custom emails for a user
const getAccessibleCustomEmails = async (userId) => {
  const ownEmails = await CustomEmail.find({ userId, isActive: true });

  const teamAccess = await TeamAccess.find({
    userId,
    status: 'active',
    'permissions.canViewEmails': true
  });

  let accessibleEmails = [];
  for (const access of teamAccess) {
    if (access.accessibleEmails && access.accessibleEmails.length > 0) {
      const emails = await CustomEmail.find({
        _id: { $in: access.accessibleEmails },
        isActive: true
      });
      accessibleEmails.push(...emails);
    } else {
      const emails = await CustomEmail.find({
        resendConfigId: access.resendConfigId,
        isActive: true
      });
      accessibleEmails.push(...emails);
    }
  }

  const allEmails = [...ownEmails, ...accessibleEmails];
  return allEmails.filter((email, index, self) => 
    index === self.findIndex(e => e._id.toString() === email._id.toString())
  );
};

// Check if user has access to an email
const checkEmailAccess = async (userId, email) => {
  const accessibleEmails = await getAccessibleCustomEmails(userId);
  return accessibleEmails.some(e => e._id.toString() === email.customEmailId.toString());
};

// ==================== EMAIL ACTIONS ====================

/**
 * Mark email as read
 * PUT /api/email/actions/read/:emailId
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const hasAccess = await checkEmailAccess(userId, email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    email.isRead = true;
    email.status = 'read';
    email.readAt = new Date();
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email marked as read',
      data: {
        emailId: email.emailId,
        isRead: email.isRead,
        readAt: email.readAt
      }
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking email as read',
      error: error.message
    });
  }
};

/**
 * Mark email as unread
 * PUT /api/email/actions/unread/:emailId
 */
const markAsUnread = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const hasAccess = await checkEmailAccess(userId, email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    email.isRead = false;
    email.status = 'received';
    email.readAt = null;
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email marked as unread',
      data: {
        emailId: email.emailId,
        isRead: email.isRead
      }
    });

  } catch (error) {
    console.error('Mark as unread error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking email as unread',
      error: error.message
    });
  }
};

/**
 * Mark multiple emails as read (bulk operation)
 * PUT /api/email/actions/bulk/read
 */
const bulkMarkAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailIds } = req.body;

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email IDs array is required'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const accessibleEmailIds = accessibleEmails.map(e => e._id.toString());

    const result = await Email.updateMany(
      {
        emailId: { $in: emailIds },
        customEmailId: { $in: accessibleEmailIds },
        direction: 'received',
        isRead: false
      },
      {
        isRead: true,
        status: 'read',
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} emails marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking emails as read',
      error: error.message
    });
  }
};

/**
 * Star/Unstar email
 * PUT /api/email/actions/star/:emailId
 */
const toggleStar = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const hasAccess = await checkEmailAccess(userId, email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    email.isStarred = !email.isStarred;
    email.starredAt = email.isStarred ? new Date() : null;
    await email.save();

    res.status(200).json({
      success: true,
      message: email.isStarred ? 'Email starred' : 'Email unstarred',
      data: { 
        emailId: email.emailId,
        isStarred: email.isStarred,
        starredAt: email.starredAt
      }
    });

  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling star',
      error: error.message
    });
  }
};

/**
 * Archive/Unarchive email
 * PUT /api/email/actions/archive/:emailId
 */
const toggleArchive = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const hasAccess = await checkEmailAccess(userId, email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    // Cannot archive if already in trash
    if (email.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot archive an email that is in trash'
      });
    }

    email.isArchived = !email.isArchived;
    email.archivedAt = email.isArchived ? new Date() : null;
    await email.save();

    res.status(200).json({
      success: true,
      message: email.isArchived ? 'Email archived' : 'Email unarchived',
      data: { 
        emailId: email.emailId,
        isArchived: email.isArchived,
        archivedAt: email.archivedAt
      }
    });

  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling archive',
      error: error.message
    });
  }
};

/**
 * Move email to trash (soft delete)
 * DELETE /api/email/actions/trash/:emailId
 */
const deleteEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const hasAccess = await checkEmailAccess(userId, email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    // If already in trash, don't move again
    if (email.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in trash'
      });
    }

    // Move to trash
    email.isTrashed = true;
    email.trashedAt = new Date();
    
    // Remove from archive/starred if needed
    if (email.isArchived) {
      email.isArchived = false;
      email.archivedAt = null;
    }
    
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email moved to trash',
      data: {
        emailId: email.emailId,
        isTrashed: email.isTrashed,
        trashedAt: email.trashedAt
      }
    });

  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moving email to trash',
      error: error.message
    });
  }
};

/**
 * Restore email from trash back to inbox
 * PUT /api/email/actions/restore/:emailId
 */
const restoreEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const hasAccess = await checkEmailAccess(userId, email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    // Only allow restore if email is in trash
    if (!email.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'Email is not in trash'
      });
    }

    // Restore from trash
    email.isTrashed = false;
    email.restoredAt = new Date();
    email.trashedAt = null;
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email restored from trash successfully',
      data: {
        emailId: email.emailId,
        isTrashed: email.isTrashed,
        restoredAt: email.restoredAt
      }
    });

  } catch (error) {
    console.error('Restore email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring email',
      error: error.message
    });
  }
};

/**
 * Permanently delete email from trash
 * DELETE /api/email/actions/permanent/:emailId
 */
const permanentlyDeleteEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const hasAccess = await checkEmailAccess(userId, email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    // Only allow permanent deletion if email is already in trash
    if (!email.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'Email must be in trash to permanently delete'
      });
    }

    // Permanently delete
    await Email.deleteOne({ _id: email._id });

    res.status(200).json({
      success: true,
      message: 'Email permanently deleted',
      data: {
        emailId: email.emailId,
        deletedPermanently: true
      }
    });

  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting email',
      error: error.message
    });
  }
};

/**
 * Empty trash (permanently delete all trashed emails)
 * DELETE /api/email/actions/empty-trash
 */
const emptyTrash = async (req, res) => {
  try {
    const userId = req.userId;

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const accessibleEmailIds = accessibleEmails.map(e => e._id);

    const result = await Email.deleteMany({
      customEmailId: { $in: accessibleEmailIds },
      direction: 'received',
      isTrashed: true
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} emails permanently deleted from trash`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({
      success: false,
      message: 'Error emptying trash',
      error: error.message
    });
  }
};

/**
 * Bulk move emails to trash
 * POST /api/email/actions/bulk/trash
 */
const bulkMoveToTrash = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailIds } = req.body;

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email IDs array is required'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const accessibleEmailIds = accessibleEmails.map(e => e._id.toString());

    const result = await Email.updateMany(
      {
        emailId: { $in: emailIds },
        customEmailId: { $in: accessibleEmailIds },
        isTrashed: false
      },
      {
        isTrashed: true,
        trashedAt: new Date(),
        isArchived: false, // Remove from archive if moved to trash
        archivedAt: null
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} emails moved to trash`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk move to trash error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moving emails to trash',
      error: error.message
    });
  }
};

/**
 * Bulk restore emails from trash
 * POST /api/email/actions/bulk/restore
 */
const bulkRestoreFromTrash = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailIds } = req.body;

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email IDs array is required'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const accessibleEmailIds = accessibleEmails.map(e => e._id.toString());

    const result = await Email.updateMany(
      {
        emailId: { $in: emailIds },
        customEmailId: { $in: accessibleEmailIds },
        isTrashed: true
      },
      {
        isTrashed: false,
        restoredAt: new Date(),
        trashedAt: null
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} emails restored from trash`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk restore error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring emails',
      error: error.message
    });
  }
};

/**
 * Bulk star/unstar emails
 * POST /api/email/actions/bulk/star
 */
const bulkToggleStar = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailIds, starred } = req.body;

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email IDs array is required'
      });
    }

    if (starred === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Starred status is required (true/false)'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const accessibleEmailIds = accessibleEmails.map(e => e._id.toString());

    const updateData = {
      isStarred: starred,
      starredAt: starred ? new Date() : null
    };

    const result = await Email.updateMany(
      {
        emailId: { $in: emailIds },
        customEmailId: { $in: accessibleEmailIds }
      },
      updateData
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} emails ${starred ? 'starred' : 'unstarred'}`,
      data: {
        modifiedCount: result.modifiedCount,
        isStarred: starred
      }
    });

  } catch (error) {
    console.error('Bulk star error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating star status',
      error: error.message
    });
  }
};

// ==================== EXPORTS ====================

export {
  // Single email actions
  markAsRead,
  markAsUnread,
  toggleStar,
  toggleArchive,
  deleteEmail,
  restoreEmail,
  permanentlyDeleteEmail,
  
  // Bulk actions
  bulkMarkAsRead,
  bulkMoveToTrash,
  bulkRestoreFromTrash,
  bulkToggleStar,
  emptyTrash
};