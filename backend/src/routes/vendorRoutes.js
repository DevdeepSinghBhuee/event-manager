const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authenticateToken = require('../middleware/authMiddleware');

// Protected: Only logged-in vendors can update their profile
router.post('/profile', authenticateToken, vendorController.updateProfile);
router.post('/services', authenticateToken, vendorController.addService);

// Public: Browse the marketplace
router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorDetails);

// Protected: Only vendors can manage their stuff
router.post('/profile', authenticateToken, vendorController.updateProfile);
router.post('/services', authenticateToken, vendorController.addService);

module.exports = router;