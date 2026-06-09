import { NextApiRequest, NextApiResponse } from 'next';

/** Allow any localhost / 127.0.0.1 port (Flutter web uses a random port each run). */
export function isAllowedDevOrigin(origin: string): boolean {
  if (!origin) {
    return false;
  }
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export function applyCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '';

  if (isAllowedDevOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, X-Requested-With',
  );
}

export function handleOptions(
  req: NextApiRequest,
  res: NextApiResponse,
): boolean {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
