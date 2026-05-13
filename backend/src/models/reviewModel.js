const db = require('../config/db');

// Create a new review
const createReview = async ({ booking_id, customer_id, vendor_id, rating, comment }) => {
  const result = await db.query(
    `INSERT INTO reviews (booking_id, customer_id, vendor_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [booking_id, customer_id, vendor_id, rating, comment]
  );
  return result.rows[0];
};

// Check if a review already exists for a booking
const findReviewByBookingId = async (booking_id) => {
  const result = await db.query(
    `SELECT * FROM reviews WHERE booking_id = $1`,
    [booking_id]
  );
  return result.rows[0];
};

// Get a single review by ID
const findReviewById = async (id) => {
  const result = await db.query(
    `SELECT * FROM reviews WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Get all reviews for a vendor (public)
const findReviewsByVendor = async (vendor_id) => {
  const result = await db.query(
    `SELECT r.*,
            u.name AS customer_name,
            u.avatar_url AS customer_avatar
     FROM reviews r
     JOIN users u ON r.customer_id = u.id
     WHERE r.vendor_id = $1
     ORDER BY r.created_at DESC`,
    [vendor_id]
  );
  return result.rows;
};

// Get all reviews submitted by a customer
const findReviewsByCustomer = async (customer_id) => {
  const result = await db.query(
    `SELECT r.*,
            u.name AS vendor_name,
            s.title AS service_title,
            e.title AS event_title
     FROM reviews r
     JOIN users u ON r.vendor_id = u.id
     JOIN bookings b ON r.booking_id = b.id
     JOIN services s ON b.service_id = s.id
     JOIN events e ON b.event_id = e.id
     WHERE r.customer_id = $1
     ORDER BY r.created_at DESC`,
    [customer_id]
  );
  return result.rows;
};

// Calculate average rating for a vendor
const getAverageRating = async (vendor_id) => {
  const result = await db.query(
    `SELECT 
       ROUND(AVG(rating)::numeric, 1) AS average_rating,
       COUNT(*) AS total_reviews
     FROM reviews
     WHERE vendor_id = $1`,
    [vendor_id]
  );
  return result.rows[0];
};

// Delete a review
const deleteReview = async (id) => {
  const result = await db.query(
    `DELETE FROM reviews WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createReview,
  findReviewByBookingId,
  findReviewById,
  findReviewsByVendor,
  findReviewsByCustomer,
  getAverageRating,
  deleteReview,
};