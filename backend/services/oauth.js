const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class OAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.readonly',
    ];
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent',
    });
  }

  async handleCallback(code) {
    try {
      const response = await this.oauth2Client.getToken(code);
      const tokens = response.tokens;
      this.oauth2Client.setCredentials(tokens);

      // Get user info
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      // Save or update user in database
      const [user, created] = await User.findOrCreate({
        where: { googleId: userInfo.id },
        defaults: {
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });

      if (!created) {
        // Update existing user tokens
        await user.update({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || user.refreshToken,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          name: userInfo.name,
          picture: userInfo.picture,
        });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Note: Auto-sync will be handled by the frontend after login
      // to avoid circular dependency issues

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
        token: jwtToken,
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Authentication failed');
    }
  }

  async refreshAccessToken(user) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: user.refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      await user.update({
        accessToken: credentials.access_token,
        tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      });

      return credentials.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  async getValidAccessToken(user) {
    const now = new Date();
    const tokenExpiry = new Date(user.tokenExpiry);

    if (tokenExpiry > now) {
      return user.accessToken;
    }

    return await this.refreshAccessToken(user);
  }
}

module.exports = new OAuthService(); 