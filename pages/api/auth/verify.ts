import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { extractToken, verifyToken } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';

interface SuccessResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
    role?: string;
  };
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const connection = await pool.getConnection();

    try {
      const [users] = await connection.execute(
        'SELECT u.id, u.email, u.name, r.name AS role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND u.is_active = TRUE',
        [decoded.id]
      );

      const user = (users as any[])[0];

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Token is valid',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
