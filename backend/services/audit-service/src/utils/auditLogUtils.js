// Audit Log Utilities

/**
 * Format audit log for export (CSV)
 * @param {Array} logs - Array of audit log objects
 * @returns {string} - CSV string
 */
function formatAuditLogsCSV(logs) {
  if (!logs.length) return '';
  const headers = Object.keys(logs[0]);
  const csvRows = [headers.join(',')];
  for (const log of logs) {
    const row = headers.map(h => JSON.stringify(log[h] ?? '')).join(',');
    csvRows.push(row);
  }
  return csvRows.join('\n');
}

/**
 * Filter audit logs by keyword in action or error_message
 * @param {Array} logs
 * @param {string} keyword
 * @returns {Array}
 */
function filterAuditLogsByKeyword(logs, keyword) {
  return logs.filter(log =>
    (log.action && log.action.includes(keyword)) ||
    (log.error_message && log.error_message.includes(keyword))
  );
}

module.exports = {
  formatAuditLogsCSV,
  filterAuditLogsByKeyword
};
