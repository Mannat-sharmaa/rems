const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// Definition of the 32 demonstration SQL queries
const QUERY_CATALOG = [
  { id: 1, title: 'Show all available properties', category: 'Basic SELECT', sql: `SELECT property_id, title, city, price, listing_type, property_status FROM properties WHERE property_status = 'Available' LIMIT 15;` },
  { id: 2, title: 'Show properties located in Mohali', category: 'Filtering WHERE', sql: `SELECT property_id, title, address, city, price, bedrooms, area_sqft FROM properties WHERE city = 'Mohali';` },
  { id: 3, title: 'Show properties under ₹70 Lakh (≤ ₹70,00,000)', category: 'Comparison', sql: `SELECT property_id, title, city, price, listing_type FROM properties WHERE price <= 7000000.00 ORDER BY price DESC;` },
  { id: 4, title: 'Find all 3 BHK properties', category: 'Filtering', sql: `SELECT property_id, title, city, area_sqft, bedrooms, bathrooms, price FROM properties WHERE bedrooms = 3;` },
  { id: 5, title: 'Sort properties by price in ascending order', category: 'ORDER BY', sql: `SELECT property_id, title, city, price, listing_type FROM properties ORDER BY price ASC LIMIT 15;` },
  { id: 6, title: 'Count total properties grouped by city', category: 'GROUP BY', sql: `SELECT city, COUNT(property_id) AS total_properties FROM properties GROUP BY city ORDER BY total_properties DESC;` },
  { id: 7, title: 'Find average property price for properties on Sale', category: 'Aggregate AVG', sql: `SELECT ROUND(AVG(price), 2) AS average_sale_price FROM properties WHERE listing_type = 'Sale';` },
  { id: 8, title: 'Find highest property price in system', category: 'Aggregate MAX', sql: `SELECT MAX(price) AS highest_property_price FROM properties;` },
  { id: 9, title: 'Find lowest property price on Sale', category: 'Aggregate MIN', sql: `SELECT MIN(price) AS lowest_sale_price FROM properties WHERE listing_type = 'Sale';` },
  { id: 10, title: 'Customer booking history with properties', category: 'INNER JOIN', sql: `SELECT b.booking_id, c.name AS customer_name, p.title AS property_title, p.city, b.booking_amount, b.booking_status FROM bookings b JOIN customers c ON b.customer_id = c.customer_id JOIN properties p ON b.property_id = p.property_id ORDER BY b.booking_date DESC;` },
  { id: 11, title: 'Show property owner details for every property', category: 'JOIN', sql: `SELECT p.property_id, p.title, p.city, o.name AS owner_name, o.phone, o.email FROM properties p JOIN owners o ON p.owner_id = o.owner_id LIMIT 15;` },
  { id: 12, title: 'Show agent assigned to each property', category: 'JOIN', sql: `SELECT p.property_id, p.title, p.city, a.name AS agent_name, a.phone, a.commission_rate FROM properties p JOIN agents a ON p.agent_id = a.agent_id LIMIT 15;` },
  { id: 13, title: 'Customers with confirmed bookings', category: 'Subquery IN', sql: `SELECT customer_id, name, email, phone FROM customers WHERE customer_id IN (SELECT DISTINCT customer_id FROM bookings WHERE booking_status IN ('Confirmed', 'Completed'));` },
  { id: 14, title: 'Properties that have never been booked', category: 'LEFT JOIN / IS NULL', sql: `SELECT p.property_id, p.title, p.city, p.price FROM properties p LEFT JOIN bookings b ON p.property_id = b.property_id WHERE b.booking_id IS NULL;` },
  { id: 15, title: 'Properties priced above overall average price', category: 'Subquery Comparison', sql: `SELECT property_id, title, city, price FROM properties WHERE price > (SELECT AVG(price) FROM properties) ORDER BY price DESC;` },
  { id: 16, title: 'Total sales revenue from completed sales', category: 'Aggregate SUM', sql: `SELECT COUNT(sale_id) AS total_deals, SUM(sale_price) AS total_sales_volume FROM sales WHERE sale_status = 'Completed';` },
  { id: 17, title: 'Total revenue collected across completed payments', category: 'Aggregate SUM', sql: `SELECT COUNT(payment_id) AS total_payments, SUM(amount) AS total_collected FROM payments WHERE payment_status = 'Completed';` },
  { id: 18, title: 'Total agent commissions paid across all sales', category: 'Aggregate SUM', sql: `SELECT COUNT(sale_id) AS total_sales, SUM(commission_amount) AS total_commission_paid FROM sales;` },
  { id: 19, title: 'Top-performing agents by sales volume', category: 'GROUP BY & SUM', sql: `SELECT a.agent_id, a.name AS agent_name, COUNT(s.sale_id) AS total_sales_count, SUM(s.sale_price) AS total_volume_sold, SUM(s.commission_amount) AS commission_earned FROM agents a JOIN sales s ON a.agent_id = s.agent_id GROUP BY a.agent_id, a.name ORDER BY total_volume_sold DESC;` },
  { id: 20, title: 'Customers with completed payments', category: 'INNER JOIN', sql: `SELECT DISTINCT c.customer_id, c.name, c.phone, p.transaction_id, p.amount, p.payment_method FROM customers c JOIN payments p ON c.customer_id = p.customer_id WHERE p.payment_status = 'Completed';` },
  { id: 21, title: 'Show upcoming scheduled property visits', category: 'JOIN with Filter', sql: `SELECT v.visit_id, v.visit_date, v.visit_time, c.name AS customer_name, p.title AS property_title, a.name AS agent_name FROM visits v JOIN customers c ON v.customer_id = c.customer_id JOIN properties p ON v.property_id = p.property_id JOIN agents a ON v.agent_id = a.agent_id WHERE v.visit_status = 'Scheduled' ORDER BY v.visit_date ASC;` },
  { id: 22, title: 'Show cancelled visits with remarks', category: 'Filtering', sql: `SELECT v.visit_id, v.visit_date, c.name AS customer_name, p.title AS property_title, v.remarks FROM visits v JOIN customers c ON v.customer_id = c.customer_id JOIN properties p ON v.property_id = p.property_id WHERE v.visit_status = 'Cancelled';` },
  { id: 23, title: 'Show pending payments requiring settlement', category: 'Filtering', sql: `SELECT pm.payment_id, pm.booking_id, c.name AS customer_name, c.phone, pm.amount, pm.payment_status FROM payments pm JOIN customers c ON pm.customer_id = c.customer_id WHERE pm.payment_status = 'Pending';` },
  { id: 24, title: 'Properties with average rating ≥ 4.5', category: 'GROUP BY & HAVING', sql: `SELECT p.property_id, p.title, p.city, ROUND(AVG(r.rating), 2) AS average_rating, COUNT(r.review_id) AS total_reviews FROM properties p JOIN reviews r ON p.property_id = r.property_id GROUP BY p.property_id, p.title, p.city HAVING AVG(r.rating) >= 4.5 ORDER BY average_rating DESC;` },
  { id: 25, title: 'Most reviewed properties in the system', category: 'Aggregate COUNT', sql: `SELECT p.property_id, p.title, p.city, COUNT(r.review_id) AS review_count FROM properties p JOIN reviews r ON p.property_id = r.property_id GROUP BY p.property_id, p.title, p.city ORDER BY review_count DESC;` },
  { id: 26, title: 'Available rental properties under ₹50,000/mo', category: 'Filtering', sql: `SELECT property_id, title, city, price AS monthly_rent, bedrooms, area_sqft FROM properties WHERE listing_type = 'Rent' AND property_status = 'Available' AND price < 50000.00 ORDER BY price ASC;` },
  { id: 27, title: 'Available properties for sale by type', category: 'GROUP BY', sql: `SELECT pt.type_name, COUNT(p.property_id) AS total_available, MIN(p.price) AS min_price, MAX(p.price) AS max_price, ROUND(AVG(p.price), 2) AS avg_price FROM properties p JOIN property_types pt ON p.property_type_id = pt.property_type_id WHERE p.listing_type = 'Sale' AND p.property_status = 'Available' GROUP BY pt.type_name;` },
  { id: 28, title: 'Monthly sales trend breakdown', category: 'Date Aggregation', sql: `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS sale_month, COUNT(sale_id) AS total_sales_count, SUM(sale_price) AS monthly_revenue FROM sales WHERE sale_status = 'Completed' GROUP BY DATE_FORMAT(sale_date, '%Y-%m') ORDER BY sale_month DESC;` },
  { id: 29, title: 'City-wise total revenue generated from sales', category: 'JOIN & GROUP BY', sql: `SELECT p.city, COUNT(s.sale_id) AS units_sold, SUM(s.sale_price) AS city_total_revenue FROM sales s JOIN properties p ON s.property_id = p.property_id WHERE s.sale_status = 'Completed' GROUP BY p.city ORDER BY city_total_revenue DESC;` },
  { id: 30, title: 'Customer total spending ledger', category: 'LEFT JOIN & GROUP BY', sql: `SELECT c.customer_id, c.name AS customer_name, c.email, COALESCE(SUM(pm.amount), 0) AS total_amount_spent FROM customers c LEFT JOIN payments pm ON c.customer_id = pm.customer_id AND pm.payment_status = 'Completed' GROUP BY c.customer_id, c.name, c.email ORDER BY total_amount_spent DESC LIMIT 15;` },
  { id: 31, title: 'Multi-table customer transaction ledger', category: '5-Table JOIN', sql: `SELECT b.booking_id, c.name AS customer_name, p.title AS property_name, pt.type_name, a.name AS agent_name, pm.transaction_id, pm.amount, pm.payment_method, pm.payment_status FROM bookings b JOIN customers c ON b.customer_id = c.customer_id JOIN properties p ON b.property_id = p.property_id JOIN property_types pt ON p.property_type_id = pt.property_type_id JOIN agents a ON b.agent_id = a.agent_id JOIN payments pm ON b.booking_id = pm.booking_id ORDER BY b.booking_date DESC LIMIT 15;` },
  { id: 32, title: 'Correlated Subquery: High-commission agents', category: 'Correlated Subquery', sql: `SELECT a.agent_id, a.name, a.commission_rate FROM agents a WHERE a.commission_rate > (SELECT AVG(a2.commission_rate) FROM agents a2);` }
];

// GET /api/sql/catalog (Return list of all 32 pre-built queries)
router.get('/catalog', (req, res) => {
  res.json({ success: true, queries: QUERY_CATALOG });
});

// POST /api/sql/execute-by-id (Execute one of the catalog queries)
router.post('/execute-by-id', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const { id } = req.body;
    const item = QUERY_CATALOG.find(q => q.id === parseInt(id, 10));

    if (!item) {
      return res.status(404).json({ success: false, message: 'Query not found in catalog.' });
    }

    const startTime = Date.now();
    const [rows, fields] = await db.query(item.sql);
    const durationMs = Date.now() - startTime;

    const columnNames = fields ? fields.map(f => f.name) : (rows[0] ? Object.keys(rows[0]) : []);

    res.json({
      success: true,
      query: item,
      rowCount: rows.length,
      durationMs,
      columns: columnNames,
      rows
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sql/execute-custom (Execute custom read-only SELECT query for teacher / student)
router.post('/execute-custom', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid SQL query.' });
    }

    const trimmed = sql.trim();
    // Safety check: allow SELECT, SHOW, DESCRIBE, EXPLAIN, CALL
    const isSafeRead = /^(SELECT|SHOW|DESCRIBE|DESC|EXPLAIN|CALL)\b/i.test(trimmed);
    if (!isSafeRead) {
      return res.status(403).json({
        success: false,
        message: 'Security policy: SQL console is restricted to SELECT, SHOW, DESCRIBE, and CALL statements.'
      });
    }

    const startTime = Date.now();
    const [rows, fields] = await db.query(trimmed);
    const durationMs = Date.now() - startTime;

    const columnNames = fields ? fields.map(f => f.name) : (Array.isArray(rows) && rows[0] ? Object.keys(rows[0]) : []);

    res.json({
      success: true,
      sql: trimmed,
      rowCount: Array.isArray(rows) ? rows.length : 1,
      durationMs,
      columns: columnNames,
      rows: Array.isArray(rows) ? rows : [rows]
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
