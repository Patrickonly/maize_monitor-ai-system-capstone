import type { NextApiRequest, NextApiResponse } from 'next';
import { applyCors, handleOptions } from '../../utils/cors';

const MAIZE_ML_URL = (
  process.env.MAIZE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

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
    const upstream = await fetch(`${MAIZE_ML_URL}/api/chat`, {
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
    console.error('Chat proxy error:', error);
    return res.status(200).json({
      ok: false,
      message: 'ML chat service is unavailable.',
      response:
        'The AI chat server is offline. Please start the ML service on port 5000 and try again.',
      source: 'fallback',
    });
  }
}
