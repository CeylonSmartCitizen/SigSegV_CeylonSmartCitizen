// src/middleware/auth.js
// Authentication middleware that validates tokens with auth service

const axios = require('axios');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Access token is required',
          details: 'Authorization header must be in format: Bearer <token>'
        },
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.split(' ')[1];

    // Validate token with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    
    try {
      const response = await axios.get(`${authServiceUrl}/api/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data.success && response.data.data.user) {
        // Attach user info to request object
        req.user = response.data.data.user;
        next();
      } else {
        throw new Error('Invalid token response from auth service');
      }
    } catch (authError) {
      console.error('Auth service validation error:', authError.message);
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Invalid or expired token',
          details: 'Token validation failed with auth service'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_SERVICE_ERROR',
        message: 'Authentication service error',
        details: 'Failed to validate token with auth service'
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = auth;
