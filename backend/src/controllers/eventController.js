const notificationModel = require('../models/notificationModel');
const { getIO } = require('../config/socket');
const eventModel = require('../models/eventModel');
const invitationModel = require('../models/invitationModel');

// Helper — save to DB and emit via socket
const sendNotification = async (user_id, type, message) => {
  const notification = await notificationModel.createNotification({ user_id, type, message });
  try {
    getIO().to(user_id).emit('notification', notification);
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

// ─────────────────────────────────────────
// EVENT CRUD
// ─────────────────────────────────────────

// POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, budget } = req.body;
    const customer_id = req.user.id;

    if (!title || !date || !location) {
      return res.status(400).json({ message: 'Title, date, and location are required' });
    }

    const event = await eventModel.createEvent({
      customer_id,
      title,
      description,
      date,
      location,
      budget,
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('createEvent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/events
const getMyEvents = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const events = await eventModel.findEventsByCustomer(customer_id);
    res.status(200).json({ events });
  } catch (error) {
    console.error('getMyEvents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await eventModel.findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only the owner can view their event
    if (event.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Also attach invitations to the event detail
    const invitations = await invitationModel.findInvitationsByEvent(event.id);

    res.status(200).json({ event, invitations });
  } catch (error) {
    console.error('getEventById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await eventModel.findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, date, location, budget, status } = req.body;

    // Validate status if provided
    const validStatuses = ['planned', 'ongoing', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be planned, ongoing, or completed' });
    }

    const updated = await eventModel.updateEvent(req.params.id, {
      title,
      description,
      date,
      location,
      budget,
      status,
    });

    res.status(200).json({ message: 'Event updated successfully', event: updated });
  } catch (error) {
    console.error('updateEvent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await eventModel.findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await eventModel.deleteEvent(req.params.id);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('deleteEvent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// INVITATIONS
// ─────────────────────────────────────────

// POST /api/events/:id/invite
const inviteVendor = async (req, res) => {
  try {
    const event = await eventModel.findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.status(400).json({ message: 'vendor_id is required' });
    }

    const invitation = await invitationModel.createInvitation({
      event_id: event.id,
      vendor_id,
    });

    // Send response first
    res.status(201).json({ message: 'Vendor invited successfully', invitation });

    // Notify vendor about the invitation (after response)
    await sendNotification(
      vendor_id,
      'invitation',
      `You have been invited to the event "${event.title}"`
    );
  } catch (error) {
    // Catch the duplicate invitation error from model
    if (error.message === 'Vendor has already been invited to this event') {
      return res.status(409).json({ message: error.message });
    }
    console.error('inviteVendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/events/:id/invitations
const getEventInvitations = async (req, res) => {
  try {
    const event = await eventModel.findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const invitations = await invitationModel.findInvitationsByEvent(req.params.id);
    res.status(200).json({ invitations });
  } catch (error) {
    console.error('getEventInvitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/vendors/invitations  (vendor sees their own invitations)
const getMyInvitations = async (req, res) => {
  try {
    const vendor_id = req.user.id;
    const invitations = await invitationModel.findInvitationsByVendor(vendor_id);
    res.status(200).json({ invitations });
  } catch (error) {
    console.error('getMyInvitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/invitations/:id  (vendor accepts or rejects)
const respondToInvitation = async (req, res) => {
  try {
    const invitation = await invitationModel.findInvitationById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Only the invited vendor can respond
    if (invitation.vendor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only respond to pending invitations
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation has already been responded to' });
    }

    const { status } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }

    const updated = await invitationModel.updateInvitationStatus(req.params.id, status);

    res.status(200).json({ message: `Invitation ${status}`, invitation: updated });
  } catch (error) {
    console.error('respondToInvitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvent,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  inviteVendor,
  getEventInvitations,
  getMyInvitations,
  respondToInvitation,
};