// controllers/adminController.js
import User from '../models/userModel.js';
import Email from '../models/emailModel.js';
import CustomEmail from '../models/customEmailModel.js';
import TeamAccess from '../models/teamAccessModel.js';
import AppVersion from '../models/appVersionModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== HELPER FUNCTIONS ====================

// Check if user is admin or super admin
const isAdmin = (user) => {
  return user.role === 'admin' || user.role === 'super_admin';
};

// Check if user is super admin
const isSuperAdmin = (user) => {
  return user.role === 'super_admin';
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users (admin & super_admin only)
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -otp -twoFactorOTP -resetPasswordOTP -pushTokens')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Get single user by ID (admin & super_admin only)
 * GET /api/admin/users/:userId
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId: targetUserId } = req.params;
    const targetUser = await User.findById(targetUserId)
      .select('-password -otp -twoFactorOTP -resetPasswordOTP -pushTokens');

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: targetUser
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Get all admins (super_admin only)
 * GET /api/admin/admins
 */
const getAdmins = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isSuperAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    const admins = await User.find({ 
      role: { $in: ['admin', 'super_admin'] } 
    }).select('-password -otp -twoFactorOTP -resetPasswordOTP -pushTokens');

    res.status(200).json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

/**
 * Assign role to user (super_admin only)
 * PUT /api/admin/users/:userId/role
 */
const assignRole = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isSuperAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    const { userId: targetUserId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required: user, admin, or super_admin'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-demotion from super_admin
    if (targetUserId === userId && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote yourself from super admin'
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });

  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning role',
      error: error.message
    });
  }
};

/**
 * Delete user (admin & super_admin only)
 * DELETE /api/admin/users/:userId
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId: targetUserId } = req.params;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (targetUserId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account. Use account deletion endpoint.'
      });
    }

    // Only super_admin can delete other admins
    if (targetUser.role === 'admin' && !isSuperAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can delete other admin accounts'
      });
    }

    // Delete user's associated data
    await Email.deleteMany({ userId: targetUserId });
    await CustomEmail.deleteMany({ userId: targetUserId });
    await TeamAccess.deleteMany({ 
      $or: [{ ownerId: targetUserId }, { userId: targetUserId }]
    });
    await User.findByIdAndDelete(targetUserId);

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// ==================== EMAIL STATISTICS ====================

/**
 * Get email statistics for all users (admin & super_admin only)
 * GET /api/admin/stats/emails
 */
const getEmailStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all emails stats
    const totalEmailsSent = await Email.countDocuments({ 
      direction: 'sent',
      ...dateFilter
    });
    
    const totalEmailsReceived = await Email.countDocuments({ 
      direction: 'received',
      ...dateFilter
    });
    
    // Get stats per user
    const userEmailStats = await Email.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: '$userId',
          sent: { $sum: { $cond: [{ $eq: ['$direction', 'sent'] }, 1, 0] } },
          received: { $sum: { $cond: [{ $eq: ['$direction', 'received'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          user: { $arrayElemAt: ['$user', 0] },
          sent: 1,
          received: 1,
          total: { $add: ['$sent', '$received'] }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get daily stats for chart
    const dailyStats = await Email.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            direction: '$direction'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          sent: {
            $sum: {
              $cond: [{ $eq: ['$_id.direction', 'sent'] }, '$count', 0]
            }
          },
          received: {
            $sum: {
              $cond: [{ $eq: ['$_id.direction', 'received'] }, '$count', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get domain stats
    const domainStats = await CustomEmail.aggregate([
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          domain: '$_id',
          customEmailsCount: '$count',
          uniqueUsers: { $size: '$users' }
        }
      },
      { $sort: { customEmailsCount: -1 } }
    ]);

    // Get total users count
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEmailsSent,
          totalEmailsReceived,
          totalEmails: totalEmailsSent + totalEmailsReceived,
          totalUsers,
          activeUsers,
          domainsCount: domainStats.length
        },
        userStats: userEmailStats.map(stat => ({
          userId: stat.user?._id,
          name: stat.user?.name,
          email: stat.user?.email,
          sent: stat.sent,
          received: stat.received,
          total: stat.total
        })),
        dailyStats: dailyStats.map(day => ({
          date: day._id,
          sent: day.sent,
          received: day.received
        })),
        domainStats
      }
    });

  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email statistics',
      error: error.message
    });
  }
};

// ==================== APP VERSION MANAGEMENT ====================

/**
 * Upload new app version (APK/AAB) - admin & super_admin only
 * POST /api/admin/app/upload
 */
const uploadApp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { version, releaseNotes, isRequired = false, platform = 'android' } = req.body;

    if (!version || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Version number and APK file are required'
      });
    }

    // Check if version already exists
    const existingVersion = await AppVersion.findOne({ version, platform });
    if (existingVersion) {
      return res.status(400).json({
        success: false,
        message: `Version ${version} already exists for ${platform}`
      });
    }

    const appVersion = new AppVersion({
      version,
      releaseNotes: releaseNotes || '',
      fileUrl: req.file.path,
      fileSize: req.file.size,
      fileName: req.file.originalname,
      filePublicId: req.file.filename,
      isRequired,
      platform,
      uploadedBy: userId,
      isActive: true
    });

    await appVersion.save();

    res.status(201).json({
      success: true,
      message: 'App version uploaded successfully',
      data: {
        id: appVersion._id,
        version: appVersion.version,
        platform: appVersion.platform,
        fileSize: appVersion.fileSize,
        createdAt: appVersion.createdAt
      }
    });

  } catch (error) {
    console.error('Upload app error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading app',
      error: error.message
    });
  }
};

/**
 * Update existing app version - admin & super_admin only
 * PUT /api/admin/app/update/:versionId
 */
const updateApp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { versionId } = req.params;
    const { version, releaseNotes, isRequired, isActive } = req.body;

    const appVersion = await AppVersion.findById(versionId);
    if (!appVersion) {
      return res.status(404).json({
        success: false,
        message: 'App version not found'
      });
    }

    if (version) appVersion.version = version;
    if (releaseNotes !== undefined) appVersion.releaseNotes = releaseNotes;
    if (isRequired !== undefined) appVersion.isRequired = isRequired;
    if (isActive !== undefined) appVersion.isActive = isActive;
    
    appVersion.updatedAt = new Date();
    await appVersion.save();

    res.status(200).json({
      success: true,
      message: 'App version updated successfully',
      data: appVersion
    });

  } catch (error) {
    console.error('Update app error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating app',
      error: error.message
    });
  }
};

/**
 * Delete app version - admin & super_admin only
 * DELETE /api/admin/app/delete/:versionId
 */
const deleteApp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { versionId } = req.params;

    const appVersion = await AppVersion.findById(versionId);
    if (!appVersion) {
      return res.status(404).json({
        success: false,
        message: 'App version not found'
      });
    }

    // Delete file from Cloudinary if it exists
    if (appVersion.filePublicId) {
      try {
        const cloudinary = (await import('cloudinary')).v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        await cloudinary.uploader.destroy(appVersion.filePublicId);
      } catch (err) {
        console.error('Failed to delete file from Cloudinary:', err);
      }
    }

    await AppVersion.findByIdAndDelete(versionId);

    res.status(200).json({
      success: true,
      message: 'App version deleted successfully'
    });

  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting app',
      error: error.message
    });
  }
};

/**
 * Get all app versions - public (for app update check)
 * GET /api/admin/app/versions
 */
const getAppVersions = async (req, res) => {
  try {
    const { platform = 'android' } = req.query;
    
    const versions = await AppVersion.find({ 
      platform, 
      isActive: true 
    }).sort({ createdAt: -1 });

    const latestVersion = versions[0] || null;

    res.status(200).json({
      success: true,
      data: {
        versions,
        latestVersion: latestVersion ? {
          version: latestVersion.version,
          releaseNotes: latestVersion.releaseNotes,
          fileUrl: latestVersion.fileUrl,
          fileSize: latestVersion.fileSize,
          isRequired: latestVersion.isRequired,
          releasedAt: latestVersion.createdAt
        } : null
      }
    });

  } catch (error) {
    console.error('Get app versions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching app versions',
      error: error.message
    });
  }
};

// ==================== EXPORTS ====================

export {
  // User management
  getUsers,
  getUserById,
  getAdmins,
  assignRole,
  deleteUser,
  
  // Email statistics
  getEmailStats,
  
  // App management
  uploadApp,
  updateApp,
  deleteApp,
  getAppVersions
};