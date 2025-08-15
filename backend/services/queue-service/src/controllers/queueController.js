const queueService = require('../services/queueService');

// Create a new queue session
async function createQueueSession(req, res) {
  try {
    const session = await queueService.createQueueSession(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Add an entry to the queue
async function addQueueEntry(req, res) {
  try {
    const entry = await queueService.addQueueEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update queue position/status
async function updateQueueEntry(req, res) {
  try {
    const entry = await queueService.updateQueueEntry(req.params.id, req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get queue session details
async function getQueueSession(req, res) {
  try {
    const session = await queueService.getQueueSession(req.params.id);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all entries for a queue session
async function getQueueEntries(req, res) {
  try {
    const entries = await queueService.getQueueEntries(req.params.sessionId);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Pause or resume a queue session
async function pauseOrResumeQueueSession(req, res) {
  const { sessionId } = req.params;
  const { status } = req.body; // 'paused' or 'active'
  try {
    const session = await queueService.setQueueSessionStatus(sessionId, status);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createQueueSession,
  addQueueEntry,
  updateQueueEntry,
  getQueueSession,
  getQueueEntries,
  pauseOrResumeQueueSession
};
