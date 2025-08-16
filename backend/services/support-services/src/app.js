const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ceylon123!@localhost:5432/ceylon_smart_citizen'
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('Support Service: Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('Support Service: Database connection error:', err);
  });

// Redis connection (optional)
let redisClient;
try {
  const redis = require('redis');
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  redisClient.connect().catch(err => {
    console.warn('Support Service: Redis connection failed:', err.message);
  });
} catch (error) {
  console.warn('Support Service: Redis setup failed:', error.message);
}

app.use(helmet());
app.use(cors());
app.use(express.json());

// Socket.IO for queue management
io.on('connection', (socket) => {
  const { userId, token } = socket.handshake.query;
  if (!userId || !token) {
    console.log('Authentication failed for socket:', socket.id);
    socket.disconnect(true);
    return;
  }
  console.log(`User ${userId} connected to queue service: ${socket.id}`);

  // Queue room management
  socket.on('joinQueue', (queueId) => {
    socket.join(`queue_${queueId}`);
    console.log(`User ${userId} joined room queue_${queueId}`);
    socket.emit('joinedQueue', { queueId });
  });

  socket.on('leaveQueue', (queueId) => {
    socket.leave(`queue_${queueId}`);
    console.log(`User ${userId} left room queue_${queueId}`);
    socket.emit('leftQueue', { queueId });
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected: ${socket.id}`);
  });
});

// Mount all service routes
try {
  // Document Service Routes
  const documentRoutes = require('./routes/documentRoutes');
  app.use('/documents', documentRoutes);
  console.log('✓ Document service routes loaded');

  // Notification Service Routes
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/notifications', notificationRoutes);
  console.log('✓ Notification service routes loaded');

  // Queue Service Routes
  const queueRoutes = require('./routes/queueRoutes');
  const officerRoutes = require('./routes/officerRoutes');
  app.use('/queue', queueRoutes);
  app.use('/officer', officerRoutes);
  console.log('✓ Queue service routes loaded');

  // Audit Service Routes
  const auditRoutes = require('./routes/auditRoutes');
  app.use('/audit', auditRoutes);
  console.log('✓ Audit service routes loaded');

} catch (error) {
  console.error('Error loading service routes:', error.message);
}

// Queue Socket.IO endpoints (HTTP API)
app.post('/queue/:queueId/position', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const { position, stats } = req.body;
  io.to(`queue_${queueId}`).emit('queueUpdate', { position, stats });
  res.json({ success: true, message: 'Queue position updated' });
});

app.post('/queue/:queueId/now-serving', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const { userId } = req.body;
  io.to(`queue_${queueId}`).emit('nowServing', { userId, message: 'You are now being served!' });
  res.json({ success: true, message: 'Now serving notification sent' });
});

app.post('/queue/:queueId/officer-status', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const { officerId, status } = req.body;
  io.to(`queue_${queueId}`).emit('officerStatus', { officerId, status });
  res.json({ success: true, message: 'Officer status updated' });
});

app.post('/queue/:queueId/stats', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const stats = req.body;
  io.to(`queue_${queueId}`).emit('queueStats', stats);
  res.json({ success: true, message: 'Queue stats updated' });
});

// Main health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Support Services (Unified) - Running',
    services: {
      documents: '/documents',
      notifications: '/notifications', 
      queue: '/queue',
      audit: '/audit'
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Service-specific health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      documents: 'active',
      notifications: 'active',
      queue: 'active', 
      audit: 'active'
    },
    database: pool ? 'connected' : 'disconnected',
    redis: redisClient ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start unified support service
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`🚀 Unified Support Service running on port ${PORT}`);
  console.log('📋 Available services:');
  console.log(`   📄 Documents: http://localhost:${PORT}/documents`);
  console.log(`   🔔 Notifications: http://localhost:${PORT}/notifications`);
  console.log(`   🚶 Queue: http://localhost:${PORT}/queue`);
  console.log(`   📊 Audit: http://localhost:${PORT}/audit`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health`);
});

module.exports = { app, server, pool, redisClient, io };
