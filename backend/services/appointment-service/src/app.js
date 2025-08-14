// src/app.js
const express = require('express');
const app = express();
const appointmentsRouter = require('./routes/appointments');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());

// Appointment API routes
app.use('/api/appointments', appointmentsRouter);

// Centralized error handler
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'appointment-service' }));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Ceylon Appointment Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📅 Appointment API: http://localhost:${PORT}/api/appointments`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
