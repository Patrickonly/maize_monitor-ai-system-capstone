import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

/**
 * GET /api/plants/[plantId]/progression
 *
 * Returns full scan history for a specific plant, plus:
 *  - severity trend (improving / worsening / stable)
 *  - any unread alerts
 *  - comparison between consecutive scans
 */

const SEVERITY_RANK: Record<string, number> = {
  healthy : 0,
  low     : 1,
  medium  : 2,
  high    : 3,
  critical: 4,
};

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const userId  = req.userId!;
  const plantId = Number(req.query.plantId);

  if (!plantId || isNaN(plantId)) {
    return res.status(400).json({ success: false, message: 'Invalid plantId' });
  }

  const connection = await pool.getConnection();

  try {
    // ── Verify plant belongs to user ─────────────────────────
    const [plants] = await connection.execute(
      'SELECT * FROM maize_plants WHERE id = ? AND user_id = ?',
      [plantId, userId]
    );
    if ((plants as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Plant not found or unauthorized' });
    }
    const plant = (plants as any[])[0];

    // ── All scans for this plant (oldest → newest) ──────────
    const [scans] = await connection.execute(
      `SELECT
         ar.id,
         ar.scan_sequence_number   AS scanNumber,
         ar.disease_detected       AS diseaseDetected,
         ar.disease_name           AS diseaseName,
         ar.confidence_score       AS confidenceScore,
         ar.is_healthy             AS isHealthy,
         ar.affected_area_percentage AS affectedArea,
         ar.urgency_level          AS severity,
         ar.model_version          AS modelVersion,
         ar.image_path             AS imagePath,
         ar.created_at             AS scannedAt
       FROM analysis_results ar
       WHERE ar.plant_id = ?
       ORDER BY ar.scan_sequence_number ASC`,
      [plantId]
    );

    const scanList = scans as any[];

    // ── Build comparison between consecutive scans ────────────
    const comparisons = [];
    for (let i = 1; i < scanList.length; i++) {
      const prev = scanList[i - 1];
      const curr = scanList[i];
      const prevRank = SEVERITY_RANK[prev.severity] ?? 0;
      const currRank = SEVERITY_RANK[curr.severity] ?? 0;
      const delta    = currRank - prevRank;

      comparisons.push({
        fromScan      : prev.scanNumber,
        toScan        : curr.scanNumber,
        severityChange: delta > 0 ? 'worsened' : delta < 0 ? 'improved' : 'stable',
        delta,
        previousSeverity: prev.severity,
        currentSeverity : curr.severity,
        confidenceDelta : Number((curr.confidenceScore - prev.confidenceScore).toFixed(2)),
        daysBetween     : Math.round(
          (new Date(curr.scannedAt).getTime() - new Date(prev.scannedAt).getTime())
          / 86_400_000
        ),
      });
    }

    // ── Overall trend ────────────────────────────────────────
    let trend = 'no_data';
    if (scanList.length >= 2) {
      const first = SEVERITY_RANK[scanList[0].severity] ?? 0;
      const last  = SEVERITY_RANK[scanList[scanList.length - 1].severity] ?? 0;
      trend = last > first ? 'worsening' : last < first ? 'improving' : 'stable';
    }

    // ── Unread alerts ────────────────────────────────────────
    const [alerts] = await connection.execute(
      `SELECT
         id,
         previous_severity AS previousSeverity,
         current_severity  AS currentSeverity,
         severity_delta    AS severityDelta,
         alert_message     AS alertMessage,
         is_read           AS isRead,
         created_at        AS createdAt
       FROM plant_progression_alerts
       WHERE plant_id = ?
       ORDER BY created_at DESC`,
      [plantId]
    );

    return res.status(200).json({
      success: true,
      plant: {
        id          : plant.id,
        plantCode   : plant.plant_code,
        label       : plant.label,
        location    : plant.location,
        fieldName   : plant.field_name,
        totalScans  : scanList.length,
        overallTrend: trend,
      },
      scans       : scanList,
      comparisons,
      alerts,
      message: 'Progression data retrieved successfully',
    });

  } catch (error) {
    console.error('[plants/progression] error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    connection.release();
  }
}

export default withAuth(handler);
