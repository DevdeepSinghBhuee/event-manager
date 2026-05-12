const bookingModel = require('../models/bookingModel');
const eventModel = require('../models/eventModel');

// ─────────────────────────────────────────
// POST /api/bookings
// Customer creates a booking
// ─────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { event_id, service_id, vendor_id, booked_date } = req.body;

    // Validate required fields
    if (!event_id || !service_id || !vendor_id || !booked_date) {
      return res.status(400).json({
        message: 'event_id, service_id, vendor_id and booked_date are all required',
      });
    }

    // Make sure the event belongs to this customer
    const event = await eventModel.findEventById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.customer_id !== customer_id) {
      return res.status(403).json({ message: 'You can only book services for your own events' });
    }

    // Check for conflicts — vendor already booked on this date?
    const conflict = await bookingModel.checkConflict({ vendor_id, booked_date });
    if (conflict) {
      return res.status(409).json({
        message: 'This vendor is already booked on the selected date. Please choose a different date.',
      });
    }

    const booking = await bookingModel.createBooking({
      event_id,
      service_id,
      customer_id,
      vendor_id,
      booked_date,
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/bookings
// Customer sees their own bookings
// ─────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.findBookingsByCustomer(req.user.id);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('getMyBookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/bookings/vendor
// Vendor sees all their incoming bookings
// ─────────────────────────────────────────
const getVendorBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.findBookingsByVendor(req.user.id);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('getVendorBookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/bookings/:id
// Customer or Vendor can view a booking detail
// ─────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the customer or vendor involved can view this booking
    const userId = req.user.id;
    if (booking.customer_id !== userId && booking.vendor_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// PUT /api/bookings/:id/status
// Vendor confirms or cancels a booking
// ─────────────────────────────────────────
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the vendor of this booking can update its status
    if (booking.vendor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    const validStatuses = ['confirmed', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Status must be one of: confirmed, completed, cancelled',
      });
    }

    // Cannot change status of an already cancelled booking
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update a cancelled booking' });
    }

    const updated = await bookingModel.updateBookingStatus(req.params.id, status);
    res.status(200).json({ message: `Booking ${status}`, booking: updated });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// PUT /api/bookings/:id/cancel
// Customer cancels their own booking
// ─────────────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the customer who made the booking can cancel it
    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only cancel pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot cancel a booking that is already ${booking.status}`,
      });
    }

    const updated = await bookingModel.updateBookingStatus(req.params.id, 'cancelled');
    res.status(200).json({ message: 'Booking cancelled successfully', booking: updated });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getVendorBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};