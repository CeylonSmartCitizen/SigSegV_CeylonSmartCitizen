const express = require('express');
const router = express.Router();

// Mock queue storage (in production, this would use database/Redis)
let queues = {};
let queueSessions = {};
let sessionId = 1;

// Initialize some sample queues
queues['document-processing'] = {
  id: 'document-processing',
  name: 'Document Processing Queue',
  jobs: [],
  maxSize: 100,
  createdAt: new Date().toISOString()
};

queues['notifications'] = {
  id: 'notifications',
  name: 'Notification Queue',
  jobs: [],
  maxSize: 50,
  createdAt: new Date().toISOString()
};

// Basic routes for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'Queue Management API is working', 
    endpoints: ['/queues', '/sessions', '/queues/:queueId/jobs', '/sessions/:sessionId'],
    version: '1.0.0'
  });
});

// GET /queues - List all queues
router.get('/queues', (req, res) => {
  try {
    const queueList = Object.values(queues).map(queue => ({
      ...queue,
      jobCount: queue.jobs.length,
      pendingJobs: queue.jobs.filter(job => job.status === 'pending').length,
      processingJobs: queue.jobs.filter(job => job.status === 'processing').length,
      completedJobs: queue.jobs.filter(job => job.status === 'completed').length,
      failedJobs: queue.jobs.filter(job => job.status === 'failed').length
    }));

    res.json({
      queues: queueList,
      totalQueues: queueList.length
    });
  } catch (error) {
    console.error('Error listing queues:', error);
    res.status(500).json({ error: 'Failed to list queues' });
  }
});

// POST /queues - Create a new queue
router.post('/queues', (req, res) => {
  try {
    const { id, name, maxSize } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Queue id and name are required' });
    }

    if (queues[id]) {
      return res.status(409).json({ error: 'Queue already exists' });
    }

    queues[id] = {
      id,
      name,
      jobs: [],
      maxSize: maxSize || 100,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      queue: queues[id],
      message: 'Queue created successfully'
    });
  } catch (error) {
    console.error('Error creating queue:', error);
    res.status(500).json({ error: 'Failed to create queue' });
  }
});

// GET /queues/:queueId - Get specific queue details
router.get('/queues/:queueId', (req, res) => {
  try {
    const queueId = req.params.queueId;
    const queue = queues[queueId];

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    res.json({
      queue: {
        ...queue,
        jobCount: queue.jobs.length,
        stats: {
          pending: queue.jobs.filter(job => job.status === 'pending').length,
          processing: queue.jobs.filter(job => job.status === 'processing').length,
          completed: queue.jobs.filter(job => job.status === 'completed').length,
          failed: queue.jobs.filter(job => job.status === 'failed').length
        }
      }
    });
  } catch (error) {
    console.error('Error getting queue:', error);
    res.status(500).json({ error: 'Failed to get queue' });
  }
});

// POST /queues/:queueId/jobs - Add job to queue
router.post('/queues/:queueId/jobs', (req, res) => {
  try {
    const queueId = req.params.queueId;
    const queue = queues[queueId];

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const { type, data, priority } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Job type is required' });
    }

    if (queue.jobs.length >= queue.maxSize) {
      return res.status(429).json({ error: 'Queue is full' });
    }

    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: data || {},
      priority: priority || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    queue.jobs.push(job);

    // Sort by priority (higher priority first)
    queue.jobs.sort((a, b) => b.priority - a.priority);

    res.status(201).json({
      job,
      message: 'Job added to queue successfully'
    });
  } catch (error) {
    console.error('Error adding job to queue:', error);
    res.status(500).json({ error: 'Failed to add job to queue' });
  }
});

// GET /queues/:queueId/jobs - Get jobs in queue
router.get('/queues/:queueId/jobs', (req, res) => {
  try {
    const queueId = req.params.queueId;
    const queue = queues[queueId];

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const { status, limit = 50, offset = 0 } = req.query;

    let jobs = queue.jobs;

    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }

    const paginatedJobs = jobs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      jobs: paginatedJobs,
      total: jobs.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      queueId
    });
  } catch (error) {
    console.error('Error getting queue jobs:', error);
    res.status(500).json({ error: 'Failed to get queue jobs' });
  }
});

// POST /sessions - Create queue session
router.post('/sessions', (req, res) => {
  try {
    const { userId, queueId } = req.body;

    if (!userId || !queueId) {
      return res.status(400).json({ error: 'userId and queueId are required' });
    }

    if (!queues[queueId]) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const session = {
      id: `session_${sessionId++}`,
      userId,
      queueId,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    queueSessions[session.id] = session;

    res.status(201).json({
      session,
      message: 'Queue session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /sessions - List all sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = Object.values(queueSessions);
    
    res.json({
      sessions,
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length
    });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

// GET /sessions/:sessionId - Get specific session
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = queueSessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      session,
      queue: queues[session.queueId] || null
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// DELETE /sessions/:sessionId - End session
router.delete('/sessions/:sessionId', (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = queueSessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'ended';
    session.endedAt = new Date().toISOString();

    res.json({
      session,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// PATCH /queues/:queueId/jobs/:jobId/status - Update job status
router.patch('/queues/:queueId/jobs/:jobId/status', (req, res) => {
  try {
    const { queueId, jobId } = req.params;
    const { status, result } = req.body;

    const queue = queues[queueId];
    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const job = queue.jobs.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    job.status = status;
    job.updatedAt = new Date().toISOString();
    
    if (result) {
      job.result = result;
    }

    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date().toISOString();
    }

    res.json({
      job,
      message: 'Job status updated successfully'
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

module.exports = router;
