// config/storage.js
// Centralized config for file storage paths and limits

const path = require('path');

module.exports = {
  UPLOADS_DIR: path.resolve(__dirname, '../../uploads/documents'),
  ALLOWED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};
