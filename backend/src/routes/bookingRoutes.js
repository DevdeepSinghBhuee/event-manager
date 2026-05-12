const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getVendorBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────

// Create a booking
router.post('/', authenticateToken, authorizeRole('customer'), createBooking);

// Get all my bookings
router.get('/', authenticateToken, authorizeRole('customer'), getMyBookings);

// Cancel a booking
router.put('/:id/cancel', authenticateToken, authorizeRole('customer'), cancelBooking);

// ─────────────────────────────────────────
// VENDOR ROUTES
// ─────────────────────────────────────────

// Get all incoming bookings (vendor)
// NOTE: This must come BEFORE /:id to avoid Express treating "vendor" as an id
router.get('/vendor', authenticateToken, authorizeRole('vendor'), getVendorBookings);

// Vendor updates booking status (confirm / complete / cancel)
router.put('/:id/status', authenticateToken, authorizeRole('vendor'), updateBookingStatus);

// ─────────────────────────────────────────
// SHARED ROUTES (Customer + Vendor)
// ─────────────────────────────────────────

// Get single booking detail — both customer and vendor can view
router.get('/:id', authenticateToken, getBookingById);

module.exports = router;