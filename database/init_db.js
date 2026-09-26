const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function executeSqlFile(connection, filePath) {
  console.log(`\n▶ Executing: ${path.basename(filePath)}...`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Handle DELIMITER blocks if present (for procedures & triggers)
  if (content.includes('DELIMITER')) {
    // Split on DELIMITER $$ and DELIMITER ;
    const parts = content.split(/DELIMITER\s+\$\$/i);
    // Part 0 is standard SQL up to first DELIMITER
    if (parts[0].trim()) {
      await connection.query(parts[0]);
    }
    for (let i = 1; i < parts.length; i++) {
      const subParts = parts[i].split(/DELIMITER\s*;/i);
      const routineCode = subParts[0];
      // Split each routine by $$
      const routines = routineCode.split('$$');
      for (const r of routines) {
        const trimmed = r.trim();
        if (trimmed) {
          await connection.query(trimmed);
        }
      }
      if (subParts[1] && subParts[1].trim()) {
        await connection.query(subParts[1]);
      }
    }
  } else {
    await connection.query(content);
  }
  console.log(`✓ Completed: ${path.basename(filePath)}`);
}

async function initDatabase() {
  console.log('====================================================');
  console.log('  REMS - Real Estate Database Initialization Script');
  console.log('====================================================');
  console.log(`Connecting to MySQL on ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Successfully connected to MySQL server.');

    // Run schema.sql
    await executeSqlFile(connection, path.join(__dirname, 'schema.sql'));

    // Switch connection to database
    await connection.changeUser({ database: 'real_estate_db' });

    // Run views.sql
    await executeSqlFile(connection, path.join(__dirname, 'views.sql'));

    // Run sample_data.sql
    await executeSqlFile(connection, path.join(__dirname, 'sample_data.sql'));

    // Run triggers.sql (guarding subsequent runtime inserts & updates)
    await executeSqlFile(connection, path.join(__dirname, 'triggers.sql'));

    // Run procedures.sql
    await executeSqlFile(connection, path.join(__dirname, 'procedures.sql'));

    console.log('\n----------------------------------------------------');
    console.log('Verifying table record counts in real_estate_db:');
    console.log('----------------------------------------------------');

    const tables = [
      'users', 'owners', 'agents', 'customers', 'property_types',
      'properties', 'visits', 'bookings', 'payments', 'sales', 'rentals', 'reviews'
    ];

    for (const table of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  • ${table.padEnd(16)} : ${rows[0].count} records`);
    }

    console.log('====================================================');
    console.log('🎉 Database initialization completed successfully!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
