// services/queueNotificationService.js
// Triggers notifications for queue position updates and when user is called

const { createNotification } = require('../../notification-service/src/utils/notificationFactory');
const { sendEmail } = require('../../notification-service/src/utils/sendEmail');
const { sendSMS } = require('../../notification-service/src/utils/sendSMS');

/**
 * Notify user of queue position update
 * @param {Object} entry - { id, appointment_id, userId, userName, userEmail, userPhone, position, status }
 */
async function notifyQueuePositionUpdate(entry) {
  const message = `Your queue position has changed. New position: ${entry.position}`;
  await createNotification({
    type: 'queue',
    userId: entry.userId,
    message,
    channel: ['email', 'sms'],
    meta: entry
  });
  await sendEmail({
    to: entry.userEmail,
    subject: 'Queue Position Update',
    template: 'queue',
    context: { recipientName: entry.userName, details: `New position: ${entry.position}` }
  });
  sendSMS({
    type: 'queue',
    recipientName: entry.userName,
    recipientNumber: entry.userPhone,
    details: `New position: ${entry.position}`
  });
}

/**
 * Notify user when they are called to the counter
 * @param {Object} entry - { id, appointment_id, userId, userName, userEmail, userPhone, position, status }
 */
async function notifyUserCalled(entry) {
  const message = `You are now being called to the counter. Please proceed.`;
  await createNotification({
    type: 'queue',
    userId: entry.userId,
    message,
    channel: ['email', 'sms'],
    meta: entry
  });
  await sendEmail({
    to: entry.userEmail,
    subject: 'You Are Being Called',
    template: 'queue',
    context: { recipientName: entry.userName, details: 'Please proceed to the counter.' }
  });
  sendSMS({
    type: 'queue',
    recipientName: entry.userName,
    recipientNumber: entry.userPhone,
    details: 'Please proceed to the counter.'
  });
}

module.exports = {
  notifyQueuePositionUpdate,
  notifyUserCalled
};
