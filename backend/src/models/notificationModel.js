const db = require('../config/db');

// Create a new notification
const createNotification = async ({ user_id, type, message }) => {
  const result = await db.query(
    `INSERT INTO notifications (user_id, type, message, is_read)
     VALUES ($1, $2, $3, false)
     RETURNING *`,
    [user_id, type, message]
  );
  return result.rows[0];
};

// Get all notifications for a user (unread first)
const findNotificationsByUser = async (user_id) => {
  const result = await db.query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY is_read ASC, created_at DESC`,
    [user_id]
  );
  return result.rows;
};

// Get unread count for a user
const getUnreadCount = async (user_id) => {
  const result = await db.query(
    `SELECT COUNT(*) AS unread_count
     FROM notifications
     WHERE user_id = $1 AND is_read = false`,
    [user_id]
  );
  return parseInt(result.rows[0].unread_count);
};

// Mark a single notification as read
const markAsRead = async (id, user_id) => {
  const result = await db.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, user_id]
  );
  return result.rows[0];
};

// Mark all notifications as read for a user
const markAllAsRead = async (user_id) => {
  const result = await db.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1
     RETURNING *`,
    [user_id]
  );
  return result.rows;
};

module.exports = {
  createNotification,
  findNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};