'use client';

import { BookOpen, FileText, Calendar, Star } from 'lucide-react';
import { useState } from 'react';

interface MemoryFile {
  name: string;
  path: string;
  type: 'core' | 'daily' | 'important';
  lastModified?: string;
}

const memoryFiles: MemoryFile[] = [
  {
    name: 'MEMORY.md',
    path: '/MEMORY.md',
    type: 'core',
    lastModified: '2026-02-25'
  },
  {
    name: '2026-02-25.md',
    path: '/memory/2026-02-25.md',
    type: 'daily',
    lastModified: '2026-02-25'
  }
];

const typeConfig = {
  core: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Core' },
  daily: { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Daily' },
  important: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Important' },
};

export function MemoryBrowser() {
  const [selectedMemory, setSelectedMemory] = useState<MemoryFile | null>(null);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Memory System</h2>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
          {memoryFiles.length} files
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Memory Files List */}
        <div className="space-y-2">
          {memoryFiles.map((file) => {
            const config = typeConfig[file.type];
            const Icon = config.icon;
            
            return (
              <button
                key={file.path}
                onClick={() => setSelectedMemory(file)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  selectedMemory?.path === file.path
                    ? 'bg-slate-700/60 border border-purple-500/30'
                    : 'bg-slate-800/40 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{file.path}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </button>
            );
          })}
          
          {/* Add new memory hint */}
          <div className="p-3 rounded-xl border border-dashed border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">Memories auto-saved daily</p>
          </div>
        </div>

        {/* Memory Preview */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
          {selectedMemory ? (
            <div>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                {(() => {
                  const config = typeConfig[selectedMemory.type];
                  const Icon = config.icon;
                  return <Icon className={`w-4 h-4 ${config.color}`} />;
                })()}
                <h3 className="text-sm font-medium text-slate-200">{selectedMemory.name}</h3>
              </div>
              <div className="text-xs text-slate-400 space-y-2">
                {selectedMemory.path === '/MEMORY.md' && (
                  <>
                    <p><strong className="text-slate-300">Core Identity:</strong> mohltbot — AI employee for Mohammed Wasif</p>
                    <p><strong className="text-slate-300">Mission:</strong> Build 1-person unicorn with AI agents</p>
                    <p><strong className="text-slate-300">Budget:</strong> $200/mo API limit</p>
                    <p><strong className="text-slate-300">Work Style:</strong> Autonomous, proactive, PR-based approval</p>
                    <p><strong className="text-slate-300">Key Person:</strong> Mohammed — Type A, 2 failed startups, fighting for marriage, wants to be "undeniable"</p>
                  </>
                )}
                {selectedMemory.path === '/memory/2026-02-25.md' && (
                  <>
                    <p><strong className="text-slate-300">Date:</strong> February 25, 2026</p>
                    <p><strong className="text-slate-300">Achievement:</strong> Built Mission Control v0.1</p>
                    <p><strong className="text-slate-300">Features:</strong> Task board, budget tracker, agent monitor, glassmorphism UI</p>
                    <p><strong className="text-slate-300">Automation:</strong> Nightly work sessions at 2 AM PST</p>
                    <p><strong className="text-slate-300">Status:</strong> 5 tasks (3 done), $0.0036 spent, 1 agent completed</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">Select a memory file to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
