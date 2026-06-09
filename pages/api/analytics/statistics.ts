import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface StatisticsResponse {
  success: boolean;
  statistics?: any;
  diseaseStats?: any[];
  fieldAnalysis?: any[];
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<StatisticsResponse>
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
      // Get user's overall statistics
      const [userStats] = await connection.execute(
        `SELECT 
          COUNT(DISTINCT cs.id) as total_chat_sessions,
          COUNT(DISTINCT ar.id) as total_analyses,
          SUM(CASE WHEN ar.disease_detected = TRUE THEN 1 ELSE 0 END) as diseases_detected,
          AVG(ar.confidence_score) as average_confidence
        FROM users u
        LEFT JOIN chat_sessions cs ON u.id = cs.user_id
        LEFT JOIN chat_conversation cc ON cs.id = cc.chat_session_id
        LEFT JOIN analysis_results ar ON cc.id = ar.chat_message_id
        WHERE u.id = ?`,
        [userId]
      );

      // Get disease statistics for user's analyses
      const [diseaseStats] = await connection.execute(
        `SELECT 
          d.id,
          d.name,
          d.severity_level,
          COUNT(ar.id) as detection_count,
          AVG(ar.confidence_score) as avg_confidence,
          MAX(ar.created_at) as last_detected,
          SUM(CASE WHEN MONTH(ar.created_at) = MONTH(NOW()) THEN 1 ELSE 0 END) as this_month_count
        FROM diseases d
        LEFT JOIN analysis_results ar ON d.id = ar.disease_id
        LEFT JOIN chat_conversation cc ON ar.chat_message_id = cc.id
        LEFT JOIN chat_sessions cs ON cc.chat_session_id = cs.id
        WHERE cs.user_id = ? AND ar.id IS NOT NULL
        GROUP BY d.id, d.name, d.severity_level
        ORDER BY detection_count DESC`,
        [userId]
      );

      // Field module removed from simplified schema
      const fieldAnalysis: any[] = [];

      return res.status(200).json({
        success: true,
        statistics: (userStats as any[])[0],
        diseaseStats: diseaseStats as any[],
        fieldAnalysis: fieldAnalysis as any[],
        message: 'Statistics retrieved successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(handler);
