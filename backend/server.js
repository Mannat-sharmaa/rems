const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const visitRoutes = require('./routes/visitRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const saleRoutes = require('./routes/saleRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const agentRoutes = require('./routes/agentRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reportRoutes = require('./routes/reportRoutes');
const sqlQueryRoutes = require('./routes/sqlQueryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// File Upload Endpoint (Base64 handler to save images to frontend/uploads/)
const fs = require('fs');
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image data received.' });
    }

    let ext = 'jpg';
    let dataBuffer;
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else ext = 'jpg';
      dataBuffer = Buffer.from(matches[2], 'base64');
    } else {
      dataBuffer = Buffer.from(imageBase64, 'base64');
    }

    const uniqueName = `prop_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
    const uploadDir = path.join(__dirname, '..', 'frontend', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, dataBuffer);

    res.json({
      success: true,
      url: `/uploads/${uniqueName}`,
      filename: uniqueName
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload image: ' + err.message });
  }
});

// System Health & Database Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result, NOW() AS server_time, VERSION() AS mysql_version');
    res.json({
      status: 'UP',
      database: 'Connected',
      mysqlVersion: rows[0].mysql_version,
      serverTime: rows[0].server_time,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      database: 'Disconnected',
      error: err.message,
      suggestion: 'Ensure MySQL is running on port 3306 (start_mysql.bat).'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sql', sqlQueryRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 REMS Backend Server running on http://localhost:${PORT}`);
  console.log(`🌐 Public Website: http://localhost:${PORT}`);
  console.log(`👑 Admin Dashboard: http://localhost:${PORT}/admin/index.html`);
  console.log(`💼 Agent Dashboard: http://localhost:${PORT}/agent/index.html`);
  console.log(`👤 Customer Dashboard: http://localhost:${PORT}/customer/index.html`);
  console.log('========================================================');
});
