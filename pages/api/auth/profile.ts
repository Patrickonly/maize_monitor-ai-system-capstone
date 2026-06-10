import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { extractToken, verifyToken } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing authorization header' });
    }

    const token = extractToken(authHeader);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token format' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }

    const userId = decoded.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const connection = await pool.getConnection();

    try {
      // Check if email already exists for another user
      const [existingRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if ((existingRows as any[]).length > 0) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
      }

      await connection.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId]
      );

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: { id: userId, name, email, role: decoded.role }
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Profile Update API Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', details: error.message });
  }
}
