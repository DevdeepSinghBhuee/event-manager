const db = require('../config/db');

const Vendor = {
    // Create or Update a vendor profile
    upsertProfile: async (userId, bio, category, location, portfolioUrl) => {
        const query = `
            INSERT INTO vendor_profiles (user_id, bio, category, location, portfolio_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                bio = EXCLUDED.bio,
                category = EXCLUDED.category,
                location = EXCLUDED.location,
                portfolio_url = EXCLUDED.portfolio_url
            RETURNING *;
        `;
        const values = [userId, bio, category, location, portfolioUrl];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Get a specific vendor profile by User ID
    findByUserId: async (userId) => {
        const query = 'SELECT * FROM vendor_profiles WHERE user_id = $1;';
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    },

    // Get all vendors (for the marketplace)
    findAll: async () => {
        const query = `
            SELECT u.name, u.email, vp.* FROM users u 
            JOIN vendor_profiles vp ON u.id = vp.user_id 
            WHERE u.role = 'vendor';
        `;
        const { rows } = await db.query(query);
        return rows;
    }
};

module.exports = Vendor;