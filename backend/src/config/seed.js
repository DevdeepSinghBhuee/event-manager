require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const seed = async () => {
  console.log('🌱 Starting seed...');

  try {
    // ─────────────────────────────────────────
    // CLEAN UP EXISTING DATA (order matters due to foreign keys)
    // ─────────────────────────────────────────
    console.log('🧹 Cleaning existing data...');
    await db.query(`DELETE FROM payments`);
    await db.query(`DELETE FROM bookings`);
    await db.query(`DELETE FROM event_invitations`);
    await db.query(`DELETE FROM events`);
    await db.query(`DELETE FROM services`);
    await db.query(`DELETE FROM vendor_profiles`);
    await db.query(`DELETE FROM users`);

    // ─────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const customerResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      ['Alice Customer', 'customer@test.com', hashedPassword, 'customer']
    );
    const customer = customerResult.rows[0];

    const vendorResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      ['Bob Vendor', 'vendor@test.com', hashedPassword, 'vendor']
    );
    const vendor = vendorResult.rows[0];

    const adminResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      ['Super Admin', 'admin@test.com', hashedPassword, 'admin']
    );
    const admin = adminResult.rows[0];

    // ─────────────────────────────────────────
    // VENDOR PROFILE
    // ─────────────────────────────────────────
    console.log('🏪 Creating vendor profile...');
    await db.query(
      `INSERT INTO vendor_profiles (user_id, bio, category, location)
       VALUES ($1, $2, $3, $4)`,
      [
        vendor.id,
        'Professional photographer with 10 years of experience',
        'photography',
        'Delhi',
      ]
    );

    // ─────────────────────────────────────────
    // SERVICES
    // ─────────────────────────────────────────
    console.log('🛠️  Creating services...');
    const service1Result = await db.query(
      `INSERT INTO services (vendor_id, title, description, price, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        vendor.id,
        'Wedding Photography',
        'Full day wedding photography with edited photos delivered within 2 weeks',
        25000,
        'photography',
      ]
    );
    const service1 = service1Result.rows[0];

    const service2Result = await db.query(
      `INSERT INTO services (vendor_id, title, description, price, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        vendor.id,
        'Birthday Party Photography',
        '4 hour photography session for birthday parties',
        8000,
        'photography',
      ]
    );
    const service2 = service2Result.rows[0];

    // ─────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────
    console.log('🎉 Creating events...');
    const event1Result = await db.query(
      `INSERT INTO events (customer_id, title, description, date, location, budget, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        customer.id,
        'Alice & John Wedding',
        'A grand wedding celebration',
        '2026-10-20',
        'Mumbai',
        200000,
        'planned',
      ]
    );
    const event1 = event1Result.rows[0];

    const event2Result = await db.query(
      `INSERT INTO events (customer_id, title, description, date, location, budget, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        customer.id,
        'Alice Birthday Bash',
        'My 30th birthday party',
        '2026-09-05',
        'Delhi',
        50000,
        'planned',
      ]
    );
    const event2 = event2Result.rows[0];

    // ─────────────────────────────────────────
    // INVITATIONS
    // ─────────────────────────────────────────
    console.log('💌 Creating invitations...');
    await db.query(
      `INSERT INTO event_invitations (event_id, vendor_id, status)
       VALUES ($1, $2, $3)`,
      [event1.id, vendor.id, 'accepted']
    );

    // ─────────────────────────────────────────
    // BOOKINGS
    // ─────────────────────────────────────────
    console.log('📋 Creating bookings...');

    // Booking 1 — PENDING (can be confirmed via Postman)
    const booking1Result = await db.query(
      `INSERT INTO bookings (event_id, service_id, customer_id, vendor_id, booked_date, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [event1.id, service1.id, customer.id, vendor.id, '2026-10-20', 'pending']
    );
    const booking1 = booking1Result.rows[0];

    // Booking 2 — CONFIRMED (ready for payment)
    const booking2Result = await db.query(
      `INSERT INTO bookings (event_id, service_id, customer_id, vendor_id, booked_date, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [event2.id, service2.id, customer.id, vendor.id, '2026-09-05', 'confirmed']
    );
    const booking2 = booking2Result.rows[0];

    // Booking 3 — COMPLETED with full payment
    const booking3Result = await db.query(
      `INSERT INTO bookings (event_id, service_id, customer_id, vendor_id, booked_date, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [event2.id, service2.id, customer.id, vendor.id, '2026-08-01', 'completed']
    );
    const booking3 = booking3Result.rows[0];

    // ─────────────────────────────────────────
    // PAYMENTS
    // ─────────────────────────────────────────
    console.log('💳 Creating payments...');

    // Payment for booking 2 — PARTIAL
    await db.query(
      `INSERT INTO payments (booking_id, amount, status, transaction_ref)
       VALUES ($1, $2, $3, $4)`,
      [booking2.id, 4000, 'partial', 'TXN-SEED-001']
    );

    // Payment for booking 3 — COMPLETED
    await db.query(
      `INSERT INTO payments (booking_id, amount, status, transaction_ref)
       VALUES ($1, $2, $3, $4)`,
      [booking3.id, 8000, 'completed', 'TXN-SEED-002']
    );

    // ─────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────
    console.log('\n✅ Seed completed successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('🔐 LOGIN CREDENTIALS (all use password123)');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Customer  → customer@test.com`);
    console.log(`🏪 Vendor    → vendor@test.com`);
    console.log(`🛡️  Admin     → admin@test.com`);
    console.log('═══════════════════════════════════════');
    console.log('📦 CREATED DATA');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Customer ID  : ${customer.id}`);
    console.log(`🏪 Vendor ID    : ${vendor.id}`);
    console.log(`🛡️  Admin ID     : ${admin.id}`);
    console.log(`🎉 Event 1 ID   : ${event1.id}  (Wedding)`);
    console.log(`🎉 Event 2 ID   : ${event2.id}  (Birthday)`);
    console.log(`🛠️  Service 1 ID : ${service1.id} (Wedding Photo - ₹25000)`);
    console.log(`🛠️  Service 2 ID : ${service2.id} (Birthday Photo - ₹8000)`);
    console.log(`📋 Booking 1 ID : ${booking1.id} (PENDING  - Wedding Photo)`);
    console.log(`📋 Booking 2 ID : ${booking2.id} (CONFIRMED - Birthday Photo, partial payment ₹4000)`);
    console.log(`📋 Booking 3 ID : ${booking3.id} (COMPLETED - Birthday Photo, fully paid ₹8000)`);
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();