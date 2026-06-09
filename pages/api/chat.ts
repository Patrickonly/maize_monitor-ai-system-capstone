import type { NextApiRequest, NextApiResponse } from 'next';
import { applyCors, handleOptions } from '../../utils/cors';

const MAIZE_ML_URL = (
  process.env.NEXT_PUBLIC_MAIZE_API_URL || process.env.MAIZE_API_URL || 'http://localhost:5000'
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

      // Intercept the hardcoded backend ChatGPT error message
      if (
        data.response &&
        data.response.includes("I can't call ChatGPT right now")
      ) {
        data.response = "I am the Maize AI Assistant! I can help you with questions about maize diseases and treatments. Please feel free to ask or upload an image for diagnosis.";
      }

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
        'Cannot reach the server. Please try again later.',
      source: 'fallback',
    });
  }
}
