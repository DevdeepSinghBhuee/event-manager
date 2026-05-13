const paymentModel = require('../models/paymentModel');
const bookingModel = require('../models/bookingModel');

// Helper — generate a fake transaction reference
const generateTransactionRef = () => {
  return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// ─────────────────────────────────────────
// POST /api/payments
// Customer initiates a payment for a booking
// ─────────────────────────────────────────
const initiatePayment = async (req, res) => {
  try {
    const { booking_id, amount } = req.body;
    const customer_id = req.user.id;

    if (!booking_id || !amount) {
      return res.status(400).json({ message: 'booking_id and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Verify the booking exists and belongs to this customer
    const booking = await bookingModel.findBookingById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.customer_id !== customer_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only pay for confirmed bookings
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        message: 'You can only make payments for confirmed bookings',
      });
    }

    // Check if payment already exists for this booking
    const existingPayment = await paymentModel.findPaymentByBookingId(booking_id);
    if (existingPayment) {
      return res.status(409).json({
        message: 'A payment already exists for this booking. Use the partial payment endpoint to add more.',
        payment: existingPayment,
      });
    }

    // Cannot pay more than the service price
    if (amount > booking.service_price) {
      return res.status(400).json({
        message: `Amount cannot exceed the service price of ${booking.service_price}`,
      });
    }

    const transaction_ref = generateTransactionRef();

    // Determine status based on amount paid
    const status = amount >= booking.service_price ? 'completed' : 'partial';

    const payment = await paymentModel.createPayment({
      booking_id,
      amount,
      transaction_ref,
    });

    // Update payment status
    const updatedPayment = await paymentModel.updatePayment(payment.id, { status });

    // If fully paid, mark the booking as completed
    if (status === 'completed') {
      await bookingModel.updateBookingStatus(booking_id, 'completed');
    }

    res.status(201).json({
      message: `Payment ${status === 'completed' ? 'completed' : 'partially recorded'} successfully`,
      payment: updatedPayment,
      transaction_ref,
    });
  } catch (error) {
    console.error('initiatePayment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// POST /api/payments/:id/partial
// Customer adds a partial payment on top of existing
// ─────────────────────────────────────────
const makePartialPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const customer_id = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    const payment = await paymentModel.findPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Only the customer who owns the booking can add payments
    if (payment.customer_id !== customer_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Cannot add payment if already fully paid or refunded
    if (payment.status === 'completed') {
      return res.status(400).json({ message: 'This booking is already fully paid' });
    }
    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'Cannot add payment to a refunded booking' });
    }

    const newTotal = parseFloat(payment.amount) + parseFloat(amount);

    // Cannot exceed service price
    if (newTotal > payment.service_price) {
      const remaining = payment.service_price - parseFloat(payment.amount);
      return res.status(400).json({
        message: `Amount exceeds service price. You can only pay up to ${remaining} more.`,
      });
    }

    const status = newTotal >= payment.service_price ? 'completed' : 'partial';

    const updatedPayment = await paymentModel.updatePayment(payment.id, {
      amount: newTotal,
      status,
    });

    // If now fully paid, mark booking as completed
    if (status === 'completed') {
      await bookingModel.updateBookingStatus(payment.booking_id, 'completed');
    }

    res.status(200).json({
      message: `Partial payment recorded. ${status === 'completed' ? 'Booking is now fully paid!' : `Remaining balance: ${payment.service_price - newTotal}`}`,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('makePartialPayment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// POST /api/payments/:id/refund
// Customer requests a refund
// ─────────────────────────────────────────
const requestRefund = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const payment = await paymentModel.findPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.customer_id !== customer_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only refund if payment was made (partial or completed)
    if (payment.status === 'pending') {
      return res.status(400).json({ message: 'Cannot refund a payment that has not been made' });
    }
    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'This payment has already been refunded' });
    }

    const updatedPayment = await paymentModel.updatePayment(payment.id, {
      status: 'refunded',
    });

    // Also cancel the booking on refund
    await bookingModel.updateBookingStatus(payment.booking_id, 'cancelled');

    res.status(200).json({
      message: 'Refund processed successfully. Booking has been cancelled.',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('requestRefund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/payments/history
// Customer views full payment history
// ─────────────────────────────────────────
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await paymentModel.findPaymentsByCustomer(req.user.id);
    res.status(200).json({ payments });
  } catch (error) {
    console.error('getPaymentHistory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/payments/:bookingId
// Customer or Vendor views payment for a booking
// ─────────────────────────────────────────
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await paymentModel.findPaymentByBookingId(req.params.bookingId);

    if (!payment) {
      return res.status(404).json({ message: 'No payment found for this booking' });
    }

    const userId = req.user.id;
    if (payment.customer_id !== userId && payment.vendor_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ payment });
  } catch (error) {
    console.error('getPaymentByBooking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  initiatePayment,
  makePartialPayment,
  requestRefund,
  getPaymentHistory,
  getPaymentByBooking,
};