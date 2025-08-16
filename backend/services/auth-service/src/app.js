const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    const dbHealthy = await db.testConnection();
    
    res.status(200).json({ 
      success: true,
      service: "Ceylon Auth Service",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || 'development',
      database: dbHealthy ? 'connected' : 'disconnected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: "Ceylon Auth Service",
      error: "Health check failed",
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Ceylon Smart Citizen - Authentication Service",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      register: "/api/auth/register",
      login: "/api/auth/login",
      profile: "/api/auth/profile",
      refreshToken: "/api/auth/refresh-token",
      forgotPassword: "/api/auth/forgot-password",
      resetPassword: "/api/auth/reset-password",
      sessions: "/api/auth/sessions",
      logoutSession: "/api/auth/logout-session/:sessionId",
      logoutAllSessions: "/api/auth/logout-all-sessions",
      deactivateAccount: "/api/auth/deactivate-account",
      exportData: "/api/auth/export-data",
      setupTwoFactor: "/api/auth/2fa/setup",
      verifyTwoFactor: "/api/auth/2fa/verify",
      disableTwoFactor: "/api/auth/2fa/disable"
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    code: "NOT_FOUND",
    availableEndpoints: [
      "GET /health",
      "GET /api/auth/health", 
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/refresh-token",
      "GET /api/auth/profile",
      "POST /api/auth/logout"
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    success: false,
    message: isDevelopment ? error.message : 'Internal server error',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
console.log("🚀 Ceylon Auth Service starting...");

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`✅ Ceylon Auth Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection on startup
  try {
    await db.testConnection();
    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});
