import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

// ─── Severity ranking (lower index = less severe) ─────────────────────────────
const SEVERITY_RANK: Record<string, number> = {
  healthy : 0,
  low     : 1,
  medium  : 2,
  high    : 3,
  critical: 4,
};

interface AnalysisBody {
  chatSessionId         : number;
  imageUrl              : string;
  imagePath             : string;
  diseaseDetected       : boolean;
  diseaseName?          : string;
  diseaseId?            : number;
  confidenceScore       : number;
  isHealthy             : boolean;
  modelVersion          : string;
  modelProcessingTime   : number;
  affectedAreaPercentage?: number;
  treatmentRecommendation?: string;
  urgencyLevel          : string;
  // ── NEW: plant tracking ──────────────────────────────────────
  plantId?              : number;   // link to maize_plants.id  (optional)
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const userId = req.userId!;

  try {
    const {
      chatSessionId,
      imageUrl,
      imagePath,
      diseaseDetected,
      diseaseName,
      diseaseId,
      confidenceScore,
      isHealthy,
      modelVersion,
      modelProcessingTime,
      affectedAreaPercentage,
      urgencyLevel,
      plantId,
    } = req.body as AnalysisBody;

    if (!chatSessionId || !imagePath || confidenceScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: chatSessionId, imagePath, confidenceScore',
      });
    }

    const connection = await pool.getConnection();

    try {
      // ── 1. Verify session belongs to user ──────────────────
      const [sessions] = await connection.execute(
        'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
        [chatSessionId, userId]
      );
      if ((sessions as any[]).length === 0) {
        return res.status(403).json({ success: false, message: 'Chat session not found or unauthorized' });
      }

      // ── 2. Validate plantId (if provided) ──────────────────
      if (plantId) {
        const [plants] = await connection.execute(
          'SELECT id FROM maize_plants WHERE id = ? AND user_id = ?',
          [plantId, userId]
        );
        if ((plants as any[]).length === 0) {
          return res.status(403).json({ success: false, message: 'Plant not found or unauthorized' });
        }
      }

      // ── 3. Determine scan sequence number ──────────────────
      let scanSequenceNumber = 1;
      let previousScan: any = null;

      if (plantId) {
        const [prevScans] = await connection.execute(
          `SELECT id, urgency_level, confidence_score, scan_sequence_number
           FROM analysis_results
           WHERE plant_id = ?
           ORDER BY scan_sequence_number DESC
           LIMIT 1`,
          [plantId]
        );
        if ((prevScans as any[]).length > 0) {
          previousScan       = (prevScans as any[])[0];
          scanSequenceNumber = previousScan.scan_sequence_number + 1;
        }
      }

      const isFirstScan = scanSequenceNumber === 1;

      // ── 4. Insert chat message ──────────────────────────────
      const messageContent = `Analysis #${scanSequenceNumber}: ${
        diseaseDetected
          ? `${diseaseName} detected (${confidenceScore}% confidence)`
          : 'Crop appears healthy'
      }${plantId ? ` [Plant ID: ${plantId}]` : ''}`;

      const [messageResult] = await connection.execute(
        'INSERT INTO chat_conversation (chat_session_id, role, content, image_url) VALUES (?, ?, ?, ?)',
        [chatSessionId, 'user', messageContent, imageUrl]
      );
      const messageId = (messageResult as any).insertId;

      // ── 5. Insert analysis_result with plant tracking ───────
      const [analysisResult] = await connection.execute(
        `INSERT INTO analysis_results
           (chat_message_id, plant_id, scan_sequence_number,
            disease_id, image_path, disease_detected, disease_name,
            confidence_score, is_healthy,
            model_version, processing_time_ms,
            affected_area_percentage, urgency_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          messageId,
          plantId            || null,
          scanSequenceNumber,
          diseaseId          || null,
          imagePath,
          diseaseDetected,
          diseaseName        || null,
          confidenceScore,
          isHealthy,
          modelVersion       || null,
          modelProcessingTime,
          affectedAreaPercentage || null,
          urgencyLevel       || 'medium',
        ]
      );

      const newAnalysisId = (analysisResult as any).insertId;

      // ── 6. Progression alert (if plant linked & follow-up scan) ──
      let alert: any = null;

      if (plantId && previousScan) {
        const prevSeverity = previousScan.urgency_level as string;
        const currSeverity = isHealthy ? 'healthy' : (urgencyLevel || 'medium');

        const prevRank = SEVERITY_RANK[prevSeverity] ?? 0;
        const currRank = SEVERITY_RANK[currSeverity] ?? 0;
        const delta    = currRank - prevRank;

        // Only create alert when disease has WORSENED (delta > 0)
        if (delta > 0) {
          const severityLabels = ['healthy', 'low', 'medium', 'high', 'critical'];
          const alertMsg =
            `⚠️ Disease progression detected on plant ${plantId}: ` +
            `severity changed from ${prevSeverity.toUpperCase()} → ${currSeverity.toUpperCase()} ` +
            `(+${delta} level${delta > 1 ? 's' : ''}) on scan #${scanSequenceNumber}.`;

          const [alertResult] = await connection.execute(
            `INSERT INTO plant_progression_alerts
               (plant_id, previous_analysis_id, current_analysis_id,
                previous_severity, current_severity,
                previous_confidence, current_confidence,
                severity_delta, alert_message)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              plantId,
              previousScan.id,
              newAnalysisId,
              prevSeverity,
              currSeverity,
              previousScan.confidence_score,
              confidenceScore,
              delta,
              alertMsg,
            ]
          );

          alert = {
            id              : (alertResult as any).insertId,
            plantId,
            previousSeverity: prevSeverity,
            currentSeverity : currSeverity,
            severityDelta   : delta,
            alertMessage    : alertMsg,
          };
        }
      }

      // ── 7. Respond ─────────────────────────────────────────
      return res.status(201).json({
        success: true,
        analysisResult: {
          id              : newAnalysisId,
          messageId,
          diseaseDetected,
          confidenceScore,
          diseaseName,
          plantId         : plantId || null,
          scanSequenceNumber,
          isFirstScan,
        },
        progressionAlert: alert,
        message: `Analysis result saved. Scan #${scanSequenceNumber}${isFirstScan ? ' (first scan for this plant)' : ' (follow-up scan)'}.`,
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[analysis/save-result] error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export default withAuth(handler);
