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
    const profileUrl = `${authServiceUrl}/api/auth/profile`;
    
    console.log('Calling auth service at:', profileUrl);
    console.log('With token:', token.substring(0, 20) + '...');
    
    try {
      const response = await axios.get(profileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });

      console.log('Auth service response status:', response.status);
      console.log('Auth service response data:', JSON.stringify(response.data, null, 2));

      if (response.data.success && response.data.data && response.data.data.user) {
        // Attach user info to request object
        req.user = response.data.data.user; // Extract the user object specifically
        console.log('User authenticated:', req.user.id);
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
