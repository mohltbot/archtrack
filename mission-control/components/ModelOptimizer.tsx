'use client';

import { useState } from 'react';
import { Cpu, Zap, Brain, TrendingDown, CheckCircle } from 'lucide-react';

interface ModelRecommendation {
  provider: string;
  model: string;
  estimatedCost: number;
  confidence: number;
  reason: string;
}

interface CostComparison {
  model: string;
  cost: number;
  tier: string;
  recommended: boolean;
}

const TASK_TYPES = [
  { value: 'coding', label: 'Coding', icon: Cpu },
  { value: 'writing', label: 'Writing', icon: Brain },
  { value: 'analysis', label: 'Analysis', icon: Brain },
  { value: 'creative', label: 'Creative', icon: Brain },
  { value: 'chat', label: 'Chat', icon: Brain },
];

const TIERS = [
  { value: 'fast', label: 'Fast/Cheap', icon: Zap },
  { value: 'balanced', label: 'Balanced', icon: Brain },
  { value: 'powerful', label: 'Powerful', icon: Cpu },
];

export function ModelOptimizer() {
  const [task, setTask] = useState('coding');
  const [tier, setTier] = useState('balanced');
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>([]);
  const [comparison, setComparison] = useState<CostComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [savings, setSavings] = useState<string>('0');

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/models/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, tier }),
      });
      const data = await res.json();
      setRecommendations(data.recommendations);
      
      // Also get cost comparison
      const compareRes = await fetch(`/api/models/compare?task=${task}&tokens=1000`);
      const compareData = await compareRes.json();
      setComparison(compareData.comparisons);
      setSavings(compareData.savings.potentialSavings);
    } catch (e) {
      console.error('Error fetching recommendations:', e);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <Cpu className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Model Cost Optimizer</h2>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-slate-400 block mb-2">Task Type</label>
          <select
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-slate-800/60 border border-white/10 text-slate-200 text-sm focus:border-blue-500/50 focus:outline-none"
          >
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-2">Quality Tier</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-slate-800/60 border border-white/10 text-slate-200 text-sm focus:border-blue-500/50 focus:outline-none"
          >
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={getRecommendations}
        disabled={loading}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 mb-6"
      >
        {loading ? 'Analyzing...' : 'Get Recommendations'}
      </button>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-slate-300">Top Recommendations</h3>
          {recommendations.map((rec, idx) => (
            <div
              key={rec.model}
              className={`p-3 rounded-xl border transition-all ${
                idx === 0
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-800/40 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {idx === 0 && <CheckCircle className="w-4 h-4 text-blue-400" />}
                  <span className="font-medium text-slate-200">{rec.model}</span>
                  <span className="text-xs text-slate-500">({rec.provider})</span>
                </div>
                <span className="text-sm font-mono text-emerald-400">
                  ${rec.estimatedCost.toFixed(4)}/1K
                </span>
              </div>
              <p className="text-xs text-slate-400">{rec.reason}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${rec.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {(rec.confidence * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost Comparison */}
      {comparison.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-300">Cost Comparison (per 1K tokens)</h3>
          </div>
          
          <div className="space-y-2 mb-4">
            {comparison.slice(0, 6).map((comp) => (
              <div
                key={comp.model}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  comp.recommended ? 'bg-emerald-500/10' : 'bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      comp.tier === 'fast' ? 'bg-blue-400' :
                      comp.tier === 'powerful' ? 'bg-purple-400' :
                      'bg-emerald-400'
                    }`}
                  />
                  <span className="text-sm text-slate-300">{comp.model}</span>
                </div>
                <span className={`text-sm font-mono ${
                  comp.recommended ? 'text-emerald-400 font-medium' : 'text-slate-400'
                }`}>
                  ${comp.cost.toFixed(4)}
                </span>
              </div>
            ))}
          </div>

          {parseFloat(savings) > 0 && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-sm text-emerald-400">
                💰 Potential savings: <strong>{savings}%</strong> by using the recommended model
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
