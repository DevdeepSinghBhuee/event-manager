const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  makePartialPayment,
  requestRefund,
  getPaymentHistory,
  getPaymentByBooking,
} = require('../controllers/paymentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────

// Initiate a payment for a booking
router.post('/', authenticateToken, authorizeRole('customer'), initiatePayment);

// Get full payment history
// NOTE: must come BEFORE /:bookingId to avoid Express treating "history" as a bookingId
router.get('/history', authenticateToken, authorizeRole('customer'), getPaymentHistory);

// Add a partial payment on top of existing payment
router.post('/:id/partial', authenticateToken, authorizeRole('customer'), makePartialPayment);

// Request a refund
router.post('/:id/refund', authenticateToken, authorizeRole('customer'), requestRefund);

// ─────────────────────────────────────────
// SHARED ROUTES (Customer + Vendor)
// ─────────────────────────────────────────

// Get payment details for a specific booking
router.get('/:bookingId', authenticateToken, getPaymentByBooking);

module.exports = router;