const db = require('../config/database');

async function createNotification(data) {
  // Accept both snake_case and camelCase fields from incoming payloads
  const userId = data.user_id || data.userId;
  const appointmentId = data.appointment_id || data.appointmentId || null;
  const title = data.title || (data.type ? String(data.type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Notification');
  const message = data.message || data.msg || '';
  const type = data.type || 'general';
  const channel = data.channel || 'app';
  const priority = data.priority || 'medium';

  const insertQuery = `
    INSERT INTO notifications (
      user_id, appointment_id, title, message, type, channel, priority
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [userId, appointmentId, title, message, type, channel, priority];
  try {
    const result = await db.query(insertQuery, values);
    const notification = result.rows[0];
    // Audit log: notification creation
    const { logAuditEvent } = require('../../../audit-service/src/services/auditLogService');
    await logAuditEvent({
      user_id: notification.user_id,
      action: 'notification_created',
      entity_type: 'notification',
      entity_id: notification.id,
      new_values: notification,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
      success: true
    });
    return notification;
  } catch (error) {
    // Audit log: failed notification creation
    const { logAuditEvent } = require('../../../audit-service/src/services/auditLogService');
    await logAuditEvent({
      user_id: data.user_id,
      action: 'notification_creation_failed',
      entity_type: 'notification',
      entity_id: null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
      success: false,
      error_message: error.message
    });
    throw new Error('Failed to create notification: ' + error.message);
  }
}

async function getUserNotifications(userId) {
  const result = await db.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function markAsRead(notificationId) {
  // Fetch old notification for audit
  const oldResult = await db.query('SELECT * FROM notifications WHERE id = $1', [notificationId]);
  const oldNotification = oldResult.rows[0];
  const result = await db.query(
    'UPDATE notifications SET read_at = NOW() WHERE id = $1 RETURNING *',
    [notificationId]
  );
  const newNotification = result.rows[0];
  // Audit log: notification read
  const { logAuditEvent } = require('../../../audit-service/src/services/auditLogService');
  await logAuditEvent({
    user_id: newNotification ? newNotification.user_id : null,
    action: 'notification_read',
    entity_type: 'notification',
    entity_id: notificationId,
    old_values: oldNotification,
    new_values: newNotification,
    success: true
  });
  return newNotification;
}

// Send appointment confirmation notification
async function sendAppointmentConfirmationNotification({ user_id, appointment_id, service_name, appointment_date }) {
  return await createNotification({
    user_id,
    appointment_id,
    title: 'Appointment Confirmed',
    message: `Your appointment for ${service_name} on ${appointment_date} is confirmed.`,
    type: 'appointment_reminder',
    channel: 'app',
    priority: 'high'
  });
}

async function getAllNotifications() {
  const result = await db.query(
    'SELECT * FROM notifications ORDER BY created_at DESC'
  );
  return result.rows;
}

async function deleteNotification(notificationId) {
  await db.query('DELETE FROM notifications WHERE id = $1', [notificationId]);
  return { id: notificationId };
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  sendAppointmentConfirmationNotification,
  getAllNotifications,
  deleteNotification
};
