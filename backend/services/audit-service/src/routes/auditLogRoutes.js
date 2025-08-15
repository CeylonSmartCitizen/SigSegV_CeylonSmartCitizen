const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');

// GET /audit-logs - Retrieve audit logs with filters
router.get('/audit-logs', auditLogController.getAuditLogs);

module.exports = router;
