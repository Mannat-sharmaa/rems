const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'real_estate_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper for test connection
pool.getConnection()
  .then(conn => {
    console.log('✓ MySQL Database Connected: ' + (process.env.DB_NAME || 'real_estate_db') + ' on port ' + (process.env.DB_PORT || '3306'));
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
    console.error('👉 Make sure MySQL is running using start_mysql.bat or your local MySQL server on port 3306.');
  });

module.exports = pool;
