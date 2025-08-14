const { google } = require('googleapis');
const { User, Email } = require('../models');

class GmailService {
  async getGmailClient(user) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Check if token is still valid
    const now = new Date();
    const tokenExpiry = user.tokenExpiry ? new Date(user.tokenExpiry) : null;
    
    let accessToken = user.accessToken;
    
    // If token is expired or about to expire, refresh it
    if (!tokenExpiry || tokenExpiry <= now) {
      try {
        oauth2Client.setCredentials({
          refresh_token: user.refreshToken,
        });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        accessToken = credentials.access_token;
        
        // Update user with new token
        await user.update({
          accessToken: credentials.access_token,
          tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        });
      } catch (error) {
        console.error('Token refresh error:', error);
        throw new Error('Failed to refresh access token');
      }
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: user.refreshToken,
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async fetchEmails(userId, options = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const gmail = await this.getGmailClient(user);
      const {
        maxResults = 20,
        pageToken = null,
        query = '',
      } = options;

      // Fetch message list
      const listParams = {
        userId: 'me',
        maxResults,
        q: query,
      };

      if (pageToken) {
        listParams.pageToken = pageToken;
      }

      const { data: messageList } = await gmail.users.messages.list(listParams);

      if (!messageList.messages) {
        return {
          emails: [],
          nextPageToken: null,
          totalResults: 0,
        };
      }

      // Fetch detailed message data
      const emailPromises = messageList.messages.map(async (message) => {
        try {
          const { data: messageData } = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });

          return this.parseGmailMessage(messageData, userId);
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error);
          return null;
        }
      });

      const emails = (await Promise.all(emailPromises)).filter(Boolean);

      // Save emails to database
      await this.saveEmailsToDatabase(emails);

      // Update user's last sync time
      await user.update({ lastSync: new Date() });

      return {
        emails,
        nextPageToken: messageList.nextPageToken || null,
        totalResults: messageList.resultSizeEstimate || 0,
      };
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails');
    }
  }

  parseGmailMessage(messageData, userId) {
    const headers = messageData.payload.headers || [];
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Parse email addresses
    const parseEmailAddresses = (addressString) => {
      if (!addressString) return [];
      return addressString.split(',').map(addr => addr.trim());
    };

    // Extract body content
    const extractBody = (payload) => {
      let textBody = '';
      let htmlBody = '';

      const extractFromPart = (part) => {
        if (part.mimeType === 'text/plain' && part.body.data) {
          textBody = Buffer.from(part.body.data, 'base64').toString();
        } else if (part.mimeType === 'text/html' && part.body.data) {
          htmlBody = Buffer.from(part.body.data, 'base64').toString();
        } else if (part.parts) {
          part.parts.forEach(extractFromPart);
        }
      };

      if (payload.parts) {
        payload.parts.forEach(extractFromPart);
      } else if (payload.body.data) {
        if (payload.mimeType === 'text/plain') {
          textBody = Buffer.from(payload.body.data, 'base64').toString();
        } else if (payload.mimeType === 'text/html') {
          htmlBody = Buffer.from(payload.body.data, 'base64').toString();
        }
      }

      return { textBody, htmlBody };
    };

    const { textBody, htmlBody } = extractBody(messageData.payload);

    // Extract attachments
    const extractAttachments = (payload) => {
      const attachments = [];
      
      const extractFromPart = (part) => {
        if (part.filename && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId,
          });
        } else if (part.parts) {
          part.parts.forEach(extractFromPart);
        }
      };

      if (payload.parts) {
        payload.parts.forEach(extractFromPart);
      }

      return attachments;
    };

    const attachments = extractAttachments(messageData.payload);

    return {
      userId,
      messageId: getHeader('Message-ID'),
      gmailId: messageData.id,
      threadId: messageData.threadId,
      subject: getHeader('Subject'),
      fromName: this.extractNameFromEmail(getHeader('From')),
      fromEmail: this.extractEmailFromString(getHeader('From')),
      toEmails: parseEmailAddresses(getHeader('To')),
      ccEmails: parseEmailAddresses(getHeader('Cc')),
      bccEmails: parseEmailAddresses(getHeader('Bcc')),
      date: new Date(parseInt(messageData.internalDate)),
      bodyText: textBody,
      bodyHtml: htmlBody,
      attachments,
      labels: messageData.labelIds || [],
      isRead: !messageData.labelIds?.includes('UNREAD'),
      isStarred: messageData.labelIds?.includes('STARRED'),
      isImportant: messageData.labelIds?.includes('IMPORTANT'),
      snippet: messageData.snippet || '',
    };
  }

  extractNameFromEmail(emailString) {
    if (!emailString) return '';
    const match = emailString.match(/^(.+?)\s*<.+>$/);
    return match ? match[1].replace(/"/g, '').trim() : '';
  }

  extractEmailFromString(emailString) {
    if (!emailString) return '';
    const match = emailString.match(/<(.+?)>$/);
    return match ? match[1] : emailString.trim();
  }

  async saveEmailsToDatabase(emails) {
    try {
      for (const emailData of emails) {
        await Email.findOrCreate({
          where: {
            userId: emailData.userId,
            gmailId: emailData.gmailId,
          },
          defaults: emailData,
        });
      }
    } catch (error) {
      console.error('Error saving emails to database:', error);
    }
  }

  async searchEmails(userId, searchQuery, options = {}) {
    const { maxResults = 20, pageToken = null } = options;
    
    return await this.fetchEmails(userId, {
      maxResults,
      pageToken,
      query: searchQuery,
    });
  }

  async getEmailById(userId, emailId) {
    try {
      const email = await Email.findOne({
        where: {
          userId,
          id: emailId,
        },
      });

      return email;
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      throw new Error('Failed to fetch email');
    }
  }
}

module.exports = new GmailService(); 