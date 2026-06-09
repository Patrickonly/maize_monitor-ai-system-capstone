import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface MessageSummary {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

interface MessagesResponse {
  success: boolean;
  messages?: MessageSummary[];
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<MessagesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const userId = req.userId!;
  const chatSessionId = Number(req.query.chatSessionId);

  if (!chatSessionId) {
    return res.status(400).json({
      success: false,
      message: 'chatSessionId is required',
    });
  }

  try {
    const connection = await pool.getConnection();

    try {
      const [sessions] = await connection.execute(
        'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
        [chatSessionId, userId]
      );

      if ((sessions as any[]).length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Chat session not found or unauthorized',
        });
      }

      const [rows] = await connection.execute(
        `SELECT 
          id,
          role,
          content,
          image_url as imageUrl,
          created_at as createdAt
        FROM chat_conversation
        WHERE chat_session_id = ?
        ORDER BY created_at ASC`,
        [chatSessionId]
      );

      return res.status(200).json({
        success: true,
        messages: rows as MessageSummary[],
        message: 'Messages retrieved successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(handler);
