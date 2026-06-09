import type { NextApiResponse } from 'next';
import { pool } from '../../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../../middleware/auth';

/**
 * PATCH /api/plants/[plantId]/alerts
 *   Mark all alerts for a plant as read.
 *
 * GET /api/plants/[plantId]/alerts
 *   Fetch all (or only unread) alerts for a plant.
 */

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const userId  = req.userId!;
  const plantId = Number(req.query.plantId);

  if (!plantId || isNaN(plantId)) {
    return res.status(400).json({ success: false, message: 'Invalid plantId' });
  }

  const connection = await pool.getConnection();

  try {
    // Verify ownership
    const [plants] = await connection.execute(
      'SELECT id FROM maize_plants WHERE id = ? AND user_id = ?',
      [plantId, userId]
    );
    if ((plants as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Plant not found or unauthorized' });
    }

    if (req.method === 'GET') {
      const onlyUnread = req.query.unread === 'true';
      const [rows] = await connection.execute(
        `SELECT
           id,
           previous_severity AS previousSeverity,
           current_severity  AS currentSeverity,
           severity_delta    AS severityDelta,
           alert_message     AS alertMessage,
           is_read           AS isRead,
           created_at        AS createdAt
         FROM plant_progression_alerts
         WHERE plant_id = ? ${onlyUnread ? 'AND is_read = FALSE' : ''}
         ORDER BY created_at DESC`,
        [plantId]
      );

      return res.status(200).json({ success: true, alerts: rows });
    }

    if (req.method === 'PATCH') {
      // Mark all as read
      await connection.execute(
        'UPDATE plant_progression_alerts SET is_read = TRUE WHERE plant_id = ?',
        [plantId]
      );
      return res.status(200).json({ success: true, message: 'Alerts marked as read' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('[plants/alerts] error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    connection.release();
  }
}

export default withAuth(handler);
