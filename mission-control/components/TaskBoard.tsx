'use client';

import { Task } from '@/lib/models';

interface TaskBoardProps {
  tasks: Task[];
}

const statusColors = {
  pending: 'bg-gray-600',
  in_progress: 'bg-blue-600',
  completed: 'bg-green-600',
  blocked: 'bg-red-600',
};

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Tasks</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-gray-700 rounded p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-gray-400">{task.category || 'Uncategorized'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</span>
                <span className={`w-2 h-2 rounded-full ${statusColors[task.status]}`} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
