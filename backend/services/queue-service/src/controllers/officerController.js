// Officer controller for managing officer status in queue sessions
const queueService = require('../services/queueService');

// Update officer status in a queue session
async function updateOfficerStatus(req, res) {
  try {
    const result = await queueService.updateOfficerStatus(req.params.sessionId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  updateOfficerStatus
};
