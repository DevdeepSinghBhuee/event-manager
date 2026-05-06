const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const authRoutes = require('./src/routes/authRoutes');

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CLIENT_URL })); // Allow frontend access
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running smoothly' });
});
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});