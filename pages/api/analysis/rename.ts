import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface RenameBody {
  chatSessionId: number;
  sessionName: string;
}

interface SuccessResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { chatSessionId, sessionName } = req.body as RenameBody;
    const userId = req.userId!;

    if (!chatSessionId || typeof sessionName !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'chatSessionId and a valid sessionName are required' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // First, verify the session belongs to the user
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

      // Update the session name
      await connection.execute(
        'UPDATE chat_sessions SET session_name = ? WHERE id = ?',
        [sessionName.trim().slice(0, 255), chatSessionId] // Enforce max length of 255
      );

      return res.status(200).json({
        success: true,
        message: 'Chat session renamed successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Rename chat session error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

export default withAuth(handler);
