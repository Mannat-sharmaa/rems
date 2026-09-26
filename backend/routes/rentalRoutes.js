const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// POST /api/rentals (Customer rents a property)
router.post('/', authenticateToken, authorize('Customer'), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { property_id, start_date, end_date, months = 12 } = req.body;

    if (!property_id || !start_date) {
      return res.status(400).json({ success: false, message: 'Please provide property ID and lease start date.' });
    }

    const customerId = req.user.customerId;

    await connection.beginTransaction();

    const [props] = await connection.query(
      "SELECT property_id, title, price, agent_id, property_status, listing_type FROM properties WHERE property_id = ? FOR UPDATE",
      [property_id]
    );

    if (props.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const property = props[0];

    if (property.property_status !== 'Available') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: `Property is not available for rent. Current status: ${property.property_status}` });
    }

    const monthlyRent = property.price;
    const securityDeposit = monthlyRent * 2; // Standard 2-month deposit

    // Calculate end date if not provided
    let leaseEnd = end_date;
    if (!leaseEnd) {
      const d = new Date(start_date);
      d.setMonth(d.getMonth() + parseInt(months, 10));
      leaseEnd = d.toISOString().slice(0, 10);
    }

    const [rentalResult] = await connection.query(
      `INSERT INTO rentals (property_id, customer_id, agent_id, start_date, end_date, monthly_rent, security_deposit, rental_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [property_id, customerId, property.agent_id, start_date, leaseEnd, monthlyRent, securityDeposit]
    );

    // Update property status to Rented
    await connection.query(
      "UPDATE properties SET property_status = 'Rented' WHERE property_id = ?",
      [property_id]
    );

    // Notifications
    await connection.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        req.user.userId,
        'Rental Agreement Created',
        `Rental agreement for "${property.title}" is now active. Monthly rent: ₹${monthlyRent.toLocaleString('en-IN')}.`
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Rental agreement confirmed! Property status changed to Rented.',
      rentalId: rentalResult.insertId
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/rentals/my (Customer's active/expired rentals)
router.get('/my', authenticateToken, authorize('Customer'), async (req, res, next) => {
  try {
    const customerId = req.user.customerId;
    const [rentals] = await db.query(
      `SELECT 
          r.rental_id, r.start_date, r.end_date, r.monthly_rent, r.security_deposit, r.rental_status,
          p.property_id, p.title AS property_title, p.address, p.city, p.image_url,
          a.name AS agent_name, a.phone AS agent_phone
       FROM rentals r
       JOIN properties p ON r.property_id = p.property_id
       JOIN agents a ON r.agent_id = a.agent_id
       WHERE r.customer_id = ?
       ORDER BY r.start_date DESC`,
      [customerId]
    );
    res.json({ success: true, rentals });
  } catch (err) {
    next(err);
  }
});

// GET /api/rentals/agent (Agent's managed rentals)
router.get('/agent', authenticateToken, authorize('Agent'), async (req, res, next) => {
  try {
    const agentId = req.user.agentId;
    const [rentals] = await db.query(
      `SELECT 
          r.rental_id, r.start_date, r.end_date, r.monthly_rent, r.security_deposit, r.rental_status,
          p.property_id, p.title AS property_title, p.city,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone
       FROM rentals r
       JOIN properties p ON r.property_id = p.property_id
       JOIN customers c ON r.customer_id = c.customer_id
       WHERE r.agent_id = ?
       ORDER BY r.start_date DESC`,
      [agentId]
    );
    res.json({ success: true, rentals });
  } catch (err) {
    next(err);
  }
});

// GET /api/rentals (Admin view all rentals)
router.get('/', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const [rentals] = await db.query(
      `SELECT 
          r.rental_id, r.start_date, r.end_date, r.monthly_rent, r.security_deposit, r.rental_status,
          p.property_id, p.title AS property_title, p.city,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone,
          a.agent_id, a.name AS agent_name
       FROM rentals r
       JOIN properties p ON r.property_id = p.property_id
       JOIN customers c ON r.customer_id = c.customer_id
       JOIN agents a ON r.agent_id = a.agent_id
       ORDER BY r.start_date DESC`
    );
    res.json({ success: true, rentals });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
