import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface ChatBody {
  chatSessionId: number;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  analysisResult?: string;
}

interface SuccessResponse {
  success: boolean;
  message: {
    id: number;
    chatSessionId: number;
    role: string;
    content: string;
    imageUrl?: string;
    analysisResult?: string;
    createdAt: string;
  };
  responseMessage: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { chatSessionId, role, content, imageUrl, analysisResult } = req.body as ChatBody;
    const userId = req.userId!;

    if (!chatSessionId || !role || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'chatSessionId, role, and content are required' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // Verify chat session belongs to user
      const [sessions] = await connection.execute(
        'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
        [chatSessionId, userId]
      );

      if ((sessions as any[]).length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Chat session not found or unauthorized' 
        });
      }

      // Insert message
      const [result] = await connection.execute(
        'INSERT INTO chat_conversation (chat_session_id, role, content, image_url) VALUES (?, ?, ?, ?)',
        [chatSessionId, role, content, imageUrl || null]
      );

      const messageId = (result as any).insertId;

      return res.status(201).json({
        success: true,
        message: {
          id: messageId,
          chatSessionId,
          role,
          content,
          imageUrl,
          analysisResult,
          createdAt: new Date().toISOString(),
        },
        responseMessage: 'Message saved successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

export default withAuth(handler);
