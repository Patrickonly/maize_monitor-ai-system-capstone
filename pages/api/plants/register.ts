import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

/**
 * POST /api/plants/register
 *   Create a new plant record for the authenticated user.
 *   Returns the plant_id to use in subsequent scan submissions.
 *
 * GET /api/plants/register
 *   List all plants belonging to the authenticated user.
 */

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const userId = req.userId!;
  const connection = await pool.getConnection();

  try {
    // ── LIST PLANTS ───────────────────────────────────────────
    if (req.method === 'GET') {
      const [rows] = await connection.execute(
        `SELECT
           p.id,
           p.plant_code    AS plantCode,
           p.label,
           p.location,
           p.field_name    AS fieldName,
           p.planted_at    AS plantedAt,
           p.notes,
           p.is_active     AS isActive,
           p.created_at    AS createdAt,
           COUNT(ar.id)    AS totalScans,
           MAX(ar.created_at) AS lastScanAt,
           (
             SELECT ar2.urgency_level
             FROM analysis_results ar2
             WHERE ar2.plant_id = p.id
             ORDER BY ar2.created_at DESC
             LIMIT 1
           ) AS latestSeverity
         FROM maize_plants p
         LEFT JOIN analysis_results ar ON ar.plant_id = p.id
         WHERE p.user_id = ?
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [userId]
      );

      return res.status(200).json({
        success: true,
        plants: rows,
        message: 'Plants retrieved successfully',
      });
    }

    // ── REGISTER PLANT ────────────────────────────────────────
    if (req.method === 'POST') {
      const { plantCode, label, location, fieldName, plantedAt, notes } =
        req.body as {
          plantCode: string;
          label?: string;
          location?: string;
          fieldName?: string;
          plantedAt?: string;
          notes?: string;
        };

      if (!plantCode) {
        return res.status(400).json({
          success: false,
          message: 'plantCode is required (e.g. "FIELD-A-R3-P7")',
        });
      }

      // Check for duplicate
      const [existing] = await connection.execute(
        'SELECT id FROM maize_plants WHERE user_id = ? AND plant_code = ?',
        [userId, plantCode]
      );
      if ((existing as any[]).length > 0) {
        return res.status(409).json({
          success: false,
          message: `Plant with code "${plantCode}" already exists for this user.`,
          plantId: (existing as any[])[0].id,
        });
      }

      const [result] = await connection.execute(
        `INSERT INTO maize_plants
           (user_id, plant_code, label, location, field_name, planted_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          plantCode,
          label    || null,
          location || null,
          fieldName || null,
          plantedAt || null,
          notes    || null,
        ]
      );

      const plantId = (result as any).insertId;

      return res.status(201).json({
        success: true,
        plant: {
          id: plantId,
          plantCode,
          label,
          location,
          fieldName,
          plantedAt,
          notes,
          totalScans: 0,
          createdAt: new Date().toISOString(),
        },
        message: `Plant "${plantCode}" registered successfully. Use plant_id=${plantId} when submitting scans.`,
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('[plants/register] error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    connection.release();
  }
}

export default withAuth(handler);
