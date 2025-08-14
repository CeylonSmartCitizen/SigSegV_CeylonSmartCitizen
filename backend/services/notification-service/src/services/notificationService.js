const { PrismaClient } = require('@prisma/client');
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

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead
};
