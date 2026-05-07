const db = require('../config/db');

const Service = {
    // Create a new service for a vendor
    create: async (vendorId, title, description, price, category) => {
        const query = `
            INSERT INTO services (vendor_id, title, description, price, category)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [vendorId, title, description, price, category];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Get all services belonging to a specific vendor
    findByVendor: async (vendorId) => {
        const query = 'SELECT * FROM services WHERE vendor_id = $1 ORDER BY created_at DESC;';
        const { rows } = await db.query(query, [vendorId]);
        return rows;
    }
};

module.exports = Service;