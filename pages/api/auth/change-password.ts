import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { comparePasswords, extractToken, hashPassword, verifyToken } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

interface SuccessResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const { currentPassword, newPassword } = req.body as ChangePasswordBody;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get user's current password hash
      const [users] = await connection.execute(
        'SELECT id, password_hash FROM users WHERE id = ? AND is_active = TRUE',
        [decoded.id]
      );

      const user = (users as any[])[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password and update
      const newPasswordHash = await hashPassword(newPassword);

      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, decoded.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
