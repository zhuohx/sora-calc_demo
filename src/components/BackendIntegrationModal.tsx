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
          {/* Custom Endpoint Configuration */}
          <div className="bg-[#121C33] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                Custom Backend Endpoint URL
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {customApiUrl ? 'Connected' : 'Defaulting to embedded verified MAS data'}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://your-api.com/api/sora/rates (or /api/mas/sora)"
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

            <div className="text-[11px] text-slate-400">
              When your backend is ready, enter its URL above. The frontend automatically parses both raw JSON arrays <code className="font-mono text-emerald-300">{'[{ date, rate, volumeSgdMillion }]'}</code> and standard MAS DataStore responses <code className="font-mono text-emerald-300">{'{"result": {"records": [...]}}'}</code>.
            </div>
          </div>

          {/* Official MAS API Details */}
          <div className="bg-[#121C33]/50 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="font-semibold text-slate-200">Official MAS SORA DataStore Resource ID</div>
            <div className="flex items-center justify-between bg-[#080D1A] p-2.5 rounded border border-slate-800 font-mono text-[11px] text-emerald-400">
              <span>9a0bf149-308d-4bd4-aec6-322144e6021b</span>
              <button
                onClick={() => handleCopy('9a0bf149-308d-4bd4-aec6-322144e6021b', 'res-id')}
                className="text-slate-400 hover:text-white"
              >
                {copiedSnippet === 'res-id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              MAS publishes SORA daily on every Singapore business day by 9:00 AM SGT reflecting the prior business day's interbank unsecured SGD transactions.
            </p>
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
