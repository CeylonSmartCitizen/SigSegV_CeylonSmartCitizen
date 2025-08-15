// utils/notificationFactory.js
// Factory for creating notification objects (DB, queue, etc.)

/**
 * Create a notification (mock: logs to console, extend for DB integration)
 * @param {Object} options - { type, userId, message, channel, meta }
 */
async function createNotification({ type, userId, message, channel = [], meta = {} }) {
  // Mock: log notification creation
  console.log(`[NOTIFICATION] User: ${userId} | Type: ${type} | Channels: ${channel.join(', ')} | Message: ${message}`);
  // TODO: Save to DB, push to queue, etc.
  return {
    id: Date.now(),
    type,
    userId,
    message,
    channel,
    meta,
    createdAt: new Date()
  };
}

export default { createNotification };
