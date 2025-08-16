// Simple PostgreSQL connection for OCR service
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ceylon123!@localhost:5432/ceylon_smart_citizen'
});

module.exports = pool;
