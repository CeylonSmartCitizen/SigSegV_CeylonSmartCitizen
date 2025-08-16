
// =============================
// TEMPORARY NOTE: AUTH INTEGRATION PAUSED
// Work on auth integration in the API Gateway is currently paused due to issues with route registration or service connectivity.
// When resuming, check:
//   - That /api/auth/* routes are registered in app.js
//   - That the auth service is reachable and healthy
//   - That proxy logic and middleware are correctly applied
//   - That integration tests pass (see previous test scripts)
// Resume from here.
// =============================
// Auth routes for API Gateway
// This file proxies auth-related requests to the auth service


const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

// Base URL for the auth service (update if needed)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';


// Helper to pick only essential headers
function getEssentialHeaders(req) {
  const headers = {};
  if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'];
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
  if (req.headers['accept']) headers['accept'] = req.headers['accept'];
  if (req.headers['accept-language']) headers['accept-language'] = req.headers['accept-language'];
  return headers;
}

// Proxy registration
router.post('/register', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/register`, req.body, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy login
router.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/refresh-token`, req.body, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});


// Proxy get profile (protected)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/profile`, {
      headers: getEssentialHeaders(req)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy update profile (protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const response = await axios.put(`${AUTH_SERVICE_URL}/profile`, req.body, {
      headers: getEssentialHeaders(req)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy change password (protected)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const response = await axios.put(`${AUTH_SERVICE_URL}/change-password`, req.body, {
      headers: getEssentialHeaders(req)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy get preferences (protected)
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/preferences`, {
      headers: getEssentialHeaders(req)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy update preferences (protected)
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const response = await axios.put(`${AUTH_SERVICE_URL}/preferences`, req.body, {
      headers: getEssentialHeaders(req)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy logout (protected)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/logout`, req.body, {
      headers: getEssentialHeaders(req)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy global logout (protected)
router.post('/global-logout', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/global-logout`, req.body, {
      headers: getEssentialHeaders(req)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/health`, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

// Proxy admin/monitoring endpoints (optional, can restrict in production)
router.get('/stats/rate-limit', async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/stats/rate-limit`, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

router.get('/stats/blacklist', async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/stats/blacklist`, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

router.post('/maintenance/cleanup', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/maintenance/cleanup`, req.body, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Auth service unavailable' });
    }
  }
});

module.exports = router;
