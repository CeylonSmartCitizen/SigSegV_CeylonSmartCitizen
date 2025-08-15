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
  const result = await db.query(insertQuery, values);
  return result.rows[0];
}

async function getUserNotifications(userId) {
  const result = await db.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function markAsRead(notificationId) {
  const result = await db.query(
    'UPDATE notifications SET read_at = NOW() WHERE id = $1 RETURNING *',
    [notificationId]
  );
  return result.rows[0];
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
