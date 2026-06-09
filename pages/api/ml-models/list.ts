import type { NextApiRequest, NextApiResponse } from 'next';
import { applyCors, handleOptions } from '../../../utils/cors';

interface MLModel {
  id: number;
  model_name: string;
  model_version: string;
  model_type: string;
  framework: string;
  accuracy_score: number;
  precision: number;
  recall: number;
  f1_score: number;
  supported_diseases: any;
  input_shape: string;
}

interface ModelResponse {
  success: boolean;
  models?: MLModel[];
  model?: MLModel;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ModelResponse>
) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        models: [],
        message: 'ML model module is disabled in the current simplified database schema',
      });
    } else if (req.method === 'POST') {
      return res.status(400).json({
        success: false,
        message: 'ML model module is disabled in the current simplified database schema',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('ML model error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
