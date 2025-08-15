const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// Create a new queue session
router.post('/sessions', queueController.createQueueSession);

// Add an entry to the queue
router.post('/entries', queueController.addQueueEntry);

// Update queue entry position/status
router.patch('/entries/:id', queueController.updateQueueEntry);

// Get queue session details
router.get('/sessions/:id', queueController.getQueueSession);

// Get all entries for a queue session
router.get('/sessions/:sessionId/entries', queueController.getQueueEntries);

// Pause or resume a queue session
router.patch('/sessions/:sessionId/status', queueController.pauseOrResumeQueueSession);

module.exports = router;
