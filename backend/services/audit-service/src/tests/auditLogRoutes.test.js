const request = require('supertest');
const express = require('express');
const auditLogRoutes = require('../routes/auditLogRoutes');

const app = express();
app.use(express.json());
app.use(auditLogRoutes);

describe('GET /audit-logs', () => {
  it('should return audit logs (empty or with data)', async () => {
    const res = await request(app).get('/audit-logs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should filter by user_id', async () => {
    const res = await request(app).get('/audit-logs').query({ user_id: '00000000-0000-0000-0000-000000000001' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
