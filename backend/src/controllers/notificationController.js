const notificationModel = require('../models/notificationModel');

// ─────────────────────────────────────────
// GET /api/notifications
// Get all notifications for logged in user
// ─────────────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.findNotificationsByUser(req.user.id);
    const unread_count = await notificationModel.getUnreadCount(req.user.id);

    res.status(200).json({ notifications, unread_count });
  } catch (error) {
    console.error('getMyNotifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// PUT /api/notifications/:id/read
// Mark a single notification as read
// ─────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notification = await notificationModel.markAsRead(req.params.id, req.user.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// PUT /api/notifications/read-all
// Mark all notifications as read
// ─────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.markAllAsRead(req.user.id);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};