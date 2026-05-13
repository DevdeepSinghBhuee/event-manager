const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const vendorRoutes = require('./src/routes/vendorRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
require('dotenv').config();

const app = express();
const authRoutes = require('./src/routes/authRoutes');

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CLIENT_URL })); // Allow frontend access
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser
app.use('/api/vendors', vendorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running smoothly' });
});
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});