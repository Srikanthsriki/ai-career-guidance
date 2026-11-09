const db = require('../database/dbEngine');
const { isDbConnected } = require('../config/db');
const User = require('../models/User');
const store = require('../models/store');

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Student Registration / Sign-in (Passwordless: Name + Gmail)
 */
exports.register = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Gmail / Email address is required."
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = name ? String(name).trim() : cleanEmail.split('@')[0];

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid Gmail/Email address (e.g., student@gmail.com)."
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Please enter your name (minimum 2 characters)."
      });
    }

    // Check if user already exists
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ email: cleanEmail });
      if (user) {
        if (cleanName && user.name !== cleanName) {
          user.name = cleanName;
          await user.save();
        }
      } else {
        user = await User.create({
          name: cleanName,
          email: cleanEmail,
          role: 'student'
        });
      }
    } else {
      user = db.findOne('users', u => u.email === cleanEmail);
      if (user) {
        if (cleanName && user.name !== cleanName) {
          db.updateById('users', user._id, { name: cleanName });
          user.name = cleanName;
        }
      } else {
        user = db.insert('users', {
          name: cleanName,
          email: cleanEmail,
          role: 'student'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}!`,
      user: { _id: user._id, name: user.name, email: user.email, role: 'student' }
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ success: false, error: "Failed to sign in student." });
  }
};

/**
 * Student Login (Passwordless: Name + Gmail)
 */
exports.login = async (req, res) => {
  // Seamlessly delegate to register / authenticate
  return exports.register(req, res);
};

/**
 * Get current session user
 */
exports.getMe = (req, res) => {
  try {
    const allUsers = db.find('users');
    const latestUser = allUsers[allUsers.length - 1] || null;
    if (!latestUser) {
      return res.status(200).json({ success: true, user: null });
    }
    return res.status(200).json({
      success: true,
      user: {
        _id: latestUser._id,
        name: latestUser.name,
        email: latestUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
