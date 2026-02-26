'use client';

import { useState } from 'react';
import { Task } from '@/lib/models';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Edit3,
  Trash2,
  X,
  Save,
  Plus
} from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (id: number) => void;
  onTaskCreate?: (task: Partial<Task>) => void;
}

const statusConfig = {
  pending: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Pending' },
  in_progress: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Completed' },
  blocked: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Blocked' },
};

const priorityConfig = {
  low: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

function TaskBoardComponent({ tasks, onTaskUpdate, onTaskDelete, onTaskCreate }: TaskBoardProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm(task);
  };

  const handleSave = async () => {
    if (editingId && editForm) {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      
      if (response.ok) {
        const updated = await response.json();
        onTaskUpdate?.(updated);
        setEditingId(null);
        setEditForm({});
      }
    }
  };

  const handleCreate = async () => {
    if (editForm.title) {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || '',
          status: editForm.status || 'pending',
          priority: editForm.priority || 'medium',
          category: editForm.category || 'general',
        }),
      });
      
      if (response.ok) {
        const created = await response.json();
        onTaskCreate?.(created);
        setIsCreating(false);
        setEditForm({});
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this task?')) {
      const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        onTaskDelete?.(id);
      }
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status: newStatus }),
    });
    
    if (response.ok) {
      const updated = await response.json();
      onTaskUpdate?.({ ...task, status: newStatus });
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
            {tasks.length} total
          </span>
          <button
            onClick={() => { setIsCreating(true); setEditForm({}); }}
            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create New Task */}
      {isCreating && (
        <div className="mb-4 p-4 rounded-xl bg-slate-800/60 border border-blue-500/30">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
            />
            <textarea
              placeholder="Description (optional)..."
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none h-20 resize-none"
            />
            <div className="flex gap-2">
              <select
                value={editForm.priority || 'medium'}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
                className="p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={editForm.status || 'pending'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                className="p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
              >
                Create Task
              </button>
              <button
                onClick={() => { setIsCreating(false); setEditForm({}); }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-800/50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No tasks yet</p>
            <p className="text-slate-600 text-xs mt-1">Click + to add one</p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const status = statusConfig[task.status];
            const priority = priorityConfig[task.priority];
            const StatusIcon = status.icon;
            const isEditing = editingId === task.id;
            
            return (
              <div 
                key={task.id} 
                className={`group p-4 rounded-xl transition-all duration-200 ${
                  task.status === 'completed' 
                    ? 'bg-slate-800/30 opacity-70' 
                    : 'bg-slate-800/40 hover:bg-slate-800/60'
                } border border-white/5 hover:border-white/10`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                    />
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none h-16 resize-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={editForm.priority || 'medium'}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
                        className="p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      <select
                        value={editForm.status || 'pending'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                        className="p-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleStatus(task)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-500 hover:border-blue-400'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-medium text-sm leading-tight ${
                          task.status === 'completed' 
                            ? 'text-slate-500 line-through' 
                            : 'text-slate-200 group-hover:text-white'
                        } transition-colors`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className={`text-xs mb-2 ${
                          task.status === 'completed' ? 'text-slate-600' : 'text-slate-500'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-[10px]">
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`w-3 h-3 ${status.color}`} />
                          <span className={status.color}>{status.label}</span>
                        </div>
                        
                        <span className={`px-1.5 py-0.5 rounded ${priority.bg} ${priority.color}`}>
                          {task.priority}
                        </span>
                        
                        {task.category && (
                          <span className="text-slate-500">
                            {task.category}
                          </span>
                        )}
                        
                        <div className="flex items-center gap-1 ml-auto text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { TaskBoardComponent as TaskBoard };
