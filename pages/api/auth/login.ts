import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { comparePasswords, generateToken } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';

interface LoginBody {
  email: string;
  password: string;
}

interface SuccessResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    name: string;
    role?: string;
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
    const { email, password } = req.body as LoginBody;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get user with role
      const [users] = await connection.execute(
        'SELECT u.id, u.email, u.name, u.password_hash, u.is_active, u.role_id, r.name AS role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
        [email]
      );

      const user = (users as any[])[0];

      if (!user || !user.is_active) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Compare password
      const isPasswordValid = await comparePasswords(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Generate token
      const token = generateToken(user.id, user.email, user.role_id);

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        message: 'Login successful',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
