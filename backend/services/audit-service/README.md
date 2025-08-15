# Audit Service Integration Guide

## Audit Service Structure

### Folders
- `services/`: Audit logging logic
- `controllers/`: Audit log retrieval endpoints
- `routes/`: Express routes for audit log queries
- `middleware/`: Express middleware for auto-logging actions
- `utils/`: Helper functions for formatting/filtering logs
- `config/`: Audit service configuration
- `tests/`: Unit/integration tests

### Usage Example
Import the audit logging utility in your controller or service:
```js
const { logAuditEvent } = require('./src/services/auditLogService');
```

Call `logAuditEvent` after key actions (login, document upload, appointment, etc.):
```js
await logAuditEvent({
  user_id: user.id,
  action: 'login',
  entity_type: 'user',
  entity_id: user.id,
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
  success: true
});
```

### Audit Log Retrieval
Use the GET `/audit-logs` endpoint with query params (user_id, action, entity_type, start_date, end_date, success) to filter logs.

### Middleware
Use `auditLogMiddleware` to auto-log specified actions.

### Utils
- `formatAuditLogsCSV(logs)`: Export logs as CSV
- `filterAuditLogsByKeyword(logs, keyword)`: Filter logs by keyword

### Config
See `config/auditConfig.js` for log retention, export formats, and query limits.

### Tests
See `tests/auditLogService.test.js` for service tests.

---
If you need more integration examples or want to automate audit logging for a specific controller, provide the controller code or request a template.
