const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// GET /api/payments/my (Customer payment history)
router.get('/my', authenticateToken, authorize('Customer'), async (req, res, next) => {
  try {
    const customerId = req.user.customerId;
    const [payments] = await db.query(
      `SELECT 
          pm.payment_id, pm.amount, pm.payment_date, pm.payment_method, pm.transaction_id, pm.payment_status,
          b.booking_id, b.booking_status,
          p.property_id, p.title AS property_title, p.city, p.price AS property_price
       FROM payments pm
       JOIN bookings b ON pm.booking_id = b.booking_id
       JOIN properties p ON b.property_id = p.property_id
       WHERE pm.customer_id = ?
       ORDER BY pm.payment_date DESC`,
      [customerId]
    );
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments (Admin: view all payments)
router.get('/', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const [payments] = await db.query(
      `SELECT 
          pm.payment_id, pm.amount, pm.payment_date, pm.payment_method, pm.transaction_id, pm.payment_status,
          b.booking_id, b.booking_status,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone,
          p.property_id, p.title AS property_title, p.city
       FROM payments pm
       JOIN bookings b ON pm.booking_id = b.booking_id
       JOIN customers c ON pm.customer_id = c.customer_id
       JOIN properties p ON b.property_id = p.property_id
       ORDER BY pm.payment_date DESC`
    );

    // Summary statistics
    const [summary] = await db.query(
      `SELECT 
          COALESCE(SUM(CASE WHEN payment_status = 'Completed' THEN amount ELSE 0 END), 0) AS total_collected,
          COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN amount ELSE 0 END), 0) AS total_pending,
          COALESCE(SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END), 0) AS total_refunded,
          COUNT(payment_id) AS total_count
       FROM payments`
    );

    res.json({
      success: true,
      summary: summary[0],
      payments
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
