const db = require('../config/db');

// Create a new invitation (customer invites a vendor to an event)
const createInvitation = async ({ event_id, vendor_id }) => {
  // Prevent duplicate invitations for same event+vendor
  const existing = await db.query(
    `SELECT * FROM event_invitations WHERE event_id = $1 AND vendor_id = $2`,
    [event_id, vendor_id]
  );
  if (existing.rows.length > 0) {
    throw new Error('Vendor has already been invited to this event');
  }

  const result = await db.query(
    `INSERT INTO event_invitations (event_id, vendor_id, status)
     VALUES ($1, $2, 'pending')
     RETURNING *`,
    [event_id, vendor_id]
  );
  return result.rows[0];
};

// Get all invitations for a specific event
const findInvitationsByEvent = async (event_id) => {
  const result = await db.query(
    `SELECT ei.*, 
            u.name AS vendor_name, 
            u.email AS vendor_email,
            vp.category AS vendor_category
     FROM event_invitations ei
     JOIN users u ON ei.vendor_id = u.id
     LEFT JOIN vendor_profiles vp ON ei.vendor_id = vp.user_id
     WHERE ei.event_id = $1
     ORDER BY ei.created_at DESC`,
    [event_id]
  );
  return result.rows;
};

// Get all invitations for a specific vendor
const findInvitationsByVendor = async (vendor_id) => {
  const result = await db.query(
    `SELECT ei.*, 
            e.title AS event_title,
            e.date AS event_date,
            e.location AS event_location,
            e.budget AS event_budget,
            u.name AS customer_name
     FROM event_invitations ei
     JOIN events e ON ei.event_id = e.id
     JOIN users u ON e.customer_id = u.id
     WHERE ei.vendor_id = $1
     ORDER BY ei.created_at DESC`,
    [vendor_id]
  );
  return result.rows;
};

// Get a single invitation by ID
const findInvitationById = async (id) => {
  const result = await db.query(
    `SELECT * FROM event_invitations WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Update invitation status (accept / reject)
const updateInvitationStatus = async (id, status) => {
  const result = await db.query(
    `UPDATE event_invitations SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

module.exports = {
  createInvitation,
  findInvitationsByEvent,
  findInvitationsByVendor,
  findInvitationById,
  updateInvitationStatus,
};