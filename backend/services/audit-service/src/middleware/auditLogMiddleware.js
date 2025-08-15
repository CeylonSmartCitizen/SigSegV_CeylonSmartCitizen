// Audit Log Middleware
const { logAuditEvent } = require('../services/auditLogService');

/**
 * Express middleware to automatically log requests for specific actions
 * Usage: app.use(auditLogMiddleware(['login', 'document_uploaded', ...]))
 */
function auditLogMiddleware(actions = []) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (actions.includes(req.route?.path)) {
        await logAuditEvent({
          user_id: req.user?.id || req.body.user_id || null,
          action: req.route.path,
          entity_type: req.entity_type || null,
          entity_id: req.entity_id || null,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          success: res.statusCode < 400,
          error_message: res.statusCode >= 400 ? res.locals.error_message : null
        });
      }
    });
    next();
  };
}

module.exports = auditLogMiddleware;
