// src/app.js
const express = require('express');
const app = express();
const appointmentsRouter = require('./routes/appointments');
const servicesRouter = require('./routes/services');
const queueRouter = require('./routes/queue');
const departmentsRouter = require('./routes/departments');
const officersRouter = require('./routes/officers');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());

// API routes
app.use('/api/appointments', appointmentsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/queue', queueRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/officers', officersRouter);

// Centralized error handler
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'appointment-service' }));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Ceylon Appointment Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📅 Appointment API: http://localhost:${PORT}/api/appointments`);
  console.log(`🏛️  Services API: http://localhost:${PORT}/api/services`);
  console.log(`📋 Queue API: http://localhost:${PORT}/api/queue`);
  console.log(`🏢 Departments API: http://localhost:${PORT}/api/departments`);
  console.log(`👤 Officers API: http://localhost:${PORT}/api/officers`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
