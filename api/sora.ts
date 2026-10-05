import type { Request, Response } from 'express';

const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

// In-memory cache for serverless invocation reuse
interface CacheState {
  data: any | null;
  timestamp: number;
}

const cache: CacheState = {
  data: null,
  timestamp: 0
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export interface NormalizedSoraRecord {
  date: string;
  rate: number;
  compounded1M?: number;
  compounded3M?: number;
  compounded6M?: number;
  volumeSgdMillion?: number;
  soraIndex?: number;
  raw?: Record<string, any>;
}

/**
 * Serverless SORA API Endpoint
 * Connects to MAS Gateway with KeyId header.
 * Route: /api/sora
 */
export default async function handler(req: Request | any, res: Response | any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-mas-key-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported on this endpoint'
    });
  }

  // 1. Resolve MAS_KEY_ID without hardcoding
  const masKey =
    process.env.MAS_KEY_ID ||
    process.env.MAS_API_KEY ||
    (req.headers['keyid'] as string) ||
    (req.headers['x-mas-key-id'] as string);

  const urlObj = new URL(req.url || '/api/sora', 'http://localhost');
  const queryParams = urlObj.searchParams;
  const isRefresh = queryParams.get('refresh') === 'true' || queryParams.get('nocache') === '1';

  // 2. Validate API Key presence
  if (!masKey || masKey.trim() === '') {
    return res.status(400).json({
      error: 'MAS_KEY_ID_MISSING',
      message:
        'MAS_KEY_ID environment variable is not configured. Please add MAS_KEY_ID to your environment variables or provide KeyId in request headers.',
      documentation:
        'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily',
      instructions:
        'Set MAS_KEY_ID="<your_api_key>" in your deployment environment variables or .env file.'
    });
  }

  // 3. Check Cache
  const now = Date.now();
  if (!isRefresh && cache.data && now - cache.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      source: 'cache',
      cachedAt: new Date(cache.timestamp).toISOString(),
      count: cache.data.length,
      records: cache.data
    });
  }

  // 4. Construct request to MAS API Gateway
  try {
    const targetUrl = new URL(MAS_SORA_ENDPOINT);

    // Forward supported pagination or query filters
    const limit = queryParams.get('limit') || '100';
    targetUrl.searchParams.set('limit', limit);

    const sort = queryParams.get('sort') || 'end_of_day desc';
    targetUrl.searchParams.set('sort', sort);

    if (queryParams.has('start_period')) {
      targetUrl.searchParams.set('start_period', queryParams.get('start_period')!);
    }
    if (queryParams.has('end_period')) {
      targetUrl.searchParams.set('end_period', queryParams.get('end_period')!);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9500);

    const masResponse = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'KeyId': masKey.trim(),
        'Accept': 'application/json',
        'User-Agent': 'SORA-Calculator-Serverless/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!masResponse.ok) {
      const errorText = await masResponse.text();
      return res.status(masResponse.status).json({
        error: `MAS_GATEWAY_ERROR_${masResponse.status}`,
        status: masResponse.status,
        statusText: masResponse.statusText,
        message:
          masResponse.status === 401 || masResponse.status === 403
            ? 'Authentication failed with MAS Gateway. Verify your MAS_KEY_ID credentials.'
            : 'MAS Gateway returned an error.',
        details: errorText.slice(0, 500)
      });
    }

    const rawData = await masResponse.json();

    // 5. Parse and normalize records
    let rawRecords: any[] = [];
    if (Array.isArray(rawData)) {
      rawRecords = rawData;
    } else if (rawData?.result?.records && Array.isArray(rawData.result.records)) {
      rawRecords = rawData.result.records;
    } else if (rawData?.data && Array.isArray(rawData.data)) {
      rawRecords = rawData.data;
    } else if (rawData?.records && Array.isArray(rawData.records)) {
      rawRecords = rawData.records;
    }

    const normalizedRecords: NormalizedSoraRecord[] = [];
    for (const item of rawRecords) {
      const date = item.end_of_day || item.date || item.Date || item.period;
      const rate = parseFloat(item.sora || item.rate || item.SORA);
      const comp1M = parseFloat(item.sora_comp_1m || item.compounded_sora_1m || item.sora_1m);
      const comp3M = parseFloat(item.sora_comp_3m || item.compounded_sora_3m || item.sora_3m);
      const comp6M = parseFloat(item.sora_comp_6m || item.compounded_sora_6m || item.sora_6m);
      const volume = parseFloat(item.sora_volume || item.volume || item.volume_sgd_m);
      const indexVal = parseFloat(item.sora_index || item.index_val);

      if (date && !isNaN(rate)) {
        normalizedRecords.push({
          date: String(date),
          rate,
          compounded1M: isNaN(comp1M) ? undefined : comp1M,
          compounded3M: isNaN(comp3M) ? undefined : comp3M,
          compounded6M: isNaN(comp6M) ? undefined : comp6M,
          volumeSgdMillion: isNaN(volume) ? undefined : volume,
          soraIndex: isNaN(indexVal) ? undefined : indexVal,
          raw: item
        });
      }
    }

    // Save to in-memory cache
    if (normalizedRecords.length > 0) {
      cache.data = normalizedRecords;
      cache.timestamp = now;
    }

    return res.status(200).json({
      source: 'mas_live_gateway',
      fetchedAt: new Date(now).toISOString(),
      count: normalizedRecords.length,
      records: normalizedRecords
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'MAS_GATEWAY_TIMEOUT',
        message: 'Request to MAS Gateway timed out after 9.5s. Try again shortly.'
      });
    }

    return res.status(500).json({
      error: 'SERVERLESS_PROXY_ERROR',
      message: err.message || 'Failed to connect to MAS Gateway',
      details: String(err)
    });
  }
}
