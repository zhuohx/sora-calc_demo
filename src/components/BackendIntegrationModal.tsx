import React, { useState } from 'react';
import { X, Code, Check, Copy, ExternalLink, Server, Globe, Play } from 'lucide-react';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiUrl: string;
  onSaveCustomApiUrl: (url: string) => void;
  onTestConnection: (url: string) => Promise<{ success: boolean; message: string }>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  customApiUrl,
  onSaveCustomApiUrl,
  onTestConnection
}) => {
  const [urlInput, setUrlInput] = useState(customApiUrl);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(urlInput);
      setTestResult(res);
      if (res.success) {
        onSaveCustomApiUrl(urlInput);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const expressSnippet = `// Node.js / Express Proxy to MAS DataStore API
// Install: npm install express axios
import express from 'express';
import axios from 'axios';

const app = express();
const MAS_SORA_DATASET_ID = '9a0bf149-308d-4bd4-aec6-322144e6021b';
let cache = { data: null, timestamp: 0 };

app.get('/api/sora/rates', async (req, res) => {
  try {
    // Cache for 1 hour to respect MAS rate limits
    if (cache.data && Date.now() - cache.timestamp < 3600000) {
      return res.json(cache.data);
    }

    const masUrl = \`https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=\${MAS_SORA_DATASET_ID}&limit=100&sort=end_of_day%20desc\`;
    const response = await axios.get(masUrl, {
      headers: { 'Accept': 'application/json' }
    });

    const records = response.data.result.records.map(rec => ({
      date: rec.end_of_day,
      rate: parseFloat(rec.sora),
      volumeSgdMillion: parseFloat(rec.sora_volume || 0)
    }));

    cache = { data: records, timestamp: Date.now() };
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve MAS rates', details: err.message });
  }
});

app.listen(3000, () => console.log('SORA backend running on port 3000'));`;

  const pythonSnippet = `# Python / FastAPI Proxy for MAS SORA
from fastapi import FastAPI
import httpx
import time

app = FastAPI()
MAS_API = "https://eservices.mas.gov.sg/api/action/datastore/search.json"
RESOURCE_ID = "9a0bf149-308d-4bd4-aec6-322144e6021b"

@app.get("/api/sora/rates")
async def get_sora_rates():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            MAS_API,
            params={"resource_id": RESOURCE_ID, "limit": 100, "sort": "end_of_day desc"}
        )
        data = resp.json()
        records = [
            {
                "date": r.get("end_of_day"),
                "rate": float(r.get("sora")),
                "volumeSgdMillion": float(r.get("sora_volume", 0))
            }
            for r in data.get("result", {}).get("records", [])
        ]
        return records`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D1527] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Backend Integration & MAS API Connector</h2>
              <p className="text-xs text-slate-400">
                Plug your backend endpoint when ready or verify MAS DataStore integration contracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Serverless Connection Status */}
          <div className="bg-[#121C33] border border-emerald-800/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                Active Serverless Connection (/api/sora & /api/health)
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono border border-emerald-800">
                Installed in /api/
              </span>
            </div>

            <p className="text-[11px] text-slate-300">
              The application provides two serverless functions located at the project root <code className="font-mono text-emerald-300">/api/health.ts</code> and <code className="font-mono text-emerald-300">/api/sora.ts</code>. These endpoints securely relay requests to the official MAS Domestic Interest Rates Gateway using your <code className="font-mono text-cyan-300">KeyId</code> header.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-[#080D1A] p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">HEALTH PROBE</span>
                <span className="text-slate-200">GET /api/health</span>
              </div>
              <div className="bg-[#080D1A] p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">DAILY SORA & COMPOUNDED</span>
                <span className="text-emerald-400">GET /api/sora</span>
              </div>
            </div>
          </div>

          {/* Custom Endpoint Configuration */}
          <div className="bg-[#121C33] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                Test API Endpoint URL
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {customApiUrl || '/api/sora (default)'}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="/api/sora (or custom external URL)"
                className="flex-1 bg-[#080D1A] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTesting ? 'Testing...' : 'Test & Save'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                <span className="font-mono">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Official MAS API Gateway Details */}
          <div className="bg-[#121C33]/50 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="font-semibold text-slate-200">MAS Gateway Endpoint & Header Requirement</div>
            <div className="bg-[#080D1A] p-2.5 rounded border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5">
              <div>
                <span className="text-slate-500">TARGET: </span>
                <span className="text-cyan-300 break-all">https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily</span>
              </div>
              <div>
                <span className="text-slate-500">HEADER: </span>
                <span className="text-emerald-400">KeyId: &lt;MAS_KEY_ID&gt;</span>
              </div>
              <div>
                <span className="text-slate-500">ENV VAR: </span>
                <span className="text-amber-300">MAS_KEY_ID</span> in <code className="text-slate-300">.env</code> (No hardcoded keys)
              </div>
            </div>
          </div>

          {/* Backend Code Snippets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Sample Backend Proxy Implementation</span>
              <span className="text-[10px] text-slate-400">Caches MAS data to prevent rate-limiting</span>
            </div>

            {/* Express.js Snippet */}
            <div className="relative">
              <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-800 text-[11px] text-slate-400">
                <span>Express.js / Node.js Proxy Service</span>
                <button
                  onClick={() => handleCopy(expressSnippet, 'express')}
                  className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                >
                  {copiedSnippet === 'express' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === 'express' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="bg-[#080D1A] p-3 rounded-b-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {expressSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
