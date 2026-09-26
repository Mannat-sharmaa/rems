const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken, authorize('Agent'));

// GET /api/agent/dashboard (Agent specific KPI statistics)
router.get('/dashboard', async (req, res, next) => {
  try {
    const agentId = req.user.agentId;

    // 1. Properties summary
    const [propStats] = await db.query(
      `SELECT 
          COUNT(*) AS total_properties,
          SUM(CASE WHEN property_status = 'Available' THEN 1 ELSE 0 END) AS available_properties,
          SUM(CASE WHEN property_status = 'Booked' THEN 1 ELSE 0 END) AS booked_properties,
          SUM(CASE WHEN property_status = 'Sold' THEN 1 ELSE 0 END) AS sold_properties,
          SUM(CASE WHEN property_status = 'Rented' THEN 1 ELSE 0 END) AS rented_properties
       FROM properties
       WHERE agent_id = ?`,
      [agentId]
    );

    // 2. Visits summary
    const [visitStats] = await db.query(
      `SELECT 
          COUNT(*) AS total_visits,
          SUM(CASE WHEN visit_status = 'Scheduled' THEN 1 ELSE 0 END) AS upcoming_visits,
          SUM(CASE WHEN visit_status = 'Completed' THEN 1 ELSE 0 END) AS completed_visits
       FROM visits
       WHERE agent_id = ?`,
      [agentId]
    );

    // 3. Bookings & Sales summary
    const [bookingStats] = await db.query(
      `SELECT 
          COUNT(*) AS total_bookings,
          SUM(CASE WHEN booking_status = 'Confirmed' THEN 1 ELSE 0 END) AS active_bookings
       FROM bookings
       WHERE agent_id = ?`,
      [agentId]
    );

    const [saleStats] = await db.query(
      `SELECT 
          COUNT(*) AS completed_sales,
          COALESCE(SUM(sale_price), 0) AS total_sales_volume,
          COALESCE(SUM(commission_amount), 0) AS total_commission
       FROM sales
       WHERE agent_id = ?`,
      [agentId]
    );

    // 4. Upcoming 5 visits
    const [upcomingVisits] = await db.query(
      `SELECT v.visit_id, v.visit_date, v.visit_time, v.visit_status,
              p.title AS property_title, p.city,
              c.name AS customer_name, c.phone AS customer_phone
       FROM visits v
       JOIN properties p ON v.property_id = p.property_id
       JOIN customers c ON v.customer_id = c.customer_id
       WHERE v.agent_id = ? AND v.visit_status = 'Scheduled'
       ORDER BY v.visit_date ASC, v.visit_time ASC
       LIMIT 5`,
      [agentId]
    );

    res.json({
      success: true,
      stats: {
        totalProperties: propStats[0].total_properties,
        availableProperties: propStats[0].available_properties,
        bookedProperties: propStats[0].booked_properties,
        soldProperties: propStats[0].sold_properties,
        rentedProperties: propStats[0].rented_properties,
        totalVisits: visitStats[0].total_visits,
        upcomingVisits: visitStats[0].upcoming_visits,
        completedVisits: visitStats[0].completed_visits,
        totalBookings: bookingStats[0].total_bookings,
        activeBookings: bookingStats[0].active_bookings,
        completedSales: saleStats[0].completed_sales,
        totalSalesVolume: saleStats[0].total_sales_volume,
        totalCommission: saleStats[0].total_commission
      },
      upcomingVisits
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent/properties (Properties assigned to this agent)
router.get('/properties', async (req, res, next) => {
  try {
    const agentId = req.user.agentId;
    const [properties] = await db.query(
      `SELECT p.property_id, p.title, p.address, p.city, p.price, p.area_sqft,
              p.bedrooms, p.bathrooms, p.property_status, p.listing_type, p.image_url,
              pt.type_name AS property_type,
              o.name AS owner_name, o.phone AS owner_phone
       FROM properties p
       JOIN property_types pt ON p.property_type_id = pt.property_type_id
       JOIN owners o ON p.owner_id = o.owner_id
       WHERE p.agent_id = ?
       ORDER BY p.property_id DESC`,
      [agentId]
    );
    res.json({ success: true, properties });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
