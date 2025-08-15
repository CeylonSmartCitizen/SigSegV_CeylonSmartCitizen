const { PrismaClient } = require('@prisma/client');
const notificationService = require('../../notification-service/src/services/notificationService');
const prisma = new PrismaClient();

async function createNotification(data) {
  return await prisma.notification.create({ data });
}

async function getUserNotifications(userId) {
  return await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });
}

async function markAsRead(notificationId) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read_at: new Date() }
  });
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
  return await prisma.notification.findMany({
    orderBy: { created_at: 'desc' }
  });
}

async function deleteNotification(notificationId) {
  return await prisma.notification.delete({
    where: { id: notificationId }
  });
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  sendAppointmentConfirmationNotification,
  getAllNotifications,
  deleteNotification
};
