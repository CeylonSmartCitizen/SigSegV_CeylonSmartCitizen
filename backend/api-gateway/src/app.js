const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Ceylon Smart Citizen API Gateway'
  });
});




// Appointment service proxy routes
const appointmentRoutes = require('./routes/appointment');
app.use('/api', appointmentRoutes);

// Auth service proxy routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Support service proxy routes
const supportAuditRoutes = require('./routes/supportAudit');
app.use('/api/support/audit', supportAuditRoutes);

const supportDocumentRoutes = require('./routes/supportDocument');
app.use('/api/support/documents', supportDocumentRoutes);

const supportNotificationRoutes = require('./routes/supportNotification');
app.use('/api/support/notifications', supportNotificationRoutes);

const supportOfficerRoutes = require('./routes/supportOfficer');
app.use('/api/support/officers', supportOfficerRoutes);

const supportQueueRoutes = require('./routes/supportQueue');
app.use('/api/support/queues', supportQueueRoutes);

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Ceylon Smart Citizen API is working!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
