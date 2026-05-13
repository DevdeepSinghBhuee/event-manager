const db = require('../config/db');

// ─────────────────────────────────────────
// GET /api/admin/users
// Get all users with optional role filter
// ─────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let query = `
      SELECT id, name, email, role, avatar_url, created_at
      FROM users
    `;
    const params = [];

    if (role) {
      query += ` WHERE role = $1`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);

    res.status(200).json({
      total: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// PUT /api/admin/users/:id/role
// Change a user's role
// ─────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'vendor', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Role must be one of: customer, vendor, admin',
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      return res.status(400).json({
        message: 'You cannot change your own role',
      });
    }

    const result = await db.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: `User role updated to ${role}`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// DELETE /api/admin/users/:id
// Delete a user from the platform
// ─────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Check user exists first
    const userCheck = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete in correct order to respect foreign key constraints
    await db.query(`DELETE FROM notifications WHERE user_id = $1`, [id]);
    await db.query(`DELETE FROM reviews WHERE customer_id = $1 OR vendor_id = $1`, [id]);
    await db.query(`DELETE FROM payments WHERE booking_id IN (
      SELECT id FROM bookings WHERE customer_id = $1 OR vendor_id = $1
    )`, [id]);
    await db.query(`DELETE FROM bookings WHERE customer_id = $1 OR vendor_id = $1`, [id]);
    await db.query(`DELETE FROM event_invitations WHERE vendor_id = $1`, [id]);
    await db.query(`DELETE FROM services WHERE vendor_id = $1`, [id]);
    await db.query(`DELETE FROM vendor_profiles WHERE user_id = $1`, [id]);
    await db.query(`DELETE FROM events WHERE customer_id = $1`, [id]);

    // Now safe to delete the user
    await db.query(`DELETE FROM users WHERE id = $1`, [id]);

    res.status(200).json({
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/admin/bookings
// Get all bookings platform-wide with filters
// ─────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT b.*,
             e.title AS event_title,
             s.title AS service_title,
             s.price AS service_price,
             cu.name AS customer_name,
             cu.email AS customer_email,
             vu.name AS vendor_name,
             vu.email AS vendor_email
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN services s ON b.service_id = s.id
      JOIN users cu ON b.customer_id = cu.id
      JOIN users vu ON b.vendor_id = vu.id
    `;
    const params = [];

    if (status) {
      query += ` WHERE b.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await db.query(query, params);

    res.status(200).json({
      total: result.rows.length,
      bookings: result.rows,
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/admin/stats
// Platform-wide statistics dashboard
// ─────────────────────────────────────────
const getPlatformStats = async (req, res) => {
  try {
    // Users stats
    const usersResult = await db.query(`
      SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'customer') AS total_customers,
        COUNT(*) FILTER (WHERE role = 'vendor') AS total_vendors,
        COUNT(*) FILTER (WHERE role = 'admin') AS total_admins
      FROM users
    `);

    // Bookings stats
    const bookingsResult = await db.query(`
      SELECT
        COUNT(*) AS total_bookings,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_bookings
      FROM bookings
    `);

    // Revenue stats (from completed payments)
    const revenueResult = await db.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS total_revenue,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_payments,
        COUNT(*) FILTER (WHERE status = 'partial') AS partial_payments,
        COUNT(*) FILTER (WHERE status = 'refunded') AS refunded_payments
      FROM payments
    `);

    // Events stats
    const eventsResult = await db.query(`
      SELECT
        COUNT(*) AS total_events,
        COUNT(*) FILTER (WHERE status = 'planned') AS planned_events,
        COUNT(*) FILTER (WHERE status = 'ongoing') AS ongoing_events,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_events
      FROM events
    `);

    // Reviews stats
    const reviewsResult = await db.query(`
      SELECT
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating)::numeric, 1) AS platform_average_rating
      FROM reviews
    `);

    // Services stats
    const servicesResult = await db.query(`
      SELECT COUNT(*) AS total_services FROM services
    `);

    res.status(200).json({
      users: usersResult.rows[0],
      bookings: bookingsResult.rows[0],
      revenue: revenueResult.rows[0],
      events: eventsResult.rows[0],
      reviews: reviewsResult.rows[0],
      services: servicesResult.rows[0],
    });
  } catch (error) {
    console.error('getPlatformStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllBookings,
  getPlatformStats,
};