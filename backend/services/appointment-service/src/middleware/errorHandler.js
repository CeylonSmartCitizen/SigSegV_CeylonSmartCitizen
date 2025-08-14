// src/middleware/errorHandler.js
// Centralized error handler for API responses
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  const details = err.details || undefined;
  res.status(status).json({
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  });
};
