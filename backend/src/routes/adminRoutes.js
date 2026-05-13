const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllBookings,
  getPlatformStats,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All admin routes are protected — must be logged in AND be an admin
const adminOnly = [authenticateToken, authorizeRole('admin')];

// ─────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────

// Get all users (optional ?role=customer|vendor|admin filter)
router.get('/users', ...adminOnly, getAllUsers);

// Change a user's role
router.put('/users/:id/role', ...adminOnly, updateUserRole);

// Delete a user
router.delete('/users/:id', ...adminOnly, deleteUser);

// ─────────────────────────────────────────
// BOOKINGS OVERVIEW
// ─────────────────────────────────────────

// Get all bookings (optional ?status=pending|confirmed|completed|cancelled filter)
router.get('/bookings', ...adminOnly, getAllBookings);

// ─────────────────────────────────────────
// PLATFORM STATS
// ─────────────────────────────────────────

// Get platform-wide statistics
router.get('/stats', ...adminOnly, getPlatformStats);

module.exports = router;