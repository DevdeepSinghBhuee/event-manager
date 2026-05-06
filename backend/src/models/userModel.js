const db = require('../config/db');

const User = {
    // Create a new user record
    create: async (name, email, passwordHash, role) => {
        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at;
        `;
        const values = [name, email, passwordHash, role];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Find a user by email for login/validation
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1;';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }
};

module.exports = User;