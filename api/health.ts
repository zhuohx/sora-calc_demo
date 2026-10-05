import type { Request, Response } from 'express';

interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptime: number;
  masKeyConfigured: boolean;
  endpoints: {
    health: string;
    sora: string;
  };
}

/**
 * Serverless Health Check endpoint
 * Route: /api/health
 */
export default async function handler(req: Request | any, res: Response | any) {
  // Allow cross-origin requests for serverless deployments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const masKey = process.env.MAS_KEY_ID || process.env.MAS_API_KEY;

  const responseData: HealthResponse = {
    status: 'ok',
    service: 'mas-sora-serverless-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    masKeyConfigured: Boolean(masKey && masKey.trim().length > 0),
    endpoints: {
      health: '/api/health',
      sora: '/api/sora'
    }
  };

  return res.status(200).json(responseData);
}
