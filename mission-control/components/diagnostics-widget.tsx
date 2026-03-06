'use client';

import { useState, useEffect } from 'react';
import { DiagnosticReport } from '@/lib/diagnostics';

export function DiagnosticsWidget() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll show a placeholder structure
    setLoading(false);
  }, []);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-500',
      completed: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      critical: 'bg-red-700',
    };
    return colors[level] || 'bg-gray-500';
  };

  const getLevelEmoji = (level: string) => {
    const emojis: Record<string, string> = {
      info: 'ℹ️',
      completed: '✅',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    };
    return emojis[level] || 'ℹ️';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Agent Self-Diagnostics</h3>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          Live
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : diagnostics.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-8 text-center">
          <div className="mb-2 text-2xl">🤖</div>
          <p className="text-gray-600">No diagnostics reported yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Agents will self-report issues as they occur
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {diagnostics.map((diag) => (
            <div
              key={diag.id}
              className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
            >
              <span className="text-lg">{getLevelEmoji(diag.level)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${getLevelColor(diag.level)}`} />
                  <span className="font-medium text-gray-900">{diag.agentName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(diag.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{diag.message}</p>
                {diag.duration && (
                  <p className="mt-1 text-xs text-gray-500">
                    Duration: {(diag.duration / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-gray-100 pt-3">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded bg-green-50 p-2">
            <div className="font-semibold text-green-700">0</div>
            <div className="text-green-600">Completed</div>
          </div>
          <div className="rounded bg-yellow-50 p-2">
            <div className="font-semibold text-yellow-700">0</div>
            <div className="text-yellow-600">Warnings</div>
          </div>
          <div className="rounded bg-red-50 p-2">
            <div className="font-semibold text-red-700">0</div>
            <div className="text-red-600">Errors</div>
          </div>
        </div>
      </div>
    </div>
  );
}
