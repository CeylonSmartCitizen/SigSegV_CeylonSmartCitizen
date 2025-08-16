// Authentication middleware for API Gateway
// Validates JWT by calling the auth service's /profile endpoint

const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Call the auth service's /profile endpoint to validate the token
    await axios.get(`${AUTH_SERVICE_URL}/profile`, {
      headers: { authorization: authHeader }
    });
    // If successful, token is valid
    next();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    return res.status(500).json({ success: false, message: 'Auth service unavailable' });
  }
}

module.exports = { authenticateToken };
