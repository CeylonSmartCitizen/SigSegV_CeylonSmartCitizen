const jwt = require('jsonwebtoken');

class JWTUtils {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'hackathon-super-secure-jwt-secret-key-2025';
    this.accessTokenExpiry = '24h'; // 24 hours for development
    this.refreshTokenExpiry = '7d'; // 7 days for refresh token
  }

  /**
   * Generate access token with user payload
   * @param {Object} user - User object with id, email, role
   * @returns {string} JWT token
   */
  generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role || 'citizen',
      firstName: user.first_name,
      lastName: user.last_name,
      nicNumber: user.nic_number,
      type: 'access'
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'ceylon-smart-citizen',
      audience: 'ceylon-citizens'
    });
  }

  /**
   * Generate refresh token for extended sessions
   * @param {Object} user - User object
   * @returns {string} Refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'ceylon-smart-citizen',
      audience: 'ceylon-citizens'
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object containing both tokens
   */
  generateTokens(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      tokenType: 'Bearer',
      expiresIn: 86400 // 24 hours in seconds
    };
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'ceylon-smart-citizen',
        audience: 'ceylon-citizens'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for checking payload)
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null if not found
   */
  extractTokenFromHeader(authHeader) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

module.exports = new JWTUtils();
