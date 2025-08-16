// src/middleware/validation.js
// Express-validator middleware for appointment endpoints
const { body, param, query, validationResult } = require('express-validator');

const validateCreateAppointment = [
  body('service_id').isUUID().withMessage('Invalid service_id'),
  body('preferred_date').isISO8601().withMessage('Invalid preferred_date'),
  body('preferred_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid preferred_time'),
  body('notes').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() }, timestamp: new Date().toISOString() });
    }
    next();
  }
];

const validateUpdateAppointment = [
  param('id').isUUID().withMessage('Invalid appointment id'),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']),
  body('appointment_date').optional().isISO8601(),
  body('appointment_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
  body('notes').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() }, timestamp: new Date().toISOString() });
    }
    next();
  }
];

module.exports = {
  validateCreateAppointment,
  validateUpdateAppointment
};
