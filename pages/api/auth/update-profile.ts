import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { extractToken, verifyToken } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';

interface UpdateBody {
  name?: string;
  email?: string;
  phone?: string;
}

interface SuccessResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    phone: string | null;
    name: string;
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

    const { name, email, phone } = req.body as UpdateBody;

    // Ensure at least one field is provided
    if (!name && !email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [users] = await connection.execute(
        'SELECT id, email, phone, name FROM users WHERE id = ? AND is_active = TRUE',
        [decoded.id]
      );

      const user = (users as any[])[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check email uniqueness if changing email
      if (email && email !== user.email) {
        const [existingEmail] = await connection.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, decoded.id]
        );

        if ((existingEmail as any[]).length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use',
          });
        }
      }

      // Check phone uniqueness if changing phone
      if (phone && phone !== user.phone) {
        const [existingPhone] = await connection.execute(
          'SELECT id FROM users WHERE phone = ? AND id != ?',
          [phone, decoded.id]
        );

        if ((existingPhone as any[]).length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Phone number already in use',
          });
        }
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      if (phone) {
        updates.push('phone = ?');
        values.push(phone);
      }

      values.push(decoded.id);

      await connection.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Fetch updated user
      const [updatedUsers] = await connection.execute(
        'SELECT id, email, phone, name FROM users WHERE id = ?',
        [decoded.id]
      );

      const updatedUser = (updatedUsers as any[])[0];

      return res.status(200).json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          phone: updatedUser.phone,
          name: updatedUser.name,
        },
        message: 'Profile updated successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
