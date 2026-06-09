import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '173.212.204.250',
  user: process.env.DB_USER || 'capstoneproject',
  password: process.env.DB_PASSWORD ?? 'capstoneproject',
  database: process.env.DB_NAME || 'capstoneproject',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function getConnection() {
  return await pool.getConnection();
}
