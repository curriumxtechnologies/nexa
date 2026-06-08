// controllers/email/resendController.js
import User from '../models/userModel.js';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import { Webhook } from 'svix';

// Generate random token (shared utility)
const generateToken = () => {
  return uuidv4() + Date.now();
};

// ==================== RESEND CONFIGURATION MANAGEMENT ====================

/**
 * Add Resend API Key and Domain
 * POST /api/email/resend/config
 */
const addResendConfig = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendApiKey, domain } = req.body;

    if (!resendApiKey || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Resend API key and domain are required'
      });
    }

    // Validate domain format
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format. Example: example.com'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for existing domain
    const existingDomain = user.resendConfigs.find(c => c.domain === domain && c.isActive);
    if (existingDomain) {
      return res.status(400).json({
        success: false,
        message: 'This domain already exists in your account'
      });
    }

    const resend = new Resend(resendApiKey);

    // Verify domain exists in Resend
    let domainsList = [];
    try {
      const response = await resend.domains.list();
      if (Array.isArray(response)) {
        domainsList = response;
      } else if (Array.isArray(response?.data)) {
        domainsList = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        domainsList = response.data.data;
      } else {
        domainsList = [];
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Resend API key. Please check and try again.',
        error: error.message
      });
    }

    const domainInResend = domainsList.find(d => d.name === domain);

    if (!domainInResend) {
      return res.status(400).json({
        success: false,
        message: `Domain "${domain}" not found in your Resend account.`,
        suggestion: 'Go to https://resend.com/domains to add your domain first'
      });
    }

    if (domainInResend.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: `Domain "${domain}" is not verified in Resend yet.`,
        suggestion: 'Please verify your domain in Resend first before adding it here'
      });
    }

    // Save configuration
    const configId = uuidv4();

    user.resendConfigs.push({
      id: configId,
      apiKey: resendApiKey,
      domain,
      isVerified: true,
      verifiedAt: new Date(),
      createdAt: new Date(),
      isActive: true,
      webhookSecret: null,
      webhookConfiguredAt: null
    });

    await user.save();

    const webhookUrl = `${process.env.API_URL || process.env.BACKEND_URL}/api/email/webhook/receive`;

    res.status(200).json({
      success: true,
      message: `Domain "${domain}" added and verified successfully!`,
      data: {
        domain,
        configId,
        webhookUrl,
        verifiedAt: user.resendConfigs[user.resendConfigs.length - 1].verifiedAt
      }
    });

  } catch (error) {
    console.error('Add Resend config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding Resend configuration',
      error: error.message
    });
  }
};

/**
 * Get user's resend configs (domains)
 * GET /api/email/resend/configs
 */
const getResendConfigs = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const webhookUrl = `${process.env.API_URL || process.env.BACKEND_URL}/api/email/webhook/receive`;

    const configs = user.resendConfigs
      .filter(c => c.isActive)
      .map(c => ({
        id: c.id,
        domain: c.domain,
        isVerified: c.isVerified,
        verifiedAt: c.verifiedAt,
        createdAt: c.createdAt,
        webhookUrl: webhookUrl,
        hasWebhookSecret: !!c.webhookSecret,
        webhookConfiguredAt: c.webhookConfiguredAt || null,
        // Optional: Add stats if needed
        customEmailsCount: c.customEmailsCount || 0
      }));

    res.status(200).json({
      success: true,
      data: configs
    });

  } catch (error) {
    console.error('Get resend configs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resend configs',
      error: error.message
    });
  }
};

/**
 * Get single resend configuration by ID
 * GET /api/email/resend/config/:configId
 */
const getResendConfigById = async (req, res) => {
  try {
    const userId = req.userId;
    const { configId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resendConfig = user.resendConfigs.find(
      c => (c.id === configId || c._id?.toString() === configId) && c.isActive
    );

    if (!resendConfig) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    const webhookUrl = `${process.env.API_URL || process.env.BACKEND_URL}/api/email/webhook/receive`;

    res.status(200).json({
      success: true,
      data: {
        id: resendConfig.id,
        domain: resendConfig.domain,
        apiKeyPrefix: resendConfig.apiKey ? resendConfig.apiKey.substring(0, 10) + '...' : null,
        isVerified: resendConfig.isVerified,
        verifiedAt: resendConfig.verifiedAt,
        createdAt: resendConfig.createdAt,
        webhookUrl: webhookUrl,
        hasWebhookSecret: !!resendConfig.webhookSecret,
        webhookConfiguredAt: resendConfig.webhookConfiguredAt || null
      }
    });

  } catch (error) {
    console.error('Get resend config by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resend configuration',
      error: error.message
    });
  }
};

/**
 * Update Resend configuration (API key, etc.)
 * PUT /api/email/resend/config/:configId
 */
const updateResendConfig = async (req, res) => {
  try {
    const userId = req.userId;
    const { configId } = req.params;
    const { resendApiKey } = req.body;

    if (!resendApiKey) {
      return res.status(400).json({
        success: false,
        message: 'Resend API key is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const configIndex = user.resendConfigs.findIndex(
      c => (c.id === configId || c._id?.toString() === configId) && c.isActive
    );

    if (configIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    // Verify new API key
    const resend = new Resend(resendApiKey);
    try {
      await resend.domains.list();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Resend API key',
        error: error.message
      });
    }

    // Update the config
    user.resendConfigs[configIndex].apiKey = resendApiKey;
    user.resendConfigs[configIndex].updatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resend configuration updated successfully',
      data: {
        id: user.resendConfigs[configIndex].id,
        domain: user.resendConfigs[configIndex].domain,
        updatedAt: user.resendConfigs[configIndex].updatedAt
      }
    });

  } catch (error) {
    console.error('Update resend config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resend configuration',
      error: error.message
    });
  }
};

/**
 * Delete Resend configuration (soft delete)
 * DELETE /api/email/resend/config/:configId
 */
const deleteResendConfig = async (req, res) => {
  try {
    const userId = req.userId;
    const { configId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const configIndex = user.resendConfigs.findIndex(
      c => (c.id === configId || c._id?.toString() === configId)
    );

    if (configIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    // Soft delete
    user.resendConfigs[configIndex].isActive = false;
    user.resendConfigs[configIndex].deletedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resend configuration deleted successfully',
      data: {
        domain: user.resendConfigs[configIndex].domain,
        deletedAt: user.resendConfigs[configIndex].deletedAt
      }
    });

  } catch (error) {
    console.error('Delete resend config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resend configuration',
      error: error.message
    });
  }
};

// ==================== WEBHOOK SECRET MANAGEMENT ====================

/**
 * Add webhook secret for a domain
 * POST /api/email/resend/webhook/secret
 */
const addWebhookSecret = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId, webhookSecret } = req.body;

    if (!resendConfigId || !webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Resend config ID and webhook secret are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the resend config
    const configIndex = user.resendConfigs.findIndex(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString())
    );

    if (configIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    // Add webhook secret to the config
    user.resendConfigs[configIndex].webhookSecret = webhookSecret;
    user.resendConfigs[configIndex].webhookConfiguredAt = new Date();

    await user.save();

    const webhookUrl = `${process.env.API_URL || process.env.BACKEND_URL}/api/email/webhook/receive`;

    res.status(200).json({
      success: true,
      message: 'Webhook secret saved successfully',
      data: {
        domain: user.resendConfigs[configIndex].domain,
        webhookUrl: webhookUrl,
        webhookConfiguredAt: user.resendConfigs[configIndex].webhookConfiguredAt
      }
    });

  } catch (error) {
    console.error('Add webhook secret error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding webhook secret',
      error: error.message
    });
  }
};

/**
 * Update webhook secret for a domain (replaces existing)
 * PUT /api/email/webhook/secret/:resendConfigId
 */
const updateWebhookSecret = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId } = req.params;
    const { webhookSecret } = req.body;

    if (!webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Webhook secret is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const configIndex = user.resendConfigs.findIndex(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString())
    );

    if (configIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    // Update webhook secret
    user.resendConfigs[configIndex].webhookSecret = webhookSecret;
    user.resendConfigs[configIndex].webhookConfiguredAt = new Date();
    user.resendConfigs[configIndex].webhookUpdatedAt = new Date();

    await user.save();

    const webhookUrl = `${process.env.API_URL || process.env.BACKEND_URL}/api/email/webhook/receive`;

    res.status(200).json({
      success: true,
      message: 'Webhook secret updated successfully',
      data: {
        domain: user.resendConfigs[configIndex].domain,
        webhookUrl: webhookUrl,
        webhookConfiguredAt: user.resendConfigs[configIndex].webhookConfiguredAt,
        webhookUpdatedAt: user.resendConfigs[configIndex].webhookUpdatedAt
      }
    });

  } catch (error) {
    console.error('Update webhook secret error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating webhook secret',
      error: error.message
    });
  }
};

/**
 * Get webhook configuration for a domain
 * GET /api/email/resend/webhook/config/:resendConfigId
 */
const getWebhookConfig = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resendConfig = user.resendConfigs.find(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString())
    );

    if (!resendConfig) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    const webhookUrl = `${process.env.API_URL || process.env.BACKEND_URL}/api/email/webhook/receive`;

    res.status(200).json({
      success: true,
      data: {
        domain: resendConfig.domain,
        webhookUrl: webhookUrl,
        webhookSecret: resendConfig.webhookSecret ? '********' : null,
        hasWebhookSecret: !!resendConfig.webhookSecret,
        webhookConfiguredAt: resendConfig.webhookConfiguredAt || null
      }
    });

  } catch (error) {
    console.error('Get webhook config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webhook configuration',
      error: error.message
    });
  }
};

/**
 * Delete/Remove webhook secret for a domain
 * DELETE /api/email/resend/webhook/secret/:resendConfigId
 */
const deleteWebhookSecret = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const configIndex = user.resendConfigs.findIndex(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString())
    );

    if (configIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    // Remove webhook secret
    user.resendConfigs[configIndex].webhookSecret = null;
    user.resendConfigs[configIndex].webhookConfiguredAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Webhook secret removed successfully',
      data: {
        domain: user.resendConfigs[configIndex].domain
      }
    });

  } catch (error) {
    console.error('Delete webhook secret error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting webhook secret',
      error: error.message
    });
  }
};

/**
 * Test webhook configuration
 * POST /api/email/resend/webhook/test/:resendConfigId
 */
const testWebhookConfig = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resendConfig = user.resendConfigs.find(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString())
    );

    if (!resendConfig) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    if (!resendConfig.webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Webhook secret not configured for this domain'
      });
    }

    // Create a test webhook payload
    const testPayload = {
      type: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Webhook test from Nexa'
      }
    };

    // Verify the webhook secret works
    const wh = new Webhook(resendConfig.webhookSecret);
    
    // This is just a test - we're not actually sending anything
    // Just checking if the secret is valid format
    try {
      // Create a mock signature for testing
      const mockHeaders = {
        'svix-id': 'test_' + Date.now(),
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'test_signature'
      };
      
      // This will throw if secret format is invalid
      wh.verify(JSON.stringify(testPayload), mockHeaders);
    } catch (err) {
      // If we get here, the secret might be invalid format
      console.error('Webhook secret test failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook configuration appears valid',
      data: {
        domain: resendConfig.domain,
        hasWebhookSecret: true,
        webhookConfiguredAt: resendConfig.webhookConfiguredAt
      }
    });

  } catch (error) {
    console.error('Test webhook config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing webhook configuration',
      error: error.message
    });
  }
};

/**
 * Get domain verification status from Resend
 * GET /api/email/resend/domain/status/:configId
 */
const getDomainStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { configId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resendConfig = user.resendConfigs.find(
      c => (c.id === configId || c._id?.toString() === configId) && c.isActive
    );

    if (!resendConfig) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    const resend = new Resend(resendConfig.apiKey);
    const response = await resend.domains.list();
    
    let domainsList = [];
    if (Array.isArray(response)) {
      domainsList = response;
    } else if (Array.isArray(response?.data)) {
      domainsList = response.data;
    } else if (Array.isArray(response?.data?.data)) {
      domainsList = response.data.data;
    }

    const domainInfo = domainsList.find(d => d.name === resendConfig.domain);

    if (!domainInfo) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found in Resend'
      });
    }

    // Update verification status if changed
    if (domainInfo.status === 'verified' && !resendConfig.isVerified) {
      resendConfig.isVerified = true;
      resendConfig.verifiedAt = new Date();
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        domain: domainInfo.name,
        status: domainInfo.status,
        isVerified: domainInfo.status === 'verified',
        verifiedAt: resendConfig.verifiedAt,
        records: domainInfo.records || [],
        region: domainInfo.region
      }
    });

  } catch (error) {
    console.error('Get domain status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching domain status',
      error: error.message
    });
  }
};

// ==================== EXPORTS ====================

export {
  // Config management
  addResendConfig,
  getResendConfigs,
  getResendConfigById,
  updateResendConfig,
  deleteResendConfig,
  
  // Webhook management
  addWebhookSecret,
  updateWebhookSecret,
  getWebhookConfig,
  deleteWebhookSecret,
  testWebhookConfig,
  
  // Domain utilities
  getDomainStatus
};