const express = require('express');
const router = express.Router();

// Mock notification storage (in production, this would use database)
let notifications = [];
let notificationId = 1;

// Basic routes for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'Notifications API is working', 
    endpoints: ['/', '/user/:userId', '/:id/read', '/:id'],
    version: '1.0.0'
  });
});

// POST /notifications - create a notification
router.post('/', async (req, res) => {
  try {
    const { userId, message, type, title } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }
    
    const notification = {
      id: notificationId++,
      userId,
      message,
      type: type || 'info',
      title: title || 'Notification',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notifications.push(notification);
    res.status(201).json({
      ...notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// GET /notifications/user/:userId - list notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userNotifications = notifications.filter(n => n.userId == userId);
    
    res.json({
      notifications: userNotifications,
      count: userNotifications.length,
      unreadCount: userNotifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /notifications/:id - get a specific notification
router.get('/:id', async (req, res) => {
  try {
    const notification = notifications.find(n => n.id == req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// PATCH /notifications/:id/read - mark a notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(n => n.id == req.params.id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notifications[notificationIndex].isRead = true;
    notifications[notificationIndex].readAt = new Date().toISOString();
    notifications[notificationIndex].updatedAt = new Date().toISOString();
    
    res.json({
      ...notifications[notificationIndex],
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// GET /notifications - list all notifications (admin/debug)
router.get('/all', async (req, res) => {
  try {
    const { limit = 50, offset = 0, type, userId } = req.query;
    
    let filtered = notifications;
    
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }
    
    if (userId) {
      filtered = filtered.filter(n => n.userId == userId);
    }
    
    const paginatedNotifications = filtered
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      notifications: paginatedNotifications,
      total: filtered.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// DELETE /notifications/:id - delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(n => n.id == req.params.id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    
    res.json({
      ...deletedNotification,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// PATCH /notifications/user/:userId/read-all - mark all notifications as read for a user
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedCount = notifications
      .filter(n => n.userId == userId && !n.isRead)
      .map(n => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
        n.updatedAt = new Date().toISOString();
        return n;
      }).length;
    
    res.json({
      message: `${updatedCount} notifications marked as read`,
      updatedCount: updatedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
