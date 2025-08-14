// Express app setup with helmet, cors, JSON parsing
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');
const redis = require('redis');
const app = express();
const prisma = new PrismaClient();
const redisClient = redis.createClient();
app.use(helmet());
app.use(cors());
app.use(express.json());


// Connect to PostgreSQL using Prisma
prisma.$connect().catch(console.error);
// Connect to Redis
redisClient.connect().catch(console.error);
// Mount notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/notifications', notificationRoutes);
// Test route
app.get('/', (req, res) => {
  res.send('Notification service is running');
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
module.exports = { app, prisma, redisClient };
