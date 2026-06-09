import type { NextApiRequest, NextApiResponse } from 'next';
import { applyCors, handleOptions } from '../../utils/cors';

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    return res.status(200).json({
      status: 'ok',
      message: 'Smart Maize Health Monitor API is running!',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
