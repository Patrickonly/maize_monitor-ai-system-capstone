import bcrypt from 'bcrypt';
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
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const connection = await pool.getConnection();

    try {
      // Get the user's current password hash
      const [userRows] = await connection.execute(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      const user = (userRows as any[])[0];
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid current password' });
      }

      // Hash new password and update
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Password Update API Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', details: error.message });
  }
}
