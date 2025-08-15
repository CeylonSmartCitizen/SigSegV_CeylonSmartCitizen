// tests/queueService.test.js
const queueService = require('../services/queueService');
const db = require('../config/database');

describe('Queue Service', () => {
  afterAll(async () => {
    await db.pool.end();
  });

  test('should create a new queue session', async () => {
    const data = {
      department_id: 'some-dept-uuid',
      service_id: 'some-service-uuid',
      session_date: '2025-08-15',
      max_capacity: 50,
      session_start_time: '09:00:00',
      session_end_time: '17:00:00'
    };
    const session = await queueService.createQueueSession(data);
    expect(session).toHaveProperty('id');
    expect(session.department_id).toBe(data.department_id);
  });
});