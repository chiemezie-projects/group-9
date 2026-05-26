/**
 * Authentication Routes
 * 
 * Handles user registration, login, logout, and session checks.
 * 
 * POST /api/register  - Create a new user account
 * POST /api/login     - Login with email and password
 * POST /api/logout    - Destroy the current session
 * GET  /api/me        - Get current logged-in user info
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

/**
 * Register a new user
 * Expects: { name, email, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Create new user (password is hashed in the pre-save hook)
    const user = new User({
      name,
      email,
      passwordHash: password
    });

    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.userName = user.name;

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * Login an existing user
 * Expects: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user._id;
    req.session.userName = user.name;

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * Logout the current user
 * Destroys the session
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

/**
 * Get current user info
 * Protected route - requires authentication
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
