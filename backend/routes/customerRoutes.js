const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken, authorize('Customer'));

// GET /api/customer/dashboard (Customer dashboard overview)
router.get('/dashboard', async (req, res, next) => {
  try {
    const customerId = req.user.customerId;

    // 1. My Bookings summary
    const [bookingStats] = await db.query(
      `SELECT 
          COUNT(*) AS total_bookings,
          SUM(CASE WHEN booking_status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
          COALESCE(SUM(booking_amount), 0) AS total_booking_deposit
       FROM bookings 
       WHERE customer_id = ?`,
      [customerId]
    );

    // 2. My Visits summary
    const [visitStats] = await db.query(
      `SELECT 
          COUNT(*) AS total_visits,
          SUM(CASE WHEN visit_status = 'Scheduled' THEN 1 ELSE 0 END) AS upcoming_visits
       FROM visits 
       WHERE customer_id = ?`,
      [customerId]
    );

    // 3. My Payments summary
    const [paymentStats] = await db.query(
      `SELECT 
          COALESCE(SUM(amount), 0) AS total_spent,
          COUNT(*) AS total_transactions
       FROM payments 
       WHERE customer_id = ? AND payment_status = 'Completed'`,
      [customerId]
    );

    // 4. Purchased & Rented count
    const [purchasedStats] = await db.query(
      'SELECT COUNT(*) AS total_purchased FROM sales WHERE customer_id = ?',
      [customerId]
    );

    const [rentedStats] = await db.query(
      'SELECT COUNT(*) AS total_rented FROM rentals WHERE customer_id = ? AND rental_status = "Active"',
      [customerId]
    );

    // 5. Next upcoming scheduled visit
    const [nextVisit] = await db.query(
      `SELECT v.visit_id, v.visit_date, v.visit_time, v.visit_status,
              p.property_id, p.title AS property_title, p.address, p.city, p.image_url,
              a.name AS agent_name, a.phone AS agent_phone
       FROM visits v
       JOIN properties p ON v.property_id = p.property_id
       JOIN agents a ON v.agent_id = a.agent_id
       WHERE v.customer_id = ? AND v.visit_status = 'Scheduled'
       ORDER BY v.visit_date ASC, v.visit_time ASC
       LIMIT 1`,
      [customerId]
    );

    // 6. Most recent booking
    const [recentBooking] = await db.query(
      `SELECT b.booking_id, b.booking_date, b.booking_amount, b.booking_status,
              p.property_id, p.title AS property_title, p.city, p.price, p.image_url,
              pm.transaction_id, pm.payment_status
       FROM bookings b
       JOIN properties p ON b.property_id = p.property_id
       LEFT JOIN payments pm ON b.booking_id = pm.booking_id
       WHERE b.customer_id = ?
       ORDER BY b.booking_date DESC
       LIMIT 1`,
      [customerId]
    );

    // 7. Recommended available properties
    const [recommendations] = await db.query(
      `SELECT p.property_id, p.title, p.city, p.price, p.bedrooms, p.area_sqft, p.image_url,
              pt.type_name AS property_type
       FROM properties p
       JOIN property_types pt ON p.property_type_id = pt.property_type_id
       WHERE p.property_status = 'Available'
       ORDER BY p.price ASC
       LIMIT 4`
    );

    res.json({
      success: true,
      stats: {
        totalBookings: bookingStats[0].total_bookings,
        confirmedBookings: bookingStats[0].confirmed_bookings,
        totalVisits: visitStats[0].total_visits,
        upcomingVisits: visitStats[0].upcoming_visits,
        totalSpent: paymentStats[0].total_spent,
        totalPurchased: purchasedStats[0].total_purchased,
        totalRented: rentedStats[0].total_rented
      },
      nextVisit: nextVisit[0] || null,
      recentBooking: recentBooking[0] || null,
      recommendations
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
