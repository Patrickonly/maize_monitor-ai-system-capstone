import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../middleware/auth';

interface FieldBody {
  fieldName: string;
  cropType: string;
  plantingDate: string;
  expectedHarvestDate: string;
  areaAcres: number;
  locationLatitude?: number;
  locationLongitude?: number;
  weatherPattern?: string;
  notes?: string;
}

interface FieldResponse {
  success: boolean;
  field?: any;
  fields?: any[];
  message: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<FieldResponse>
) {
  const userId = req.userId!;

  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        fields: [],
        message: 'Field module is disabled in the current simplified database schema',
      });
    } else if (req.method === 'POST') {
      return res.status(400).json({
        success: false,
        message: 'Field module is disabled in the current simplified database schema',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Field error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default withAuth(handler);
