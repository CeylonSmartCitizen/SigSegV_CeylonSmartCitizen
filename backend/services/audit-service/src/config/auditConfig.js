// Audit Service Config
module.exports = {
  LOG_RETENTION_DAYS: 365, // Example: keep logs for 1 year
  EXPORT_FORMATS: ['csv', 'json'],
  MAX_QUERY_LIMIT: 1000 // Limit for audit log queries
};
