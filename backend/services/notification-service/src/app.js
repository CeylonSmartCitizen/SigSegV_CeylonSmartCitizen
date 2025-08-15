// Express app setup with helmet, cors, JSON parsing
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// PostgreSQL pool using DATABASE_URL from environment (docker-compose provides it)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect().then(() => {
  console.log('Connected to PostgreSQL via pg Pool');
}).catch(err => {
  console.error('Postgres connection error:', err);
});

// Connect to Redis
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Mount notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/notifications', notificationRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Notification service is running');
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

module.exports = { app, pool, redisClient };
