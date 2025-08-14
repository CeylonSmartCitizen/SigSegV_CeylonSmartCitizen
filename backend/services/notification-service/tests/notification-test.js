import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testNotification() {
  // Create a new notification
  const newNotification = await prisma.notification.create({
    data: {
      userId: 1, // Change this to match a real user in your DB
      message: 'Test notification from script',
      read: false,
    },
  });
  console.log('Created:', newNotification);

  // Fetch all notifications for user
  const notifications = await prisma.notification.findMany({
    where: { userId: 1 },
  });
  console.log('User notifications:', notifications);
}

testNotification()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
