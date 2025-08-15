// config/database.js
// PostgreSQL connection using pg driver
const { Pool } = require('pg');

const dbConfig = {
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'ceylon123!',
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 5432,
	database: process.env.DB_NAME || 'ceylon_smart_citizen',
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
	console.log('✅ Connected to Ceylon Smart Citizen Database');
});

module.exports = pool;
