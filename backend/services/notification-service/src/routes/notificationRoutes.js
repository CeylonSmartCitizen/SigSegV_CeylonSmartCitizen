// Routes for notifications:
const express = require('express');
const router = express.Router();
const { prisma } = require('../app');
const notificationService = require('../services/notification-service');

// POST /notifications - create a notification with title, message, type
router.post('/', async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notification = await notificationService.createNotification({
      userId,
      message,
      type,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});
// GET /notifications/user/:userId - list notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.params.userId);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});
// PATCH /notifications/:id/read - mark a notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});
// GET /notifications - list all notifications (admin/debug)
router.get('/', async (req, res) => {
  try {
    const notifications = await notificationService.getAllNotifications();
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});
// DELETE /notifications/:id - delete a notification
router.delete('/:id', async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});
module.exports = router;
// Export the router to be used in the main app
module.exports = router;

// Simulate push notifications by storing them in the database
// and using Redis for real-time updates
// This allows the notification service to handle both persistent storage

// Mock email notifications using HTML/text templates
// and real-time updates via WebSocket or similar technologies
// This ensures users receive timely updates without overwhelming them with emails
// and provides a better user experience
// by allowing them to manage their notification preferences easily.

// Track notification history and delivery status
// to ensure users can see past notifications and their read/unread status
// This helps maintain a clear record of user interactions and improves the overall reliability of the notification system
// by allowing for better debugging and analytics.

// This router handles notification-related routes such as creating, fetching, and marking notifications as read.
// It uses the notificationService to interact with the database and perform operations.
// The routes are structured to allow easy integration with the main application and can be extended as needed



