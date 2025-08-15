const notificationService = require('../services/notificationService');

exports.createNotification = async (req, res) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create notification' });
  }
};

exports.listUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.user_id;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to mark notification as read' });
  }
};
