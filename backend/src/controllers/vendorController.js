const Vendor = require('../models/vendorModel');
const Service = require('../models/serviceModel');

exports.updateProfile = async (req, res) => {
    try {
        // req.user comes from our authenticateToken middleware
        const userId = req.user.id;
        const role = req.user.role;

        // 1. Authorization Check
        if (role !== 'vendor') {
            return res.status(403).json({ message: 'Access denied. Only vendors can create profiles.' });
        }

        const { bio, category, location, portfolio_url } = req.body;

        // 2. Upsert (Update or Insert) the profile
        const profile = await Vendor.upsertProfile(userId, bio, category, location, portfolio_url);

        res.status(200).json({
            message: 'Vendor profile updated successfully',
            profile
        });
    } catch (error) {
      console.error('Vendor Profile Error:', error);
      // TEMPORARY: Send the real error to Postman for debugging
      res.status(500).json({ 
        message: 'Server error updating profile',
        error: error.message, 
        detail: error.detail 
     });
    }
};

exports.addService = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        // Security Check: Only vendors can list services
        if (role !== 'vendor') {
            return res.status(403).json({ message: 'Only vendors can add services.' });
        }

        const { title, description, price, category } = req.body;

        const newService = await Service.create(userId, title, description, price, category);

        res.status(201).json({
            message: 'Service added successfully',
            service: newService
        });
    } catch (error) {
        console.error('Add Service Error:', error);
        res.status(500).json({ message: 'Server error adding service' });
    }
};

// Get all vendors with their profile info
exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.findAll(); // This uses the JOIN we wrote in the model earlier
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marketplace' });
    }
};

// Get a specific vendor's full details (Profile + Services)
exports.getVendorDetails = async (req, res) => {
    try {
        const { id } = req.params; // The User ID of the vendor
        
        const profile = await Vendor.findByUserId(id);
        const services = await Service.findByVendor(id);

        if (!profile) return res.status(404).json({ message: 'Vendor not found' });

        res.status(200).json({ profile, services });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor details' });
    }
};