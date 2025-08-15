// middleware/corsMiddleware.js
// CORS middleware using config

const cors = require('cors');
const { CORS_OPTIONS } = require('../config/security');

module.exports = cors(CORS_OPTIONS);
