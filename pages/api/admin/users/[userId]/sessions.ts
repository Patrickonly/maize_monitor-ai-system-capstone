import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../../../database/connection';
import { extractToken, verifyToken } from '../../../../../utils/auth';
import { applyCors, handleOptions } from '../../../../../utils/cors';
import { isAdmin } from '../../../../../utils/user-management';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const targetUserId = req.query.userId;
  if (!targetUserId) {
    return res.status(400).json({ success: false, message: 'userId parameter is required' });
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

    // Verify admin
    const adminId = decoded.id;
    const isUserAdmin = await isAdmin(adminId);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }

    const connection = await pool.getConnection();

    try {
      // Get all chat sessions with a summary (latest message, count)
      // 1. Fetch user details
      const [userRows] = await connection.execute(
        'SELECT id, name, email, is_active FROM users WHERE id = ?',
        [targetUserId]
      );
      
      const targetUser = (userRows as any[])[0];
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // 2. Fetch sessions
      const [rows] = await connection.execute(`
        SELECT 
          cs.id,
          cs.session_name as sessionName,
          cs.created_at as createdAt,
          cs.updated_at as updatedAt,
          COUNT(cc.id) as messageCount,
          (
            SELECT content 
            FROM chat_conversation 
            WHERE chat_session_id = cs.id AND role = 'assistant' 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as lastMessage
        FROM chat_sessions cs
        LEFT JOIN chat_conversation cc ON cs.id = cc.chat_session_id
        WHERE cs.user_id = ?
        GROUP BY cs.id, cs.session_name, cs.created_at, cs.updated_at
        ORDER BY cs.updated_at DESC
      `, [targetUserId]);

      return res.status(200).json({
        success: true,
        user: targetUser,
        sessions: rows,
        message: 'Sessions retrieved successfully'
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Admin Fetch User Sessions Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', details: error.message });
  }
}
