const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken, authorize('Admin', 'Agent'));

// 1. Report: Available Properties
router.get('/available-properties', async (req, res, next) => {
  try {
    const [data] = await db.query('SELECT * FROM Available_Properties ORDER BY price ASC');
    res.json({ success: true, title: 'Available Properties Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 2. Report: Sold Properties
router.get('/sold-properties', async (req, res, next) => {
  try {
    const [data] = await db.query('SELECT * FROM Sold_Properties ORDER BY sale_date DESC');
    res.json({ success: true, title: 'Sold Properties Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 3. Report: Rented Properties
router.get('/rented-properties', async (req, res, next) => {
  try {
    const [data] = await db.query('SELECT * FROM Rented_Properties ORDER BY start_date DESC');
    res.json({ success: true, title: 'Rented Properties Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 4. Report: Properties by City
router.get('/properties-by-city', async (req, res, next) => {
  try {
    const [data] = await db.query('SELECT * FROM City_Wise_Property_Stats ORDER BY total_properties DESC');
    res.json({ success: true, title: 'Properties by City Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 5. Report: Properties by Type
router.get('/properties-by-type', async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT 
          pt.type_name,
          COUNT(p.property_id) AS total_listed,
          SUM(CASE WHEN p.property_status = 'Available' THEN 1 ELSE 0 END) AS available_count,
          SUM(CASE WHEN p.property_status = 'Sold' THEN 1 ELSE 0 END) AS sold_count,
          SUM(CASE WHEN p.property_status = 'Rented' THEN 1 ELSE 0 END) AS rented_count,
          COALESCE(AVG(p.price), 0) AS average_price
       FROM property_types pt
       LEFT JOIN properties p ON pt.property_type_id = p.property_type_id
       GROUP BY pt.type_name
       ORDER BY total_listed DESC`
    );
    res.json({ success: true, title: 'Properties by Type Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 6. Report: Customer Booking History
router.get('/customer-booking-history', async (req, res, next) => {
  try {
    const [data] = await db.query('SELECT * FROM Customer_Booking_History ORDER BY booking_date DESC');
    res.json({ success: true, title: 'Customer Booking History Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 7. Report: Agent Performance
router.get('/agent-performance', async (req, res, next) => {
  try {
    const [data] = await db.query('SELECT * FROM Agent_Performance ORDER BY total_sales_volume DESC');
    res.json({ success: true, title: 'Agent Performance & Productivity Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 8. Report: Monthly Revenue
router.get('/monthly-revenue', async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT 
          DATE_FORMAT(payment_date, '%Y-%m') AS month,
          COUNT(payment_id) AS transactions_count,
          SUM(amount) AS total_revenue
       FROM payments
       WHERE payment_status = 'Completed'
       GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
       ORDER BY month DESC`
    );
    res.json({ success: true, title: 'Monthly Revenue Collection Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 9. Report: Pending Payments
router.get('/pending-payments', async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT 
          pm.payment_id, pm.booking_id, pm.amount, pm.payment_method, pm.transaction_id, pm.payment_date,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone,
          p.title AS property_title, p.city
       FROM payments pm
       JOIN customers c ON pm.customer_id = c.customer_id
       JOIN bookings b ON pm.booking_id = b.booking_id
       JOIN properties p ON b.property_id = p.property_id
       WHERE pm.payment_status = 'Pending'
       ORDER BY pm.payment_date DESC`
    );
    res.json({ success: true, title: 'Pending Payments Ledger Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 10. Report: Property Sales Report
router.get('/sales-report', async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT 
          s.sale_id, s.sale_date, s.sale_price, s.commission_amount,
          p.title AS property_title, p.city, pt.type_name,
          c.name AS buyer_name, a.name AS agent_name
       FROM sales s
       JOIN properties p ON s.property_id = p.property_id
       JOIN property_types pt ON p.property_type_id = pt.property_type_id
       JOIN customers c ON s.customer_id = c.customer_id
       JOIN agents a ON s.agent_id = a.agent_id
       ORDER BY s.sale_date DESC`
    );
    res.json({ success: true, title: 'Closed Property Sales Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 11. Report: Rental Report
router.get('/rental-report', async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT 
          r.rental_id, r.start_date, r.end_date, r.monthly_rent, r.security_deposit, r.rental_status,
          p.title AS property_title, p.city,
          c.name AS tenant_name, a.name AS agent_name
       FROM rentals r
       JOIN properties p ON r.property_id = p.property_id
       JOIN customers c ON r.customer_id = c.customer_id
       JOIN agents a ON r.agent_id = a.agent_id
       ORDER BY r.start_date DESC`
    );
    res.json({ success: true, title: 'Rental Agreements & Occupancy Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// 12. Report: Commission Report
router.get('/commission-report', async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT 
          a.agent_id, a.name AS agent_name, a.commission_rate,
          COUNT(s.sale_id) AS total_sales,
          SUM(s.sale_price) AS total_volume_sold,
          SUM(s.commission_amount) AS total_commission_earned
       FROM agents a
       JOIN sales s ON a.agent_id = s.agent_id
       GROUP BY a.agent_id, a.name, a.commission_rate
       ORDER BY total_commission_earned DESC`
    );
    res.json({ success: true, title: 'Agent Commission Disbursal Report', count: data.length, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
