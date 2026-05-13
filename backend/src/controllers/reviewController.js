const reviewModel = require('../models/reviewModel');
const bookingModel = require('../models/bookingModel');

// ─────────────────────────────────────────
// POST /api/reviews
// Customer submits a review after completed booking
// ─────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { booking_id, rating, comment } = req.body;

    // Validate required fields
    if (!booking_id || !rating) {
      return res.status(400).json({ message: 'booking_id and rating are required' });
    }

    // Validate rating range
    if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
    }

    // Verify booking exists and belongs to this customer
    const booking = await bookingModel.findBookingById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.customer_id !== customer_id) {
      return res.status(403).json({ message: 'You can only review your own bookings' });
    }

    // Can only review completed bookings
    if (booking.status !== 'completed') {
      return res.status(400).json({
        message: 'You can only leave a review after the booking is completed',
      });
    }

    // Prevent duplicate reviews for same booking
    const existingReview = await reviewModel.findReviewByBookingId(booking_id);
    if (existingReview) {
      return res.status(409).json({
        message: 'You have already submitted a review for this booking',
      });
    }

    const review = await reviewModel.createReview({
      booking_id,
      customer_id,
      vendor_id: booking.vendor_id,
      rating: Number(rating),
      comment,
    });

    // Fetch updated average rating for the vendor
    const { average_rating, total_reviews } = await reviewModel.getAverageRating(booking.vendor_id);

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
      vendor_stats: {
        average_rating,
        total_reviews,
      },
    });
  } catch (error) {
    console.error('createReview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/reviews/vendor/:vendorId
// Public — get all reviews for a vendor with average rating
// ─────────────────────────────────────────
const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const reviews = await reviewModel.findReviewsByVendor(vendorId);
    const { average_rating, total_reviews } = await reviewModel.getAverageRating(vendorId);

    res.status(200).json({
      vendor_id: vendorId,
      average_rating,
      total_reviews,
      reviews,
    });
  } catch (error) {
    console.error('getVendorReviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/reviews/my
// Customer sees all their submitted reviews
// ─────────────────────────────────────────
const getMyReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.findReviewsByCustomer(req.user.id);
    res.status(200).json({ reviews });
  } catch (error) {
    console.error('getMyReviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// DELETE /api/reviews/:id
// Customer deletes their own review OR admin deletes any
// ─────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const review = await reviewModel.findReviewById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only the author or an admin can delete
    if (review.customer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await reviewModel.deleteReview(req.params.id);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getVendorReviews,
  getMyReviews,
  deleteReview,
};