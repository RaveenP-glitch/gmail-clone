const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/auth/url
// @desc    Get Google OAuth URL
// @access  Public
router.get('/url', authController.getAuthUrl);

// @route   GET /api/auth/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get('/callback', authController.handleCallback);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, authController.getProfile);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, authController.logout);

module.exports = router; 