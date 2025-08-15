// utils/smsTemplates.js

function formatSMSNotification({ type, recipientName, details }) {
  switch (type) {
    case 'appointment':
      return `Dear ${recipientName}, your appointment is confirmed. Details: ${details}`;
    case 'queue':
      return `Hi ${recipientName}, your queue status has changed. Details: ${details}`;
    case 'document':
      return `Hello ${recipientName}, your document is ready. Details: ${details}`;
    case 'system':
      return `System Alert: ${details}`;
    default:
      return `Notification: ${details}`;
  }
}

module.exports = { formatSMSNotification };
