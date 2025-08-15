const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officerController');

// Update officer status in a queue session
router.patch('/sessions/:sessionId/officer-status', officerController.updateOfficerStatus);

module.exports = router;
