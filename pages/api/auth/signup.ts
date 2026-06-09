import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { generateToken, hashPassword } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';

interface SignupBody {
  email: string;
  phone: string;
  password: string;
  name: string;
}

interface SuccessResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    phone?: string;
    name: string;
  };
  token: string;
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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, phone, password, name } = req.body as SignupBody;

    // Validation
    if (!email || !phone || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, phone, password, and name are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ? OR phone = ?',
        [email, phone]
      );

      if ((existingUser as any[]).length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'User already exists' 
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Get default 'user' role id — create it if missing
      const [roleRows]: any = await connection.execute(
        'SELECT id FROM roles WHERE name = ?',
        ['user']
      );

      let defaultRoleId: number;
      if (roleRows.length > 0) {
        defaultRoleId = roleRows[0].id;
      } else {
        // Auto-seed the 'user' role if it doesn't exist
        const [insertResult]: any = await connection.execute(
          'INSERT INTO roles (name, description) VALUES (?, ?)',
          ['user', 'Standard user with limited access']
        );
        defaultRoleId = insertResult.insertId;
      }

      // Create user
      const [result] = await connection.execute(
        'INSERT INTO users (email, phone, password_hash, name, role_id) VALUES (?, ?, ?, ?, ?)',
        [email, phone, passwordHash, name, defaultRoleId]
      );

      const userId = (result as any).insertId;

      // Generate token
      const token = generateToken(userId, email, defaultRoleId);

      return res.status(201).json({
        success: true,
        user: {
          id: userId,
          email,
          phone,
          name,
        },
        token,
        message: 'Account created successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
