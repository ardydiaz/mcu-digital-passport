import mysql from 'mysql2/promise';
import { env } from './environment.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  namedPlaceholders: true,
  timezone: 'Z',
});

// Store and compare all times in UTC (DEFAULT CURRENT_TIMESTAMP uses the session time zone).
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
