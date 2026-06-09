import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface ImageUploadResponse {
  success: boolean;
  imagePath?: string;
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ImageUploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { imageData, fileName, chatSessionId } = req.body;
    const userId = req.userId!;

    if (!imageData || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Image data and file name are required',
      });
    }

    // Verify chat session belongs to user
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

      // Save image path (actual file saving should be done on frontend or separate service)
      const imagePath = `/uploads/${userId}/${Date.now()}-${fileName}`;

      return res.status(200).json({
        success: true,
        imagePath,
        message: 'Image path generated successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(handler);
