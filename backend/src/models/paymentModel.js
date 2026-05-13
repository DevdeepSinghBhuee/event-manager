const db = require('../config/db');

// Create a new payment record for a booking
const createPayment = async ({ booking_id, amount, transaction_ref }) => {
  const result = await db.query(
    `INSERT INTO payments (booking_id, amount, status, transaction_ref)
     VALUES ($1, $2, 'pending', $3)
     RETURNING *`,
    [booking_id, amount, transaction_ref]
  );
  return result.rows[0];
};

// Get payment by booking ID
const findPaymentByBookingId = async (booking_id) => {
  const result = await db.query(
    `SELECT p.*,
            b.status AS booking_status,
            b.customer_id,
            b.vendor_id,
            s.price AS service_price,
            s.title AS service_title
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     JOIN services s ON b.service_id = s.id
     WHERE p.booking_id = $1`,
    [booking_id]
  );
  return result.rows[0];
};

// Get payment by payment ID
const findPaymentById = async (id) => {
  const result = await db.query(
    `SELECT p.*,
            b.status AS booking_status,
            b.customer_id,
            b.vendor_id,
            s.price AS service_price,
            s.title AS service_title
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     JOIN services s ON b.service_id = s.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
};

// Get full payment history for a customer
const findPaymentsByCustomer = async (customer_id) => {
  const result = await db.query(
    `SELECT p.*,
            b.booked_date,
            s.title AS service_title,
            s.price AS service_price,
            e.title AS event_title,
            u.name AS vendor_name
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     JOIN services s ON b.service_id = s.id
     JOIN events e ON b.event_id = e.id
     JOIN users u ON b.vendor_id = u.id
     WHERE b.customer_id = $1
     ORDER BY p.created_at DESC`,
    [customer_id]
  );
  return result.rows;
};

// Update payment amount and status
const updatePayment = async (id, { amount, status }) => {
  const result = await db.query(
    `UPDATE payments
     SET amount = COALESCE($1, amount),
         status = COALESCE($2, status)
     WHERE id = $3
     RETURNING *`,
    [amount, status, id]
  );
  return result.rows[0];
};

module.exports = {
  createPayment,
  findPaymentByBookingId,
  findPaymentById,
  findPaymentsByCustomer,
  updatePayment,
};