// Support Notification proxy routes for API Gateway
const express = require('express');
const axios = require('axios');
const router = express.Router();

const SUPPORT_SERVICE_URL = process.env.SUPPORT_SERVICE_URL || 'http://support-services:3005';

function getEssentialHeaders(req) {
	const headers = {};
	if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'];
	if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
	if (req.headers['accept']) headers['accept'] = req.headers['accept'];
	if (req.headers['accept-language']) headers['accept-language'] = req.headers['accept-language'];
	return headers;
}

// Proxy GET, POST, PATCH, DELETE for notifications
router.get(['/', '/user/:userId', '/:id', '/all'], async (req, res) => {
  try {
    const path = req.originalUrl.replace(/^\/api\/support\/notifications/, '');
    const response = await axios.get(`${SUPPORT_SERVICE_URL}/notifications${path}`, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Support service unavailable' });
    }
  }
});

router.post(['/', '/:id/read'], async (req, res) => {
  try {
    const path = req.originalUrl.replace(/^\/api\/support\/notifications/, '');
    const response = await axios.post(`${SUPPORT_SERVICE_URL}/notifications${path}`, req.body, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Support service unavailable' });
    }
  }
});

router.patch(['/:id/read', '/user/:userId/read-all'], async (req, res) => {
  try {
    const path = req.originalUrl.replace(/^\/api\/support\/notifications/, '');
    const response = await axios.patch(`${SUPPORT_SERVICE_URL}/notifications${path}`, req.body, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Support service unavailable' });
    }
  }
});

router.delete(['/:id'], async (req, res) => {
  try {
    const path = req.originalUrl.replace(/^\/api\/support\/notifications/, '');
    const response = await axios.delete(`${SUPPORT_SERVICE_URL}/notifications${path}`, { headers: getEssentialHeaders(req) });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Support service unavailable' });
    }
  }
});module.exports = router;
