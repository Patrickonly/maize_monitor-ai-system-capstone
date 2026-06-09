import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { comparePasswords, extractToken, verifyToken } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';

interface DeleteBody {
  password: string;
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

  if (req.method !== 'DELETE') {
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

    const { password } = req.body as DeleteBody;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get user's password hash
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

      // Verify password before deletion
      const isPasswordValid = await comparePasswords(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Password is incorrect',
        });
      }

      // Delete user (cascades to chat_sessions, chat_conversation, analysis_results)
      await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [decoded.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
