const mysql = require('mysql2/promise');
require('dotenv').config();

// Debugging: This will show up in Railway Logs
console.log('--- DATABASE CONFIG ---');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('-----------------------');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Required for many cloud databases
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
