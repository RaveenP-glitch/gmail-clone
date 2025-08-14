const express = require('express');
const emailController = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/emails
// @desc    Get user emails with pagination
// @access  Private
router.get('/', emailController.getEmails);

// @route   GET /api/emails/search
// @desc    Search user emails
// @access  Private
router.get('/search', emailController.searchEmails);

// @route   GET /api/emails/stats
// @desc    Get email statistics
// @access  Private
router.get('/stats', emailController.getEmailStats);

// @route   POST /api/emails/sync
// @desc    Sync emails from Gmail
// @access  Private
router.post('/sync', emailController.syncEmails);

// @route   GET /api/emails/:id
// @desc    Get email by ID
// @access  Private
router.get('/:id', emailController.getEmailById);

module.exports = router; 