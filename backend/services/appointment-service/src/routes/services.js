// src/routes/services.js
// Service Directory Routes - API endpoint definitions for appointment service
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

/**
 * @route   GET /api/services
 * @desc    List all services with search, filter, and pagination
 * @access  Public
 */
router.get('/', serviceController.listServices);

/**
 * @route   GET /api/services/categories
 * @desc    Get available service categories
 * @access  Public
 */
router.get('/categories', serviceController.getServiceCategories);

/**
 * @route   GET /api/services/:id
 * @desc    Get service details by ID
 * @access  Public
 */
router.get('/:id', serviceController.getServiceDetails);

module.exports = router;
