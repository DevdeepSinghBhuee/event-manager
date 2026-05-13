const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All notification routes are protected
// Any role can access their own notifications

// Get all my notifications + unread count
router.get('/', authenticateToken, getMyNotifications);

// Mark all as read
// NOTE: must come BEFORE /:id to avoid Express treating "read-all" as an id
router.put('/read-all', authenticateToken, markAllAsRead);

// Mark single notification as read
router.put('/:id/read', authenticateToken, markAsRead);

module.exports = router;