const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async register(userData) {
    const { user_id, email, password, name, birthdate, gender, phone_number } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        $or: [{ email }, { user_id }]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or user_id already exists');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Create user
    const user = await User.create({
      user_id,
      email,
      password_hash,
      name,
      birthdate,
      gender,
      phone_number
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Update last login
    await user.update({ last_login: new Date() });

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return {
      user: userResponse,
      ...tokens
    };
  }

  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValidPassword = await this.comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Update last login
    await user.update({ last_login: new Date() });

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return {
      user: userResponse,
      ...tokens
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const tokens = this.generateTokens(user.id);
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = AuthService;