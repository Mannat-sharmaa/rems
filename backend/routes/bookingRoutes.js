const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// POST /api/bookings (Atomic Property Booking + Payment Workflow with Transaction)
router.post('/', authenticateToken, authorize('Customer'), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { property_id, booking_amount, payment_method = 'UPI', simulate_failure = false } = req.body;

    if (!property_id || !booking_amount || parseFloat(booking_amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid property ID and booking amount.' });
    }

    const customerId = req.user.customerId;

    // Begin database transaction for atomic booking + payment + status update
    await connection.beginTransaction();

    // 1. Double-booking prevention: Lock property row with FOR UPDATE
    const [props] = await connection.query(
      'SELECT property_id, title, city, price, agent_id, property_status FROM properties WHERE property_id = ? FOR UPDATE',
      [property_id]
    );

    if (props.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Selected property does not exist.' });
    }

    const property = props[0];

    // Check availability
    if (property.property_status !== 'Available') {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: `Sorry, this property has already been booked or is unavailable. Current status: ${property.property_status}.`
      });
    }

    // 2. Simulated payment failure test
    if (simulate_failure) {
      // Record failed transaction attempt
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment transaction failed at banking gateway. Booking was aborted and property remains Available.'
      });
    }

    // 3. Insert Booking Record
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (customer_id, property_id, agent_id, booking_amount, booking_status, remarks)
       VALUES (?, ?, ?, ?, 'Confirmed', 'Booking confirmed via online payment')`,
      [customerId, property_id, property.agent_id, booking_amount]
    );

    const bookingId = bookingResult.insertId;

    // 4. Generate unique transaction ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `TXN${dateStr}B${bookingId}${randomHex}`;

    // 5. Insert Payment Record
    const [paymentResult] = await connection.query(
      `INSERT INTO payments (booking_id, customer_id, amount, payment_method, transaction_id, payment_status)
       VALUES (?, ?, ?, ?, ?, 'Completed')`,
      [bookingId, customerId, booking_amount, payment_method, transactionId]
    );

    // 6. Update Property Status to 'Booked'
    await connection.query(
      "UPDATE properties SET property_status = 'Booked' WHERE property_id = ?",
      [property_id]
    );

    // 7. Insert Notifications
    // Customer Notification
    await connection.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        req.user.userId,
        'Booking Confirmed 🎉',
        `Your booking #${bookingId} for "${property.title}" (${property.city}) is confirmed. Payment of ₹${Number(booking_amount).toLocaleString('en-IN')} received (TXN: ${transactionId}).`
      ]
    );

    // Agent Notification
    const [agents] = await connection.query('SELECT user_id FROM agents WHERE agent_id = ?', [property.agent_id]);
    if (agents.length > 0 && agents[0].user_id) {
      await connection.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          agents[0].user_id,
          'New Property Booking',
          `Customer ${req.user.name} booked "${property.title}"! Advance payment: ₹${Number(booking_amount).toLocaleString('en-IN')}.`
        ]
      );
    }

    // Commit Transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Property booked successfully and payment confirmed!',
      booking: {
        bookingId,
        propertyId: property.property_id,
        propertyTitle: property.title,
        city: property.city,
        propertyPrice: property.price,
        bookingAmount: parseFloat(booking_amount),
        bookingStatus: 'Confirmed',
        transactionId,
        paymentStatus: 'Completed',
        paymentMethod: payment_method
      }
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/bookings/my (Customer view bookings)
router.get('/my', authenticateToken, authorize('Customer'), async (req, res, next) => {
  try {
    const customerId = req.user.customerId;
    const [bookings] = await db.query(
      `SELECT 
          b.booking_id, b.booking_date, b.booking_amount, b.booking_status, b.remarks,
          p.property_id, p.title AS property_title, p.address, p.city, p.price AS property_price,
          p.image_url, p.listing_type,
          a.agent_id, a.name AS agent_name, a.phone AS agent_phone,
          pm.payment_id, pm.amount AS paid_amount, pm.payment_method, pm.transaction_id, pm.payment_status
       FROM bookings b
       JOIN properties p ON b.property_id = p.property_id
       JOIN agents a ON b.agent_id = a.agent_id
       LEFT JOIN payments pm ON b.booking_id = pm.booking_id
       WHERE b.customer_id = ?
       ORDER BY b.booking_date DESC`,
      [customerId]
    );
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/agent (Agent view assigned bookings)
router.get('/agent', authenticateToken, authorize('Agent'), async (req, res, next) => {
  try {
    const agentId = req.user.agentId;
    const [bookings] = await db.query(
      `SELECT 
          b.booking_id, b.booking_date, b.booking_amount, b.booking_status, b.remarks,
          p.property_id, p.title AS property_title, p.city, p.price AS property_price, p.property_status,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
          pm.transaction_id, pm.payment_status
       FROM bookings b
       JOIN properties p ON b.property_id = p.property_id
       JOIN customers c ON b.customer_id = c.customer_id
       LEFT JOIN payments pm ON b.booking_id = pm.booking_id
       WHERE b.agent_id = ?
       ORDER BY b.booking_date DESC`,
      [agentId]
    );
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings (Admin: view all bookings)
router.get('/', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const [bookings] = await db.query(
      `SELECT 
          b.booking_id, b.booking_date, b.booking_amount, b.booking_status, b.remarks,
          p.property_id, p.title AS property_title, p.city, p.price AS property_price, p.property_status,
          c.customer_id, c.name AS customer_name, c.phone AS customer_phone,
          a.agent_id, a.name AS agent_name,
          pm.transaction_id, pm.payment_status, pm.payment_method
       FROM bookings b
       JOIN properties p ON b.property_id = p.property_id
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN agents a ON b.agent_id = a.agent_id
       LEFT JOIN payments pm ON b.booking_id = pm.booking_id
       ORDER BY b.booking_date DESC`
    );
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id/cancel (Cancel booking & refund)
router.patch('/:id/cancel', authenticateToken, async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const bookingId = parseInt(req.params.id, 10);

    const [bookings] = await connection.query(
      `SELECT b.booking_id, b.customer_id, b.property_id, b.booking_status,
              c.user_id AS customer_user_id, p.title AS property_title
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN properties p ON b.property_id = p.property_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const b = bookings[0];

    // Authorization: only Customer who booked or Admin can cancel
    if (req.user.role === 'Customer' && b.customer_id !== req.user.customerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (b.booking_status === 'Cancelled' || b.booking_status === 'Completed') {
      return res.status(400).json({ success: false, message: `Cannot cancel booking with status: ${b.booking_status}` });
    }

    await connection.beginTransaction();

    // Update booking status to Cancelled (trigger will set property back to Available)
    await connection.query(
      "UPDATE bookings SET booking_status = 'Cancelled' WHERE booking_id = ?",
      [bookingId]
    );

    // Update property back to Available if Booked
    await connection.query(
      "UPDATE properties SET property_status = 'Available' WHERE property_id = ? AND property_status = 'Booked'",
      [b.property_id]
    );

    // Update payment record to Refunded
    await connection.query(
      "UPDATE payments SET payment_status = 'Refunded' WHERE booking_id = ?",
      [bookingId]
    );

    // Notification
    await connection.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        b.customer_user_id,
        'Booking Cancelled',
        `Your booking #${bookingId} for "${b.property_title}" has been cancelled and refund processed.`
      ]
    );

    await connection.commit();

    res.json({ success: true, message: 'Booking cancelled successfully. Property is now Available again.' });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// POST /api/bookings/:id/complete-sale (Agent/Admin: Mark Sale complete, record sale & calculate commission)
router.post('/:id/complete-sale', authenticateToken, authorize('Admin', 'Agent'), async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const bookingId = parseInt(req.params.id, 10);

    const [bookings] = await connection.query(
      `SELECT b.booking_id, b.customer_id, b.property_id, b.agent_id, b.booking_status,
              p.title AS property_title, p.price AS property_price,
              a.commission_rate, a.user_id AS agent_user_id,
              c.user_id AS customer_user_id
       FROM bookings b
       JOIN properties p ON b.property_id = p.property_id
       JOIN agents a ON b.agent_id = a.agent_id
       JOIN customers c ON b.customer_id = c.customer_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const b = bookings[0];

    if (b.booking_status !== 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Only confirmed bookings can be finalized into a sale.' });
    }

    await connection.beginTransaction();

    const salePrice = b.property_price;
    const commissionAmount = parseFloat(((salePrice * b.commission_rate) / 100).toFixed(2));

    // 1. Insert into sales table
    const [saleResult] = await connection.query(
      `INSERT INTO sales (property_id, customer_id, agent_id, sale_date, sale_price, commission_amount, sale_status)
       VALUES (?, ?, ?, CURDATE(), ?, ?, 'Completed')`,
      [b.property_id, b.customer_id, b.agent_id, salePrice, commissionAmount]
    );

    // 2. Mark booking completed
    await connection.query(
      "UPDATE bookings SET booking_status = 'Completed' WHERE booking_id = ?",
      [bookingId]
    );

    // 3. Mark property sold (also handled by trigger)
    await connection.query(
      "UPDATE properties SET property_status = 'Sold' WHERE property_id = ?",
      [b.property_id]
    );

    // 4. Notifications
    await connection.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        b.customer_user_id,
        'Congratulations on your new Home! 🏡',
        `The sale for "${b.property_title}" has been finalized! You are now the proud owner.`
      ]
    );

    if (b.agent_user_id) {
      await connection.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          b.agent_user_id,
          'Commission Earned! 💰',
          `Sale for "${b.property_title}" completed! You earned a commission of ₹${commissionAmount.toLocaleString('en-IN')}.`
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Sale finalized successfully! Property status updated to Sold and commission credited.',
      sale: {
        saleId: saleResult.insertId,
        propertyTitle: b.property_title,
        salePrice,
        commissionAmount
      }
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

module.exports = router;
