const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for security
    methods: ['GET', 'POST']
  }
});

// Enhanced connection handler with authentication and room-based messaging
io.on('connection', (socket) => {
  // Example: Authenticate using query params (userId, token)
  const { userId, token } = socket.handshake.query;
  if (!userId || !token) {
    console.log('Authentication failed for socket:', socket.id);
    socket.disconnect(true);
    return;
  }
  console.log(`User ${userId} connected: ${socket.id}`);

  // Room-based messaging
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

  socket.on('directMessage', (data) => {
    // data: { toUserId, message }
    // Find the socket for toUserId and send the message
    // (You need to map userId <-> socket.id for this)
  });

  // Custom heartbeat from client
  socket.on('heartbeat', () => {
    console.log(`Heartbeat received from ${socket.id}`);
    socket.emit('heartbeatAck');
  });

  // Periodic server heartbeat
  const heartbeatInterval = setInterval(() => {
    socket.emit('serverHeartbeat', { timestamp: Date.now() });
  }, 30000); // every 30 seconds

  // Handle reconnection (Socket.io auto-reconnects, but you can log or restore state)
  socket.on('reconnect', (attemptNumber) => {
    console.log(`User ${userId} reconnected after ${attemptNumber} attempts: ${socket.id}`);
    // Optionally, re-join rooms or restore state here
  });

  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
    console.log(`User ${userId} disconnected: ${socket.id}`);

  });
});



// Mount API routes
const queueRoutes = require('./routes/queueRoutes');
const officerRoutes = require('./routes/officerRoutes');
app.use('/api/queue', queueRoutes);
app.use('/api/officer', officerRoutes);

// Example route
app.get('/', (req, res) => {
  res.send('Queue Service with Socket.io is running');
});

// Sample endpoint to broadcast queue update (for demonstration)
// In real use, call this logic from your queue update handler
app.post('/queue/:queueId/update', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const { position, nowServingUserId, stats } = req.body;
  // Broadcast to all users in the queue room
  io.to(`queue_${queueId}`).emit('queueUpdate', {
    position,
    nowServing: nowServingUserId,
    stats
  });
  res.json({ success: true });
});

// Helper functions for broadcasting queue events
function broadcastQueueUpdate(queueId, position, stats) {
  io.to(`queue_${queueId}`).emit('queueUpdate', { position, stats });
}

function notifyNowServing(queueId, userId) {
  io.to(`queue_${queueId}`).emit('nowServing', { userId, message: 'You are now being served!' });
}

function broadcastOfficerStatus(queueId, officerId, status) {
  io.to(`queue_${queueId}`).emit('officerStatus', { officerId, status });
}

function broadcastQueueStats(queueId, stats) {
  io.to(`queue_${queueId}`).emit('queueStats', stats);
}

// Helper function to broadcast pause/resume event
function broadcastQueuePauseResume(io, queueId, status) {
  io.to(`queue_${queueId}`).emit('queuePauseResume', {
    status,
    message: status === 'paused' ? 'Queue is paused.' : 'Queue is resumed.'
  });
}

// Example usage endpoints for demonstration
app.post('/queue/:queueId/position', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const { position, stats } = req.body;
  broadcastQueueUpdate(queueId, position, stats);
  res.json({ success: true });
});

app.post('/queue/:queueId/now-serving', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const { userId } = req.body;
  notifyNowServing(queueId, userId);
  res.json({ success: true });
});

app.post('/queue/:queueId/officer-status', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const { officerId, status } = req.body;
  broadcastOfficerStatus(queueId, officerId, status);
  res.json({ success: true });
});

app.post('/queue/:queueId/stats', express.json(), (req, res) => {
  const queueId = req.params.queueId;
  const stats = req.body;
  broadcastQueueStats(queueId, stats);
  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Queue Service running on port ${PORT}`);
});

module.exports = {
  broadcastQueueUpdate,
  notifyNowServing,
  broadcastOfficerStatus,
  broadcastQueueStats,
  broadcastQueuePauseResume
};