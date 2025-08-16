const express = require('express');
const router = express.Router();

// Mock officer data storage (in production, this would use database)
let officers = {};
let officerSessions = {};

// Initialize some sample officers
officers['officer1'] = {
  id: 'officer1',
  name: 'John Doe',
  status: 'available',
  currentSession: null,
  servicesHandled: ['documents', 'verification'],
  createdAt: new Date().toISOString()
};

officers['officer2'] = {
  id: 'officer2',
  name: 'Jane Smith',
  status: 'busy',
  currentSession: null,
  servicesHandled: ['notifications', 'support'],
  createdAt: new Date().toISOString()
};

// Basic routes for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'Officer Management API is working', 
    endpoints: ['/officers', '/officers/:officerId', '/sessions/:sessionId/officer-status'],
    version: '1.0.0'
  });
});

// GET /officers - List all officers
router.get('/officers', (req, res) => {
  try {
    const officerList = Object.values(officers);
    
    res.json({
      officers: officerList,
      totalOfficers: officerList.length,
      availableOfficers: officerList.filter(o => o.status === 'available').length,
      busyOfficers: officerList.filter(o => o.status === 'busy').length
    });
  } catch (error) {
    console.error('Error listing officers:', error);
    res.status(500).json({ error: 'Failed to list officers' });
  }
});

// GET /officers/:officerId - Get specific officer
router.get('/officers/:officerId', (req, res) => {
  try {
    const officerId = req.params.officerId;
    const officer = officers[officerId];

    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    res.json({
      officer,
      sessions: Object.values(officerSessions).filter(s => s.officerId === officerId)
    });
  } catch (error) {
    console.error('Error getting officer:', error);
    res.status(500).json({ error: 'Failed to get officer' });
  }
});

// POST /officers - Create new officer
router.post('/officers', (req, res) => {
  try {
    const { id, name, servicesHandled } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Officer id and name are required' });
    }

    if (officers[id]) {
      return res.status(409).json({ error: 'Officer already exists' });
    }

    officers[id] = {
      id,
      name,
      status: 'available',
      currentSession: null,
      servicesHandled: servicesHandled || [],
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      officer: officers[id],
      message: 'Officer created successfully'
    });
  } catch (error) {
    console.error('Error creating officer:', error);
    res.status(500).json({ error: 'Failed to create officer' });
  }
});

// PATCH /officers/:officerId/status - Update officer status
router.patch('/officers/:officerId/status', (req, res) => {
  try {
    const officerId = req.params.officerId;
    const { status } = req.body;
    const officer = officers[officerId];

    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    const validStatuses = ['available', 'busy', 'offline', 'break'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    officer.status = status;
    officer.updatedAt = new Date().toISOString();

    res.json({
      officer,
      message: 'Officer status updated successfully'
    });
  } catch (error) {
    console.error('Error updating officer status:', error);
    res.status(500).json({ error: 'Failed to update officer status' });
  }
});

// PATCH /sessions/:sessionId/officer-status - Update officer status in a queue session
router.patch('/sessions/:sessionId/officer-status', (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { officerId, status, notes } = req.body;

    if (!officerId || !status) {
      return res.status(400).json({ error: 'officerId and status are required' });
    }

    const officer = officers[officerId];
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    // Create or update officer session
    if (!officerSessions[sessionId]) {
      officerSessions[sessionId] = {
        sessionId,
        officerId,
        status: status,
        notes: notes || '',
        startTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      officerSessions[sessionId].status = status;
      officerSessions[sessionId].notes = notes || officerSessions[sessionId].notes;
      officerSessions[sessionId].updatedAt = new Date().toISOString();
    }

    // Update officer's current session
    if (status === 'serving') {
      officer.currentSession = sessionId;
      officer.status = 'busy';
    } else if (status === 'completed' || status === 'cancelled') {
      officer.currentSession = null;
      officer.status = 'available';
      officerSessions[sessionId].endTime = new Date().toISOString();
    }

    res.json({
      session: officerSessions[sessionId],
      officer: officer,
      message: 'Officer session status updated successfully'
    });
  } catch (error) {
    console.error('Error updating officer session status:', error);
    res.status(500).json({ error: 'Failed to update officer session status' });
  }
});

// GET /sessions - List all officer sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = Object.values(officerSessions);
    const { officerId, status } = req.query;

    let filteredSessions = sessions;

    if (officerId) {
      filteredSessions = filteredSessions.filter(s => s.officerId === officerId);
    }

    if (status) {
      filteredSessions = filteredSessions.filter(s => s.status === status);
    }

    res.json({
      sessions: filteredSessions,
      totalSessions: filteredSessions.length
    });
  } catch (error) {
    console.error('Error listing officer sessions:', error);
    res.status(500).json({ error: 'Failed to list officer sessions' });
  }
});

// GET /sessions/:sessionId - Get specific officer session
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = officerSessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: 'Officer session not found' });
    }

    const officer = officers[session.officerId];

    res.json({
      session,
      officer: officer || null
    });
  } catch (error) {
    console.error('Error getting officer session:', error);
    res.status(500).json({ error: 'Failed to get officer session' });
  }
});

module.exports = router;
