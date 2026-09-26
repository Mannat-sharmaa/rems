const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// GET /api/sales/my (Customer's purchased properties)
router.get('/my', authenticateToken, authorize('Customer'), async (req, res, next) => {
  try {
    const customerId = req.user.customerId;
    const [sales] = await db.query(
      `SELECT 
          s.sale_id, s.sale_date, s.sale_price, s.sale_status,
          p.property_id, p.title AS property_title, p.address, p.city, p.image_url,
          pt.type_name AS property_type,
          a.name AS agent_name, a.phone AS agent_phone
       FROM sales s
       JOIN properties p ON s.property_id = p.property_id
       JOIN property_types pt ON p.property_type_id = pt.property_type_id
       JOIN agents a ON s.agent_id = a.agent_id
       WHERE s.customer_id = ?
       ORDER BY s.sale_date DESC`,
      [customerId]
    );
    res.json({ success: true, sales });
  } catch (err) {
    next(err);
  }
});

// GET /api/sales/agent (Agent's completed sales & commission earnings)
router.get('/agent', authenticateToken, authorize('Agent'), async (req, res, next) => {
  try {
    const agentId = req.user.agentId;
    const [sales] = await db.query(
      `SELECT 
          s.sale_id, s.sale_date, s.sale_price, s.commission_amount, s.sale_status,
          p.property_id, p.title AS property_title, p.city,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone
       FROM sales s
       JOIN properties p ON s.property_id = p.property_id
       JOIN customers c ON s.customer_id = c.customer_id
       WHERE s.agent_id = ?
       ORDER BY s.sale_date DESC`,
      [agentId]
    );

    const [summary] = await db.query(
      `SELECT 
          COUNT(sale_id) AS total_sales,
          COALESCE(SUM(sale_price), 0) AS total_volume,
          COALESCE(SUM(commission_amount), 0) AS total_commission
       FROM sales
       WHERE agent_id = ?`,
      [agentId]
    );

    res.json({
      success: true,
      summary: summary[0],
      sales
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/sales (Admin: view all sales)
router.get('/', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const [sales] = await db.query(
      `SELECT 
          s.sale_id, s.sale_date, s.sale_price, s.commission_amount, s.sale_status,
          p.property_id, p.title AS property_title, p.city,
          pt.type_name AS property_type,
          c.customer_id, c.name AS customer_name,
          a.agent_id, a.name AS agent_name, a.commission_rate
       FROM sales s
       JOIN properties p ON s.property_id = p.property_id
       JOIN property_types pt ON p.property_type_id = pt.property_type_id
       JOIN customers c ON s.customer_id = c.customer_id
       JOIN agents a ON s.agent_id = a.agent_id
       ORDER BY s.sale_date DESC`
    );

    const [stats] = await db.query(
      `SELECT 
          COUNT(sale_id) AS total_sales,
          COALESCE(SUM(sale_price), 0) AS total_revenue,
          COALESCE(SUM(commission_amount), 0) AS total_commission
       FROM sales`
    );

    res.json({
      success: true,
      stats: stats[0],
      sales
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
