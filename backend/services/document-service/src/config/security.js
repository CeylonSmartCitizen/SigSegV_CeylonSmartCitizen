// config/security.js
// Security settings for JWT and CORS

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secure-jwt-secret',
  CORS_OPTIONS: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
};
