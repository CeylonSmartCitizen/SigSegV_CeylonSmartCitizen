const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const AuthRateLimit = require('../utils/authRateLimit');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Enhanced rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // Increased to 8 attempts for better UX
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + email for more granular rate limiting
    const identifier = req.body?.email || req.body?.phone || req.ip;
    return `${req.ip}:${identifier}`;
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later',
    code: 'TOO_MANY_REGISTRATIONS'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Advanced login rate limiting middleware
const advancedLoginLimiter = AuthRateLimit.middleware();

// Public routes (no authentication required)
router.post('/register', registerLimiter, AuthController.register);
router.post('/login', advancedLoginLimiter, authLimiter, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);

// User preferences routes
router.get('/preferences', authenticateToken, AuthController.getUserPreferences);
router.put('/preferences', authenticateToken, AuthController.updatePreferences);

// Logout routes
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/global-logout', authenticateToken, AuthController.globalLogout);

// Health check for auth service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ceylon Auth Service is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'JWT Authentication',
      'NIC Validation',
      'Rate Limiting',
      'Token Blacklisting',
      'Session Management',
      'Multi-language Support'
    ]
  });
});

// Admin/Monitoring endpoints (should be protected in production)
router.get('/stats/rate-limit', async (req, res) => {
  try {
    const stats = await AuthRateLimit.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve rate limit stats'
    });
  }
});

router.get('/stats/blacklist', async (req, res) => {
  try {
    const TokenBlacklist = require('../utils/tokenBlacklist');
    const stats = await TokenBlacklist.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve blacklist stats'
    });
  }
});

// Maintenance endpoint for cleanup (should be protected in production)
router.post('/maintenance/cleanup', async (req, res) => {
  try {
    const TokenBlacklist = require('../utils/tokenBlacklist');
    const [tokenCleanup, attemptCleanup] = await Promise.all([
      TokenBlacklist.cleanupExpiredTokens(),
      AuthRateLimit.cleanupOldRecords()
    ]);

    res.json({
      success: true,
      message: 'Cleanup completed',
      data: {
        expiredTokensRemoved: tokenCleanup,
        oldAttemptsRemoved: attemptCleanup,
        cleanupTime: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
});

module.exports = router;
