const oauthService = require('../services/oauth');

class AuthController {
  async getAuthUrl(req, res) {
    try {
      const authUrl = oauthService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error('Error getting auth URL:', error);
      res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  }

  async handleCallback(req, res) {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      const result = await oauthService.handleCallback(code);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          preferences: user.preferences,
          lastSync: user.lastSync,
        },
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  }

  async logout(req, res) {
    try {
      // In a real app, you might want to invalidate the refresh token
      // For now, just return success (client will remove JWT token)
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  }
}

module.exports = new AuthController(); 