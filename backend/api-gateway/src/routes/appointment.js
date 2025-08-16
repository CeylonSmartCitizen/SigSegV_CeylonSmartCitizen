// =============================
// TEMPORARY NOTE: APPOINTMENT INTEGRATION IN PROGRESS
// This file will proxy appointment-related requests from the API Gateway to the appointment service.
// Add proxy logic for each route group: appointments, departments, officers, queue, services.
// =============================

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Base URL for the appointment service (update if needed)
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:3002';


// Helper to forward requests to the appointment service
function getEssentialHeaders(req) {
	const headers = {};
	if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'];
	if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
	if (req.headers['accept']) headers['accept'] = req.headers['accept'];
	if (req.headers['accept-language']) headers['accept-language'] = req.headers['accept-language'];
	return headers;
}



// Proxy /appointments routes
router.use('/appointments', async (req, res, next) => {
  const url = `${APPOINTMENT_SERVICE_URL}/api/appointments${req.url}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      headers: getEssentialHeaders(req),
      data: req.body,
      params: req.query,
      validateStatus: () => true
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy /departments routes
router.use('/departments', async (req, res, next) => {
  const url = `${APPOINTMENT_SERVICE_URL}/api/departments${req.url}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      headers: getEssentialHeaders(req),
      data: req.body,
      params: req.query,
      validateStatus: () => true
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy /officers routes
router.use('/officers', async (req, res, next) => {
  const url = `${APPOINTMENT_SERVICE_URL}/api/officers${req.url}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      headers: getEssentialHeaders(req),
      data: req.body,
      params: req.query,
      validateStatus: () => true
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy /queue routes
router.use('/queue', async (req, res, next) => {
  const url = `${APPOINTMENT_SERVICE_URL}/api/queue${req.url}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      headers: getEssentialHeaders(req),
      data: req.body,
      params: req.query,
      validateStatus: () => true
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy /services routes
router.use('/services', async (req, res, next) => {
  const url = `${APPOINTMENT_SERVICE_URL}/api/services${req.url}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      headers: getEssentialHeaders(req),
      data: req.body,
      params: req.query,
      validateStatus: () => true
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});module.exports = router;
