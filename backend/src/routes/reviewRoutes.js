const express = require('express');
const router = express.Router();
const {
  createReview,
  getVendorReviews,
  getMyReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────

// Get all reviews for a vendor (shown on vendor profile)
router.get('/vendor/:vendorId', getVendorReviews);

// ─────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────

// Submit a review
router.post('/', authenticateToken, authorizeRole('customer'), createReview);

// Get my submitted reviews
// NOTE: must come BEFORE /:id to avoid Express treating "my" as an id
router.get('/my', authenticateToken, authorizeRole('customer'), getMyReviews);

// ─────────────────────────────────────────
// SHARED ROUTES (Customer + Admin)
// ─────────────────────────────────────────

// Delete a review
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;