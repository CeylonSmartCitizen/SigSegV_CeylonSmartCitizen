// utils/sendSMS.js

const { formatSMSNotification } = require('./smsTemplates');

/**
 * Mock SMS sending function. Logs formatted SMS message to console.
 * @param {Object} options - { type, recipientName, recipientNumber, details }
 */
function sendSMS({ type, recipientName, recipientNumber, details }) {
  const message = formatSMSNotification({ type, recipientName, details });
  // Mock sending: log to console
  console.log(`[MOCK SMS] To: ${recipientNumber} | Message: ${message}`);
  // Optionally, return message for testing
  return message;
}

module.exports = { sendSMS };
