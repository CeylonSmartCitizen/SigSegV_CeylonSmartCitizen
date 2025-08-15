const { logAuditEvent, queryAuditLogs } = require('../services/auditLogService');
const db = require('../config/database');

describe('Audit Log Service', () => {
  it('should log an audit event and retrieve it', async () => {
    const testEvent = {
      user_id: '00000000-0000-0000-0000-000000000001',
      action: 'test_action',
      entity_type: 'test_entity',
      entity_id: '00000000-0000-0000-0000-000000000002',
      old_values: { foo: 'bar' },
      new_values: { foo: 'baz' },
      ip_address: '127.0.0.1',
      user_agent: 'jest-test',
      success: true,
      error_message: null
    };
    const log = await logAuditEvent(testEvent);
    expect(log).toHaveProperty('id');
    expect(log.action).toBe('test_action');
    const logs = await queryAuditLogs('SELECT * FROM audit_logs WHERE id = $1', [log.id]);
    expect(logs.length).toBe(1);
    expect(logs[0].action).toBe('test_action');
  });
});
