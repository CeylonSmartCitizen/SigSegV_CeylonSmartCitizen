// Audit Log Controller
const auditLogService = require('../services/auditLogService');

/**
 * Get audit logs with optional filters: user_id, action, entity_type, date range
 * Query params: user_id, action, entity_type, start_date, end_date, success
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      user_id,
      action,
      entity_type,
      start_date,
      end_date,
      success
    } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let idx = 1;
    if (user_id) {
      query += ` AND user_id = $${idx++}`;
      params.push(user_id);
    }
    if (action) {
      query += ` AND action = $${idx++}`;
      params.push(action);
    }
    if (entity_type) {
      query += ` AND entity_type = $${idx++}`;
      params.push(entity_type);
    }
    if (success !== undefined) {
      query += ` AND success = $${idx++}`;
      params.push(success === 'true');
    }
    if (start_date) {
      query += ` AND created_at >= $${idx++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND created_at <= $${idx++}`;
      params.push(end_date);
    }
    query += ' ORDER BY created_at DESC';
    const result = await auditLogService.queryAuditLogs(query, params);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
};
