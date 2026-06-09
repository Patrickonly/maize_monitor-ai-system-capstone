import { NextApiRequest, NextApiResponse } from 'next';
import { applyCors, handleOptions } from '../../../utils/cors';
import {
    activateUser,
    deactivateUser,
    getAllUsers,
    updateUserRole
} from '../../../utils/user-management';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  try {
    // Verify admin access
    if (req.method !== 'OPTIONS') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
      }

      // For now, we'll check admin status from JWT in headers
      // In a real app, this would be done via middleware
    }

    // GET: Fetch all users (admin only)
    if (req.method === 'GET') {
      try {
        // For demo purposes, we'll accept any authenticated request
        // In production, use requireAdmin middleware
        const users = await getAllUsers(1); // Using admin user ID 1 for now
        return res.status(200).json({
          success: true,
          data: users
        });
      } catch (error: any) {
        return res.status(403).json({ error: error.message });
      }
    }

    // POST: Update user role or status (admin only)
    if (req.method === 'POST') {
      const { action, targetUserId, newRole } = req.body;

      try {
        const adminId = 1; // This should come from JWT token in production

        switch (action) {
          case 'update-role':
            if (!targetUserId || !newRole) {
              return res.status(400).json({ error: 'Missing targetUserId or newRole' });
            }
            if (!['admin', 'user'].includes(newRole)) {
              return res.status(400).json({ error: 'Invalid role. Must be "admin" or "user"' });
            }
            const roleResult = await updateUserRole(adminId, targetUserId, newRole as 'admin' | 'user');
            return res.status(200).json({ success: true, data: roleResult });

          case 'deactivate':
            if (!targetUserId) {
              return res.status(400).json({ error: 'Missing targetUserId' });
            }
            const deactivateResult = await deactivateUser(adminId, targetUserId);
            return res.status(200).json({ success: true, data: deactivateResult });

          case 'activate':
            if (!targetUserId) {
              return res.status(400).json({ error: 'Missing targetUserId' });
            }
            const activateResult = await activateUser(adminId, targetUserId);
            return res.status(200).json({ success: true, data: activateResult });

          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
      } catch (error: any) {
        return res.status(403).json({ error: error.message });
      }
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('Admin API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
