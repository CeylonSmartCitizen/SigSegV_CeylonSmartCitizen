const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');
const redis = require('redis');
const redis = require('redis');

const redisClient = redis.createClient();

app.use(helmet());
app.use(cors());
app.use(express.json());

redisClient.connect().catch(console.error);

// Mount document routes
const documentRoutes = require('./routes/documentRoutes');
app.use('/documents', documentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Document service is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Document service running on port ${PORT}`);
});

module.exports = { app, redisClient };
