const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// POST /api/visits (Customer schedules a property visit)
router.post('/', authenticateToken, authorize('Customer'), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { property_id, visit_date, visit_time, remarks } = req.body;

    if (!property_id || !visit_date || !visit_time) {
      return res.status(400).json({ success: false, message: 'Please provide property ID, date, and time.' });
    }

    const customerId = req.user.customerId;

    // Fetch property details & assigned agent
    const [props] = await connection.query(
      'SELECT property_id, title, city, agent_id, property_status FROM properties WHERE property_id = ?',
      [property_id]
    );

    if (props.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const prop = props[0];

    // Check slot conflict for agent at that exact date and time
    const [existing] = await connection.query(
      `SELECT visit_id FROM visits 
       WHERE agent_id = ? AND visit_date = ? AND visit_time = ? AND visit_status = 'Scheduled'`,
      [prop.agent_id, visit_date, visit_time]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'The selected agent is already booked for an appointment at this exact date & time. Please pick another time slot.'
      });
    }

    await connection.beginTransaction();

    const [visitResult] = await connection.query(
      `INSERT INTO visits (customer_id, property_id, agent_id, visit_date, visit_time, visit_status, remarks)
       VALUES (?, ?, ?, ?, ?, 'Scheduled', ?)`,
      [customerId, property_id, prop.agent_id, visit_date, visit_time, remarks || 'Physical site visit scheduled online']
    );

    // Fetch agent user_id to notify them
    const [agentUsers] = await connection.query('SELECT user_id FROM agents WHERE agent_id = ?', [prop.agent_id]);
    if (agentUsers.length > 0 && agentUsers[0].user_id) {
      await connection.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          agentUsers[0].user_id,
          'New Visit Request',
          `Customer ${req.user.name} requested a visit for "${prop.title}" on ${visit_date} at ${visit_time}.`
        ]
      );
    }

    // Also notify customer
    await connection.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        req.user.userId,
        'Visit Scheduled',
        `Your visit for "${prop.title}" (${prop.city}) has been scheduled for ${visit_date} at ${visit_time}.`
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Visit scheduled successfully.',
      visitId: visitResult.insertId
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/visits/my (Customer's own visits)
router.get('/my', authenticateToken, authorize('Customer'), async (req, res, next) => {
  try {
    const customerId = req.user.customerId;
    const [visits] = await db.query(
      `SELECT 
          v.visit_id, v.visit_date, v.visit_time, v.visit_status, v.remarks, v.created_at,
          p.property_id, p.title AS property_title, p.address, p.city, p.price, p.image_url,
          a.agent_id, a.name AS agent_name, a.phone AS agent_phone, a.email AS agent_email
       FROM visits v
       JOIN properties p ON v.property_id = p.property_id
       JOIN agents a ON v.agent_id = a.agent_id
       WHERE v.customer_id = ?
       ORDER BY v.visit_date DESC, v.visit_time DESC`,
      [customerId]
    );
    res.json({ success: true, visits });
  } catch (err) {
    next(err);
  }
});

// GET /api/visits/agent (Agent's assigned visits)
router.get('/agent', authenticateToken, authorize('Agent'), async (req, res, next) => {
  try {
    const agentId = req.user.agentId;
    const [visits] = await db.query(
      `SELECT 
          v.visit_id, v.visit_date, v.visit_time, v.visit_status, v.remarks, v.created_at,
          p.property_id, p.title AS property_title, p.city, p.price,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
       FROM visits v
       JOIN properties p ON v.property_id = p.property_id
       JOIN customers c ON v.customer_id = c.customer_id
       WHERE v.agent_id = ?
       ORDER BY v.visit_date DESC, v.visit_time DESC`,
      [agentId]
    );
    res.json({ success: true, visits });
  } catch (err) {
    next(err);
  }
});

// GET /api/visits (Admin: view all visits)
router.get('/', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const [visits] = await db.query(
      `SELECT 
          v.visit_id, v.visit_date, v.visit_time, v.visit_status, v.remarks, v.created_at,
          p.property_id, p.title AS property_title, p.city,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone,
          a.agent_id, a.name AS agent_name, a.phone AS agent_phone
       FROM visits v
       JOIN properties p ON v.property_id = p.property_id
       JOIN customers c ON v.customer_id = c.customer_id
       JOIN agents a ON v.agent_id = a.agent_id
       ORDER BY v.visit_date DESC, v.visit_time DESC`
    );
    res.json({ success: true, visits });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/visits/:id/status (Update visit status: Completed or Cancelled)
router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const visitId = parseInt(req.params.id, 10);
    const { status, remarks } = req.body;

    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Scheduled, Completed, or Cancelled.' });
    }

    const [visits] = await db.query(
      `SELECT v.visit_id, v.customer_id, v.agent_id, c.user_id AS customer_user_id, p.title AS property_title
       FROM visits v
       JOIN customers c ON v.customer_id = c.customer_id
       JOIN properties p ON v.property_id = p.property_id
       WHERE v.visit_id = ?`,
      [visitId]
    );

    if (visits.length === 0) {
      return res.status(404).json({ success: false, message: 'Visit record not found.' });
    }

    const v = visits[0];

    // Authorization check
    if (req.user.role === 'Customer' && v.customer_id !== req.user.customerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
    if (req.user.role === 'Agent' && v.agent_id !== req.user.agentId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await db.query(
      'UPDATE visits SET visit_status = ?, remarks = COALESCE(?, remarks) WHERE visit_id = ?',
      [status, remarks, visitId]
    );

    // Notify customer if status updated by agent/admin
    if (v.customer_user_id && req.user.userId !== v.customer_user_id) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          v.customer_user_id,
          `Visit ${status}`,
          `Your scheduled visit for "${v.property_title}" is now marked as ${status}.`
        ]
      );
    }

    res.json({ success: true, message: `Visit status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
