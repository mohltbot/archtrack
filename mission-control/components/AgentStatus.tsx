'use client';

import { Agent } from '@/lib/models';

interface AgentStatusProps {
  agents: Agent[];
}

const statusColors = {
  idle: 'bg-gray-500',
  running: 'bg-blue-500 animate-pulse',
  completed: 'bg-green-500',
  error: 'bg-red-500',
};

export function AgentStatus({ agents }: AgentStatusProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Sub-Agents</h2>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {agents.length === 0 ? (
          <p className="text-gray-500 text-sm">No agents running</p>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="text-xs text-gray-400">{agent.task || 'Idle'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
