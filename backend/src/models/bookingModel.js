const db = require('../config/db');

// Create a new booking
const createBooking = async ({ event_id, service_id, customer_id, vendor_id, booked_date }) => {
  const result = await db.query(
    `INSERT INTO bookings (event_id, service_id, customer_id, vendor_id, booked_date, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [event_id, service_id, customer_id, vendor_id, booked_date]
  );
  return result.rows[0];
};

// Check for booking conflicts
// A vendor cannot be booked for the same date if they already have a confirmed booking
const checkConflict = async ({ vendor_id, booked_date, exclude_booking_id = null }) => {
  let query = `
    SELECT * FROM bookings
    WHERE vendor_id = $1
      AND booked_date = $2
      AND status IN ('pending', 'confirmed')
  `;
  const params = [vendor_id, booked_date];

  // When updating, exclude the current booking from conflict check
  if (exclude_booking_id) {
    query += ` AND id != $3`;
    params.push(exclude_booking_id);
  }

  const result = await db.query(query, params);
  return result.rows.length > 0; // true = conflict exists
};

// Get all bookings for a customer
const findBookingsByCustomer = async (customer_id) => {
  const result = await db.query(
    `SELECT b.*,
            e.title AS event_title,
            e.date AS event_date,
            s.title AS service_title,
            s.price AS service_price,
            u.name AS vendor_name
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     JOIN services s ON b.service_id = s.id
     JOIN users u ON b.vendor_id = u.id
     WHERE b.customer_id = $1
     ORDER BY b.created_at DESC`,
    [customer_id]
  );
  return result.rows;
};

// Get all bookings for a vendor
const findBookingsByVendor = async (vendor_id) => {
  const result = await db.query(
    `SELECT b.*,
            e.title AS event_title,
            e.date AS event_date,
            s.title AS service_title,
            s.price AS service_price,
            u.name AS customer_name
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     JOIN services s ON b.service_id = s.id
     JOIN users u ON b.customer_id = u.id
     WHERE b.vendor_id = $1
     ORDER BY b.created_at DESC`,
    [vendor_id]
  );
  return result.rows;
};

// Get a single booking by ID (with full details)
const findBookingById = async (id) => {
  const result = await db.query(
    `SELECT b.*,
            e.title AS event_title,
            e.date AS event_date,
            e.location AS event_location,
            s.title AS service_title,
            s.price AS service_price,
            s.category AS service_category,
            cu.name AS customer_name,
            cu.email AS customer_email,
            vu.name AS vendor_name,
            vu.email AS vendor_email
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     JOIN services s ON b.service_id = s.id
     JOIN users cu ON b.customer_id = cu.id
     JOIN users vu ON b.vendor_id = vu.id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0];
};

// Update booking status
const updateBookingStatus = async (id, status) => {
  const result = await db.query(
    `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

module.exports = {
  createBooking,
  checkConflict,
  findBookingsByCustomer,
  findBookingsByVendor,
  findBookingById,
  updateBookingStatus,
};