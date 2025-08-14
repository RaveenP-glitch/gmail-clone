const { body, validationResult } = require('express-validator');
const gmailService = require('../services/gmail');
const { Email } = require('../models');

class EmailController {
  async getEmails(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        search = '',
        pageToken = null,
      } = req.query;

      const maxResults = Math.min(parseInt(limit), 50); // Cap at 50
      
      const result = await gmailService.fetchEmails(userId, {
        maxResults,
        pageToken,
        query: search,
      });

      res.json({
        success: true,
        data: {
          emails: result.emails,
          pagination: {
            currentPage: parseInt(page),
            limit: maxResults,
            nextPageToken: result.nextPageToken,
            totalResults: result.totalResults,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch emails' 
      });
    }
  }

  async getEmailById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const email = await gmailService.getEmailById(userId, id);
      
      if (!email) {
        return res.status(404).json({ 
          success: false,
          error: 'Email not found' 
        });
      }

      res.json({
        success: true,
        data: email,
      });
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch email' 
      });
    }
  }

  async searchEmails(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const {
        q: searchQuery,
        limit = 20,
        pageToken = null,
      } = req.query;

      if (!searchQuery) {
        return res.status(400).json({ 
          success: false,
          error: 'Search query is required' 
        });
      }

      const maxResults = Math.min(parseInt(limit), 50);
      
      const result = await gmailService.searchEmails(userId, searchQuery, {
        maxResults,
        pageToken,
      });

      res.json({
        success: true,
        data: {
          emails: result.emails,
          searchQuery,
          pagination: {
            limit: maxResults,
            nextPageToken: result.nextPageToken,
            totalResults: result.totalResults,
          },
        },
      });
    } catch (error) {
      console.error('Error searching emails:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to search emails' 
      });
    }
  }

  async syncEmails(req, res) {
    try {
      const userId = req.user.id;
      
      // Trigger email sync
      const result = await gmailService.fetchEmails(userId, {
        maxResults: 50, // Sync more emails
      });

      res.json({
        success: true,
        message: 'Email sync completed',
        data: {
          syncedCount: result.emails.length,
          lastSync: new Date(),
        },
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to sync emails' 
      });
    }
  }

  async getEmailStats(req, res) {
    try {
      const userId = req.user.id;
      
      const stats = await Email.findAll({
        where: { userId },
        attributes: [
          [Email.sequelize.fn('COUNT', Email.sequelize.col('id')), 'totalEmails'],
          [Email.sequelize.fn('SUM', Email.sequelize.literal('CASE WHEN isRead = false THEN 1 ELSE 0 END')), 'unreadCount'],
          [Email.sequelize.fn('SUM', Email.sequelize.literal('CASE WHEN isStarred = true THEN 1 ELSE 0 END')), 'starredCount'],
          [Email.sequelize.fn('SUM', Email.sequelize.literal('CASE WHEN isImportant = true THEN 1 ELSE 0 END')), 'importantCount'],
        ],
        raw: true,
      });

      res.json({
        success: true,
        data: stats[0] || {
          totalEmails: 0,
          unreadCount: 0,
          starredCount: 0,
          importantCount: 0,
        },
      });
    } catch (error) {
      console.error('Error fetching email stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch email statistics' 
      });
    }
  }

  // Validation rules
  static getValidationRules() {
    return {
      getEmails: [
        body('page').optional().isInt({ min: 1 }),
        body('limit').optional().isInt({ min: 1, max: 50 }),
      ],
      searchEmails: [
        body('q').notEmpty().withMessage('Search query is required'),
        body('limit').optional().isInt({ min: 1, max: 50 }),
      ],
    };
  }
}

module.exports = new EmailController(); 