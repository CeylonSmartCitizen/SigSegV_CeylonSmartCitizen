const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// Create notification
router.post('/', async (req, res) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create notification' });
  }
});

// List notifications by user
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.params.userId);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to mark notification as read' });
  }
});

module.exports = router;
