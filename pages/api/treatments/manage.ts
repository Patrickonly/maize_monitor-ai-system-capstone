import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface TreatmentBody {
  fieldId: number;
  diseaseId?: number;
  treatmentDate: string;
  treatmentType: string;
  chemicalUsed?: string;
  quantity: number;
  unit: string;
  effectivenessRating?: number;
  notes?: string;
}

interface TreatmentResponse {
  success: boolean;
  treatment?: any;
  treatments?: any[];
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<TreatmentResponse>
) {
  const userId = req.userId!;

  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        treatments: [],
        message: 'Treatment module is disabled in the current simplified database schema',
      });
    } else if (req.method === 'POST') {
      return res.status(400).json({
        success: false,
        message: 'Treatment module is disabled in the current simplified database schema',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Treatment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(handler);
