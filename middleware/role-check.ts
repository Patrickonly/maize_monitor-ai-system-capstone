import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '../utils/user-management';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
      isAdmin?: boolean;
    }
  }
}

// Middleware to verify JWT token
export async function verifyToken(req: NextApiRequest, res: NextApiResponse, next?: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    (req as any).userId = decoded.userId;
    (req as any).userRoleId = decoded.roleId;
    (req as any).isAdmin = false; // Will be determined by isAdmin() check

    if (next) next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware to require admin role
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse, next?: Function) {
  try {
    await verifyToken(req, res, () => {});
    
    const userId = (req as any).userId;
    const isUserAdmin = await isAdmin(userId);

    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    if (next) next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Extract user from request
export function getUserFromRequest(req: NextApiRequest): any {
  return {
    userId: (req as any).userId,
    role: (req as any).userRole,
    isAdmin: (req as any).isAdmin
  };
}
