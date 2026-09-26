const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register (Customer Registration)
router.post('/register', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, phone, password).' });
    }

    // Check duplicate email or phone
    const [existing] = await connection.query(
      'SELECT user_id, email, phone FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existing.length > 0) {
      const matchEmail = existing.some(u => u.email === email);
      return res.status(409).json({
        success: false,
        message: matchEmail ? 'Email is already registered. Please login.' : 'Phone number is already in use.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Database transaction: create user + create customer record atomically
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, phone, password, role, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, 'Customer', address || null]
    );

    const userId = userResult.insertId;

    const [custResult] = await connection.query(
      'INSERT INTO customers (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, phone, address || null]
    );

    // Insert welcome notification
    await connection.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userId, 'Welcome to REMS!', `Hello ${name}, your customer account has been created successfully. Explore verified listings today!`]
    );

    await connection.commit();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId,
        role: 'Customer',
        customerId: custResult.insertId,
        email,
        name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        userId,
        name,
        email,
        phone,
        role: 'Customer',
        customerId: custResult.insertId,
        address
      }
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const [users] = await db.query(
      'SELECT user_id, name, email, phone, password, role, address, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    // Retrieve role-specific primary key ID
    let roleSpecificId = null;
    let extraDetails = {};

    if (user.role === 'Customer') {
      const [cust] = await db.query('SELECT customer_id FROM customers WHERE user_id = ?', [user.user_id]);
      if (cust.length > 0) roleSpecificId = cust[0].customer_id;
    } else if (user.role === 'Agent') {
      const [agent] = await db.query('SELECT agent_id, experience, commission_rate FROM agents WHERE user_id = ?', [user.user_id]);
      if (agent.length > 0) {
        roleSpecificId = agent[0].agent_id;
        extraDetails = {
          experience: agent[0].experience,
          commissionRate: agent[0].commission_rate
        };
      }
    } else if (user.role === 'Owner') {
      const [owner] = await db.query('SELECT owner_id FROM owners WHERE user_id = ?', [user.user_id]);
      if (owner.length > 0) roleSpecificId = owner[0].owner_id;
    }

    const tokenPayload = {
      userId: user.user_id,
      role: user.role,
      email: user.email,
      name: user.name,
      ...(user.role === 'Customer' ? { customerId: roleSpecificId } : {}),
      ...(user.role === 'Agent' ? { agentId: roleSpecificId } : {}),
      ...(user.role === 'Owner' ? { ownerId: roleSpecificId } : {})
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        roleId: roleSpecificId,
        ...extraDetails
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, name, email, phone, role, address, created_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    let roleDetails = {};

    if (user.role === 'Customer') {
      const [cust] = await db.query('SELECT customer_id FROM customers WHERE user_id = ?', [user.user_id]);
      if (cust.length > 0) roleDetails.customerId = cust[0].customer_id;
    } else if (user.role === 'Agent') {
      const [agent] = await db.query('SELECT agent_id, experience, commission_rate FROM agents WHERE user_id = ?', [user.user_id]);
      if (agent.length > 0) {
        roleDetails.agentId = agent[0].agent_id;
        roleDetails.experience = agent[0].experience;
        roleDetails.commissionRate = agent[0].commission_rate;
      }
    }

    res.json({
      success: true,
      user: {
        ...user,
        ...roleDetails
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/notifications
router.get('/notifications', authenticateToken, async (req, res, next) => {
  try {
    const [notifications] = await db.query(
      'SELECT notification_id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.userId]
    );
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/notifications/read-all
router.patch('/notifications/read-all', authenticateToken, async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.userId]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
