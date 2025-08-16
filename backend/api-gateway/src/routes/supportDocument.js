// Support Document proxy routes for API Gateway
const express = require('express');
const axios = require('axios');
const router = express.Router();

const SUPPORT_SERVICE_URL = process.env.SUPPORT_SERVICE_URL || 'http://support-services:3005';

function getEssentialHeaders(req) {
	const headers = {};
	if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'];
	if (req.headers['accept']) headers['accept'] = req.headers['accept'];
	if (req.headers['accept-language']) headers['accept-language'] = req.headers['accept-language'];
	return headers;
}

// Proxy GET /api/support/documents/*
router.get(['/', '/list', '/:id', '/:id/status'], async (req, res) => {
  try {
    const path = req.originalUrl.replace(/^\/api\/support\/documents/, '');
    const response = await axios.get(`${SUPPORT_SERVICE_URL}/documents${path}`, { headers: getEssentialHeaders(req), responseType: 'arraybuffer' });
    // If it's a file download, set headers
    if (response.headers['content-type']) res.set('Content-Type', response.headers['content-type']);
    if (response.headers['content-disposition']) res.set('Content-Disposition', response.headers['content-disposition']);
    res.status(response.status).send(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Support service unavailable' });
    }
  }
});

// File upload handling (simplified - requires multer setup)
router.post('/upload', async (req, res) => {
	try {
		// For now, just proxy the request as-is
		const response = await axios.post(`${SUPPORT_SERVICE_URL}/documents/upload`, req.body, {
			headers: getEssentialHeaders(req),
		});
		res.status(response.status).json(response.data);
	} catch (error) {
		if (error.response) {
			res.status(error.response.status).json(error.response.data);
		} else {
			res.status(500).json({ success: false, message: 'Support service unavailable' });
		}
	}
});

// Proxy DELETE /api/support/documents/:id
router.delete('/:id', async (req, res) => {
	try {
		const response = await axios.delete(`${SUPPORT_SERVICE_URL}/documents/${req.params.id}`, { headers: getEssentialHeaders(req) });
		res.status(response.status).json(response.data);
	} catch (error) {
		if (error.response) {
			res.status(error.response.status).json(error.response.data);
		} else {
			res.status(500).json({ success: false, message: 'Support service unavailable' });
		}
	}
});

module.exports = router;
