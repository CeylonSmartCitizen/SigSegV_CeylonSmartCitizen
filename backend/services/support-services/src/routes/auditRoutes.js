const express = require('express');
const router = express.Router();

// Mock audit log storage (in production, this would use database)
let auditLogs = [];
let auditLogId = 1;

// Generate some sample audit logs for testing
function generateSampleLogs() {
  const sampleActions = ['LOGIN', 'LOGOUT', 'CREATE_DOCUMENT', 'UPDATE_DOCUMENT', 'DELETE_DOCUMENT', 'SEND_NOTIFICATION'];
  const sampleUsers = ['user1', 'user2', 'admin', 'system'];
  
  for (let i = 0; i < 10; i++) {
    auditLogs.push({
      id: auditLogId++,
      userId: sampleUsers[Math.floor(Math.random() * sampleUsers.length)],
      action: sampleActions[Math.floor(Math.random() * sampleActions.length)],
      resource: 'system',
      resourceId: Math.floor(Math.random() * 1000),
      details: `Sample audit log entry ${i + 1}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Test Browser)',
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      success: Math.random() > 0.1
    });
  }
}

// Initialize with sample data
generateSampleLogs();

// Basic routes for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'Audit Logs API is working', 
    endpoints: ['/audit-logs', '/audit-logs/user/:userId', '/audit-logs/:id'],
    version: '1.0.0'
  });
});

// GET /audit-logs - Retrieve audit logs with filters
router.get('/audit-logs', (req, res) => {
  try {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      success,
      limit = 50,
      offset = 0
    } = req.query;

    let filteredLogs = auditLogs;

    // Apply filters
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    if (resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === resource);
    }

    if (success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === (success === 'true'));
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
    }

    // Sort by timestamp (newest first)
    filteredLogs = filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      auditLogs: paginatedLogs,
      total: filteredLogs.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: {
        userId,
        action,
        resource,
        startDate,
        endDate,
        success
      }
    });

  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// GET /audit-logs/user/:userId - Get audit logs for specific user
router.get('/audit-logs/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const userLogs = auditLogs
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      userId: userId,
      auditLogs: userLogs,
      count: userLogs.length
    });

  } catch (error) {
    console.error('Error retrieving user audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve user audit logs' });
  }
});

// GET /audit-logs/:id - Get specific audit log entry
router.get('/audit-logs/:id', (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const auditLog = auditLogs.find(log => log.id === logId);

    if (!auditLog) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json({
      auditLog: auditLog,
      message: 'Audit log retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving audit log:', error);
    res.status(500).json({ error: 'Failed to retrieve audit log' });
  }
});

// POST /audit-logs - Create new audit log entry
router.post('/audit-logs', (req, res) => {
  try {
    const {
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }

    const newAuditLog = {
      id: auditLogId++,
      userId,
      action,
      resource: resource || 'system',
      resourceId: resourceId || null,
      details: details || `${action} performed by ${userId}`,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      success: true
    };

    auditLogs.push(newAuditLog);

    res.status(201).json({
      auditLog: newAuditLog,
      message: 'Audit log created successfully'
    });

  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// GET /audit-logs/stats - Get audit log statistics
router.get('/audit-logs/stats', (req, res) => {
  try {
    const stats = {
      totalLogs: auditLogs.length,
      successfulActions: auditLogs.filter(log => log.success).length,
      failedActions: auditLogs.filter(log => !log.success).length,
      uniqueUsers: [...new Set(auditLogs.map(log => log.userId))].length,
      actionTypes: [...new Set(auditLogs.map(log => log.action))],
      recentLogs: auditLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    };

    res.json({
      statistics: stats,
      message: 'Audit log statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving audit log statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve audit log statistics' });
  }
});

module.exports = router;
