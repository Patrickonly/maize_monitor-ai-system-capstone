import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface CreateAnalysisBody {
  sessionName?: string;
}

interface SuccessResponse {
  success: boolean;
  chatSession: {
    id: number;
    userId: number;
    sessionName: string;
    createdAt: string;
  };
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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { sessionName } = req.body as CreateAnalysisBody;
    const userId = req.userId!;

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'INSERT INTO chat_sessions (user_id, session_name) VALUES (?, ?)',
        [userId, sessionName || `Analysis ${new Date().toLocaleDateString()}`]
      );

      const sessionId = (result as any).insertId;

      return res.status(201).json({
        success: true,
        chatSession: {
          id: sessionId,
          userId,
          sessionName: sessionName || `Analysis ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
        },
        message: 'Chat session created successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create analysis error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

export default withAuth(handler);
