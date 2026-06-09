import type { NextApiResponse } from 'next';
import { pool } from '../../../database/connection';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface DiseaseResponse {
  success: boolean;
  diseases?: any[];
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<DiseaseResponse>
) {
  try {
    if (req.method === 'GET') {
      // Get all diseases
      const connection = await pool.getConnection();
      try {
        const [diseases] = await connection.execute(
          'SELECT * FROM diseases WHERE is_active = TRUE ORDER BY severity_level DESC'
        );

        return res.status(200).json({
          success: true,
          diseases: diseases as any[],
          message: 'Diseases retrieved successfully',
        });
      } finally {
        connection.release();
      }
    } else if (req.method === 'POST') {
      // Create new disease (admin only)
      const {
        name,
        scientific_name,
        description,
        severity_level,
        crop_type,
        symptoms,
        treatment_recommendation,
        prevention_methods,
      } = req.body;

      if (!name || !crop_type) {
        return res.status(400).json({
          success: false,
          message: 'Disease name and crop type are required',
        });
      }

      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          `INSERT INTO diseases 
          (name, scientific_name, description, severity_level, crop_type, symptoms, treatment, prevention) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            scientific_name || null,
            description || null,
            severity_level || 'medium',
            crop_type,
            symptoms || null,
            treatment_recommendation || null,
            prevention_methods || null,
          ]
        );

        return res.status(201).json({
          success: true,
          message: 'Disease created successfully',
        });
      } finally {
        connection.release();
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Disease error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(handler);
