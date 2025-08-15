// Audit Logging Service for PostgreSQL
const db = require('../config/database');

/**
 * Log an audit event to the audit_logs table
 * @param {Object} params - Audit log parameters
 * @param {string} params.user_id - UUID of the user
 * @param {string} params.action - Action performed (e.g., 'login', 'appointment_created')
 * @param {string} params.entity_type - Type of entity affected (e.g., 'user', 'appointment', 'document')
 * @param {string} params.entity_id - UUID of the entity affected
 * @param {Object} params.old_values - Previous state (for updates)
 * @param {Object} params.new_values - New state (for updates)
 * @param {string} params.ip_address - IP address of the user
 * @param {string} params.user_agent - User agent string
 * @param {boolean} params.success - Whether the action succeeded
 * @param {string} params.error_message - Error message if failed
 */
async function logAuditEvent({
  user_id,
  action,
  entity_type,
  entity_id,
  old_values = null,
  new_values = null,
  ip_address = null,
  user_agent = null,
  success = true,
  error_message = null
}) {
  const insertQuery = `
    INSERT INTO audit_logs (
      user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, success, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const values = [
    user_id,
    action,
    entity_type,
    entity_id,
    old_values ? JSON.stringify(old_values) : null,
    new_values ? JSON.stringify(new_values) : null,
    ip_address,
    user_agent,
    success,
    error_message
  ];
  const result = await db.query(insertQuery, values);
  return result.rows[0];
}

/**
 * Query audit logs with custom SQL and parameters
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Array of audit log records
 */
async function queryAuditLogs(query, params) {
  const result = await db.query(query, params);
  return result.rows;
}

module.exports = {
  logAuditEvent,
  queryAuditLogs
};
