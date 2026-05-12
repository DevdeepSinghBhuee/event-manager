const db = require('../config/db');

// Create a new event
const createEvent = async ({ customer_id, title, description, date, location, budget }) => {
  const result = await db.query(
    `INSERT INTO events (customer_id, title, description, date, location, budget, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'planned')
     RETURNING *`,
    [customer_id, title, description, date, location, budget]
  );
  return result.rows[0];
};

// Get all events for a specific customer
const findEventsByCustomer = async (customer_id) => {
  const result = await db.query(
    `SELECT * FROM events WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customer_id]
  );
  return result.rows;
};

// Get a single event by ID
const findEventById = async (id) => {
  const result = await db.query(
    `SELECT * FROM events WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Update an event
const updateEvent = async (id, { title, description, date, location, budget, status }) => {
  const result = await db.query(
    `UPDATE events
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         date = COALESCE($3, date),
         location = COALESCE($4, location),
         budget = COALESCE($5, budget),
         status = COALESCE($6, status)
     WHERE id = $7
     RETURNING *`,
    [title, description, date, location, budget, status, id]
  );
  return result.rows[0];
};

// Delete an event
const deleteEvent = async (id) => {
  const result = await db.query(
    `DELETE FROM events WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createEvent,
  findEventsByCustomer,
  findEventById,
  updateEvent,
  deleteEvent,
};