const jwtUtils = require('../utils/jwt');
const db = require('../config/database');
const TokenBlacklist = require('../utils/tokenBlacklist');

/**
 * Middleware for JWT token validation on protected routes
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    // Verify the token
    const decoded = jwtUtils.verifyToken(token);

    // Check if token is access token (not refresh token)
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated',
        code: 'TOKEN_BLACKLISTED'
      });
    }

    // Check if user has been globally logged out after token was issued
    const isGloballyLoggedOut = await TokenBlacklist.isUserGloballyLoggedOut(decoded.id, decoded.iat);
    if (isGloballyLoggedOut) {
      return res.status(401).json({
        success: false,
        message: 'Token invalidated due to security logout',
        code: 'TOKEN_GLOBALLY_INVALIDATED'
      });
    }

    // Optional: Verify user still exists and is active
    const userQuery = 'SELECT id, email, first_name, last_name, nic_number, is_active FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Add user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      nicNumber: decoded.nicNumber,
      role: decoded.role
    };

    // Store token for potential blacklisting on logout
    req.token = token;

    next();
  } catch (error) {
    console.error('Token validation error:', error.message);
    
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token validation failed',
      code: 'TOKEN_VALIDATION_FAILED'
    });
  }
};

/**
 * Optional middleware for routes where authentication is optional
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = jwtUtils.verifyToken(token);
      if (decoded.type === 'access') {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          nicNumber: decoded.nicNumber,
          role: decoded.role
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't return error, just continue without user
    next();
  }
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};
