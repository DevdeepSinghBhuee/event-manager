const express = require('express');
const router = express.Router();
const {
  createEvent,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  inviteVendor,
  getEventInvitations,
  getMyInvitations,
  respondToInvitation,
} = require('../controllers/eventController');

const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// EVENT ROUTES (Customer only)
// ─────────────────────────────────────────
router.post('/', authenticateToken, authorizeRole('customer'), createEvent);
router.get('/', authenticateToken, authorizeRole('customer'), getMyEvents);
router.get('/:id', authenticateToken, authorizeRole('customer'), getEventById);
router.put('/:id', authenticateToken, authorizeRole('customer'), updateEvent);
router.delete('/:id', authenticateToken, authorizeRole('customer'), deleteEvent);

// ─────────────────────────────────────────
// INVITATION ROUTES
// ─────────────────────────────────────────

// Customer invites a vendor to their event
router.post('/:id/invite', authenticateToken, authorizeRole('customer'), inviteVendor);

// Customer views all invitations for their event
router.get('/:id/invitations', authenticateToken, authorizeRole('customer'), getEventInvitations);

module.exports = router;