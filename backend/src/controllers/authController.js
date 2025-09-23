const AuthService = require('../services/authService');
const { log } = require('../config/logger');

class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      log.error('Register error:', { error: error.message, stack: error.stack });

      // Handle specific errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async login(req, res) {
    try {
      const { user_id, password } = req.body;
      const result = await AuthService.login(user_id, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      log.error('Login error:', { error: error.message, stack: error.stack });

      if (error.message.includes('Invalid user_id or password')) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      log.error('Refresh token error:', { error: error.message, stack: error.stack });

      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.id);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      log.error('Get profile error:', { error: error.message, stack: error.stack });

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async logout(req, res) {
    // For JWT, logout is mainly handled on the client side
    // In a more sophisticated setup, you might want to blacklist tokens
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
}

module.exports = AuthController;