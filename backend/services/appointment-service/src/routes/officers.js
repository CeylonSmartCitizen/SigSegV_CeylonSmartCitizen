const express = require('express');
const officerController = require('../controllers/officerController');

const router = express.Router();

/**
 * Officer Routes
 * Base path: /api/officers
 */

// GET /api/officers - Get all officers with filtering
router.get('/', officerController.getAllOfficers);

// GET /api/officers/search - Search officers
router.get('/search', officerController.searchOfficers);

// GET /api/officers/specializations - Get all available specializations
router.get('/specializations', officerController.getAllSpecializations);

// GET /api/officers/schedule/:date - Get officers scheduled for date
router.get('/schedule/:date', officerController.getOfficersScheduledForDate);

// GET /api/officers/availability-summary/:date - Get availability summary for date
router.get('/availability-summary/:date', officerController.getAvailabilitySummary);

// GET /api/officers/specialization/:specializations - Get officers by specialization
router.get('/specialization/:specializations', officerController.getOfficersBySpecialization);

// POST /api/officers/find-best-for-service - Find best officer for service
router.post('/find-best-for-service', officerController.findBestOfficerForService);

// GET /api/officers/:id - Get officer by ID
router.get('/:id', officerController.getOfficerById);

// GET /api/officers/:id/availability/:date - Get officer availability for date
router.get('/:id/availability/:date', officerController.getOfficerAvailability);

// GET /api/officers/:id/statistics - Get officer statistics
router.get('/:id/statistics', officerController.getOfficerStatistics);

module.exports = router;
