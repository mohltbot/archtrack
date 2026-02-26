'use client';

import { useState, useCallback } from 'react';
import { TaskBoard } from './TaskBoard';
import { Task } from '@/lib/models';

interface TaskBoardWrapperProps {
  initialTasks: Task[];
}

export function TaskBoardWrapper({ initialTasks }: TaskBoardWrapperProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, []);

  const handleTaskDelete = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleTaskCreate = useCallback((newTask: Partial<Task>) => {
    setTasks(prev => [newTask as Task, ...prev]);
  }, []);

  return (
    <TaskBoard
      tasks={tasks}
      onTaskUpdate={handleTaskUpdate}
      onTaskDelete={handleTaskDelete}
      onTaskCreate={handleTaskCreate}
    />
  );
}
