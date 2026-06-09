import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface SessionSummary {
  id: number;
  sessionName: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string | null;
}

interface SessionsResponse {
  success: boolean;
  sessions?: SessionSummary[];
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<SessionsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const userId = req.userId!;

  try {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        `SELECT 
          cs.id,
          cs.session_name as sessionName,
          cs.created_at as createdAt,
          COALESCE(MAX(cc.created_at), cs.created_at) as updatedAt,
          COUNT(cc.id) as messageCount,
          SUBSTRING_INDEX(
            MAX(CONCAT(DATE_FORMAT(cc.created_at, '%Y-%m-%d %H:%i:%s'), '||', cc.content)),
            '||',
            -1
          ) as lastMessage
        FROM chat_sessions cs
        LEFT JOIN chat_conversation cc ON cs.id = cc.chat_session_id
        WHERE cs.user_id = ?
        GROUP BY cs.id, cs.session_name, cs.created_at
        ORDER BY updatedAt DESC`,
        [userId]
      );

      const sessions = (rows as any[]).map((row) => ({
        ...row,
        messageCount: Number(row.messageCount || 0),
      }));

      return res.status(200).json({
        success: true,
        sessions,
        message: 'Sessions retrieved successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Sessions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(handler);
