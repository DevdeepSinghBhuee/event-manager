const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { getMyInvitations, respondToInvitation } = require('../controllers/eventController');

// Public: Browse the marketplace
router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorDetails);

// Protected: Only vendors
router.post('/profile', authenticateToken, authorizeRole('vendor'), vendorController.updateProfile);
router.post('/services', authenticateToken, authorizeRole('vendor'), vendorController.addService);

// Vendor invitation routes
router.get('/invitations', authenticateToken, authorizeRole('vendor'), getMyInvitations);
router.put('/invitations/:id', authenticateToken, authorizeRole('vendor'), respondToInvitation);

module.exports = router;