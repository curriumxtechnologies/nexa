import User from '../models/userModel.js';

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('settings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return settings with defaults if not exist
    const settings = user.settings || {
      appearance: {
        darkMode: false,
        language: 'en',
        compactView: false
      },
      email: {
        signature: '',
        autoSave: true,
        confirmBeforeSend: true,
        replyAboveQuote: true,
        showPreviewPane: true
      },
      privacy: {
        readReceipts: false,
        trackOpens: false
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { appearance, email, privacy } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize settings if not exists
    if (!user.settings) {
      user.settings = {};
    }

    // Update appearance settings
    if (appearance) {
      user.settings.appearance = {
        ...user.settings.appearance,
        ...appearance
      };
    }

    // Update email settings
    if (email) {
      user.settings.email = {
        ...user.settings.email,
        ...email
      };
    }

    // Update privacy settings
    if (privacy) {
      user.settings.privacy = {
        ...user.settings.privacy,
        ...privacy
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: user.settings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// Update email signature
const updateEmailSignature = async (req, res) => {
  try {
    const userId = req.userId;
    const { signature } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.settings) {
      user.settings = {};
    }
    if (!user.settings.email) {
      user.settings.email = {};
    }

    user.settings.email.signature = signature;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email signature updated',
      data: { signature }
    });

  } catch (error) {
    console.error('Update email signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email signature',
      error: error.message
    });
  }
};

// Toggle dark mode
const toggleDarkMode = async (req, res) => {
  try {
    const userId = req.userId;
    const { darkMode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.settings) {
      user.settings = {};
    }
    if (!user.settings.appearance) {
      user.settings.appearance = {};
    }

    user.settings.appearance.darkMode = darkMode;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Dark mode ${darkMode ? 'enabled' : 'disabled'}`,
      data: { darkMode }
    });

  } catch (error) {
    console.error('Toggle dark mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling dark mode',
      error: error.message
    });
  }
};

// Export all controllers
export {
  getSettings,
  updateSettings,
  updateEmailSignature,
  toggleDarkMode
};