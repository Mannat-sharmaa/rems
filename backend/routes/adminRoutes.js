const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticateToken, authorize('Admin'));

// GET /api/admin/dashboard (Comprehensive KPI metrics & analytics charts)
router.get('/dashboard', async (req, res, next) => {
  try {
    // 1. Property Counts by Status
    const [propertyStats] = await db.query(
      `SELECT 
          COUNT(*) AS total_properties,
          SUM(CASE WHEN property_status = 'Available' THEN 1 ELSE 0 END) AS available_properties,
          SUM(CASE WHEN property_status = 'Booked' THEN 1 ELSE 0 END) AS booked_properties,
          SUM(CASE WHEN property_status = 'Sold' THEN 1 ELSE 0 END) AS sold_properties,
          SUM(CASE WHEN property_status = 'Rented' THEN 1 ELSE 0 END) AS rented_properties,
          SUM(CASE WHEN listing_type = 'Sale' THEN 1 ELSE 0 END) AS sale_listings,
          SUM(CASE WHEN listing_type = 'Rent' THEN 1 ELSE 0 END) AS rent_listings
       FROM properties`
    );

    // 2. Stakeholder Counts
    const [customerCount] = await db.query('SELECT COUNT(*) AS total_customers FROM customers');
    const [agentCount] = await db.query('SELECT COUNT(*) AS total_agents FROM agents');
    const [ownerCount] = await db.query('SELECT COUNT(*) AS total_owners FROM owners');

    // 3. Transactions & Financials
    const [bookingCount] = await db.query('SELECT COUNT(*) AS total_bookings FROM bookings');
    const [saleCount] = await db.query('SELECT COUNT(*) AS total_sales FROM sales WHERE sale_status = "Completed"');

    const [revenueStats] = await db.query(
      `SELECT 
          COALESCE(SUM(amount), 0) AS total_revenue
       FROM payments 
       WHERE payment_status = 'Completed'`
    );

    const [pendingPayments] = await db.query(
      `SELECT 
          COUNT(*) AS pending_count,
          COALESCE(SUM(amount), 0) AS pending_amount
       FROM payments 
       WHERE payment_status = 'Pending'`
    );

    // 4. Chart: Properties by Type
    const [byType] = await db.query(
      `SELECT pt.type_name, COUNT(p.property_id) AS count
       FROM property_types pt
       LEFT JOIN properties p ON pt.property_type_id = p.property_type_id
       GROUP BY pt.type_name
       ORDER BY count DESC`
    );

    // 5. Chart: Properties by City
    const [byCity] = await db.query(
      `SELECT city, COUNT(property_id) AS count
       FROM properties
       GROUP BY city
       ORDER BY count DESC
       LIMIT 6`
    );

    // 6. Chart: Monthly Sales
    const [monthlySales] = await db.query(
      `SELECT 
          DATE_FORMAT(sale_date, '%b %Y') AS month_label,
          COUNT(sale_id) AS sales_count,
          COALESCE(SUM(sale_price), 0) AS revenue
       FROM sales
       WHERE sale_status = 'Completed'
       GROUP BY DATE_FORMAT(sale_date, '%Y-%m'), DATE_FORMAT(sale_date, '%b %Y')
       ORDER BY DATE_FORMAT(sale_date, '%Y-%m') ASC
       LIMIT 12`
    );

    // 7. Recent Activity (Recent Bookings & Sales)
    const [recentBookings] = await db.query(
      `SELECT b.booking_id, b.booking_date, b.booking_amount, b.booking_status,
              c.name AS customer_name, p.title AS property_title, p.city
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN properties p ON b.property_id = p.property_id
       ORDER BY b.booking_date DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalProperties: propertyStats[0].total_properties,
        availableProperties: propertyStats[0].available_properties,
        bookedProperties: propertyStats[0].booked_properties,
        soldProperties: propertyStats[0].sold_properties,
        rentedProperties: propertyStats[0].rented_properties,
        totalCustomers: customerCount[0].total_customers,
        totalAgents: agentCount[0].total_agents,
        totalOwners: ownerCount[0].total_owners,
        totalBookings: bookingCount[0].total_bookings,
        totalSales: saleCount[0].total_sales,
        totalRevenue: revenueStats[0].total_revenue,
        pendingPaymentsCount: pendingPayments[0].pending_count,
        pendingPaymentsAmount: pendingPayments[0].pending_amount
      },
      charts: {
        byType,
        byCity,
        monthlySales
      },
      recentBookings
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users (List all users with role filter)
router.get('/users', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let sql = 'SELECT user_id, name, email, phone, role, address, created_at FROM users WHERE 1=1';
    const params = [];

    if (role && role !== 'All') {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (search && search.trim() !== '') {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY user_id DESC';
    const [users] = await db.query(sql, params);
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users (Create new user with role)
router.post('/users', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { name, email, phone, password, role = 'Customer', address, experience, commission_rate } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory user fields.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await connection.beginTransaction();

    const [userRes] = await connection.query(
      'INSERT INTO users (name, email, phone, password, role, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, role, address || null]
    );

    const userId = userRes.insertId;

    if (role === 'Customer') {
      await connection.query('INSERT INTO customers (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)', [userId, name, email, phone, address]);
    } else if (role === 'Agent') {
      await connection.query('INSERT INTO agents (user_id, name, email, phone, experience, commission_rate, address) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        userId, name, email, phone, experience || 1, commission_rate || 2.0, address
      ]);
    } else if (role === 'Owner') {
      await connection.query('INSERT INTO owners (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)', [userId, name, email, phone, address]);
    }

    await connection.commit();

    res.status(201).json({ success: true, message: `User created successfully with role ${role}.`, userId });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/admin/owners
router.get('/owners', async (req, res, next) => {
  try {
    const [owners] = await db.query(
      `SELECT o.owner_id, o.name, o.email, o.phone, o.address, o.created_at,
              COUNT(p.property_id) AS total_properties
       FROM owners o
       LEFT JOIN properties p ON o.owner_id = p.owner_id
       GROUP BY o.owner_id
       ORDER BY o.owner_id DESC`
    );
    res.json({ success: true, owners });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/agents
router.get('/agents', async (req, res, next) => {
  try {
    const [agents] = await db.query(
      `SELECT a.agent_id, a.name, a.email, a.phone, a.experience, a.commission_rate, a.address,
              COUNT(DISTINCT p.property_id) AS assigned_properties,
              COUNT(DISTINCT s.sale_id) AS completed_sales,
              COALESCE(SUM(s.commission_amount), 0) AS commission_earned
       FROM agents a
       LEFT JOIN properties p ON a.agent_id = p.agent_id
       LEFT JOIN sales s ON a.agent_id = s.agent_id
       GROUP BY a.agent_id
       ORDER BY a.agent_id DESC`
    );
    res.json({ success: true, agents });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/customers
router.get('/customers', async (req, res, next) => {
  try {
    const [customers] = await db.query(
      `SELECT c.customer_id, c.name, c.email, c.phone, c.address, c.created_at,
              COUNT(DISTINCT b.booking_id) AS total_bookings,
              COUNT(DISTINCT s.sale_id) AS total_purchases
       FROM customers c
       LEFT JOIN bookings b ON c.customer_id = b.customer_id
       LEFT JOIN sales s ON c.customer_id = s.customer_id
       GROUP BY c.customer_id
       ORDER BY c.customer_id DESC`
    );
    res.json({ success: true, customers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
