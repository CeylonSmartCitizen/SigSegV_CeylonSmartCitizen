// services/documentNotificationService.js
// Triggers notifications for document verification status updates

const { createNotification } = require('../../notification-service/src/utils/notificationFactory');
const { sendEmail } = require('../../notification-service/src/utils/sendEmail');
const { sendSMS } = require('../../notification-service/src/utils/sendSMS');

/**
 * Notify user of document verification status change
 * @param {Object} doc - { id, userId, userName, userEmail, userPhone, status, details }
 */
async function notifyDocumentStatusUpdate(doc) {
  const message = `Your document verification status has changed: ${doc.status}. Details: ${doc.details}`;
  await createNotification({
    type: 'document',
    userId: doc.userId,
    message,
    channel: ['email', 'sms'],
    meta: doc
  });
  await sendEmail({
    to: doc.userEmail,
    subject: 'Document Verification Status',
    template: 'document',
    context: { recipientName: doc.userName, details: `Status: ${doc.status}. ${doc.details}` }
  });
  sendSMS({
    type: 'document',
    recipientName: doc.userName,
    recipientNumber: doc.userPhone,
    details: `Status: ${doc.status}. ${doc.details}`
  });
}

module.exports = {
  notifyDocumentStatusUpdate
};
