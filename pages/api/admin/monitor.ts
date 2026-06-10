import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { extractToken, verifyToken } from '../../../utils/auth';
import { applyCors, handleOptions } from '../../../utils/cors';
import { isAdmin } from '../../../utils/user-management';

const isDisease = (text: string) => /Disease Detected|Blight|Rust|Virus|Spot/i.test(text);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
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
      // Get all chat sessions with their latest AI message
      const [rows] = await connection.execute(`
        SELECT 
          cs.id,
          cs.created_at as createdAt,
          SUBSTRING_INDEX(
            MAX(CONCAT(DATE_FORMAT(cc.created_at, '%Y-%m-%d %H:%i:%s'), '||', cc.content)),
            '||',
            -1
          ) as lastMessage
        FROM chat_sessions cs
        LEFT JOIN chat_conversation cc ON cs.id = cc.chat_session_id AND cc.role = 'assistant'
        GROUP BY cs.id, cs.created_at
        ORDER BY cs.created_at DESC
      `);

      const sessions = rows as any[];
      let totalAnalyses = sessions.length;
      let diseaseAlerts = 0;
      let healthyScans = 0;

      let blightCount = 0;
      let spotCount = 0;
      let rustCount = 0;
      let virusCount = 0;

      sessions.forEach(session => {
        if (!session.lastMessage) return;
        
        const msg = session.lastMessage;
        if (isDisease(msg)) {
          diseaseAlerts++;
          
          if (/blight/i.test(msg)) blightCount++;
          else if (/spot/i.test(msg)) spotCount++;
          else if (/rust/i.test(msg)) rustCount++;
          else virusCount++; // default to virus if generic disease
        } else {
          healthyScans++;
        }
      });

      // Fetch active system users
      const [userRows] = await connection.execute(`
        SELECT COUNT(id) as totalUsers FROM users WHERE is_active = true AND role_id = 2
      `);
      const totalActiveUsers = (userRows as any[])[0].totalUsers;

      return res.status(200).json({
        success: true,
        stats: {
          totalAnalyses,
          diseaseAlerts,
          healthyScans,
          totalActiveUsers,
          diseaseBreakdown: {
            blight: blightCount,
            spot: spotCount,
            rust: rustCount,
            virus: virusCount
          }
        },
        message: 'System monitor stats retrieved'
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Admin monitor API Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', details: error.message });
  }
}
