// services/systemNotificationService.js
// Broadcasts system-wide notifications for maintenance and announcements

const { createNotification } = require('../utils/notificationFactory');
const { sendEmail } = require('../utils/sendEmail');
const { sendSMS } = require('../utils/sendSMS');

/**
 * Broadcast a system-wide notification to all users
 * @param {Object} options - { message, subject, userList }
 * userList: Array of { userId, userName, userEmail, userPhone }
 */
async function broadcastSystemNotification({ message, subject, userList }) {
  for (const user of userList) {
    await createNotification({
      type: 'system',
      userId: user.userId,
      message,
      channel: ['email', 'sms'],
      meta: { subject }
    });
    await sendEmail({
      to: user.userEmail,
      subject: subject || 'System Announcement',
      template: 'system',
      context: { recipientName: user.userName, details: message }
    });
    sendSMS({
      type: 'system',
      recipientName: user.userName,
      recipientNumber: user.userPhone,
      details: message
    });
  }
}

module.exports = {
  broadcastSystemNotification
};
