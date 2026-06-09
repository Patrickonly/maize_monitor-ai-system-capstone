import type { NextApiRequest, NextApiResponse } from 'next';
import { applyCors, handleOptions } from '../../utils/cors';

const MAIZE_ML_URL = (
  process.env.NEXT_PUBLIC_MAIZE_API_URL || 
  process.env.MAIZE_API_URL || 
  'https://patrickonly-maize-assitant-monitor-2v2e.onrender.com'
).replace(/\/api\/?$/, '').replace(/\/$/, '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    });
  }

  try {
    const upstream = await fetch(`${MAIZE_ML_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {}),
    });

    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await upstream.json();

      return res.status(upstream.status).json(data);
    }

    const text = await upstream.text();
    return res.status(upstream.status).json({
      ok: upstream.ok,
      message: text || 'Unexpected ML service response',
    });
  } catch (error) {
    console.error('Predict proxy error:', error);
    return res.status(200).json({
      ok: false,
      message:
        'ML diagnosis service is unavailable. Start the maize ML server on port 5000.',
      type: 'text',
      response:
        'Cannot reach the server. Please try again later.',
      source: 'fallback',
    });
  }
}
