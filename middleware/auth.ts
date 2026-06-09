import { NextApiRequest, NextApiResponse } from 'next';
import { extractToken, verifyToken } from '../utils/auth';
import { applyCors } from '../utils/cors';

export interface AuthenticatedRequest extends NextApiRequest {
  userId?: number;
  userEmail?: string;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      applyCors(req, res);

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      const token = extractToken(req.headers.authorization);

      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }

      req.userId = decoded.id;
      req.userEmail = decoded.email;

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}
