import React from 'react';
import type { Task, Project } from '@archtrack/shared';

interface TaskSelectorProps {
  tasks: Task[];
  projects: Project[];
  selectedTaskId: string;
  selectedProjectId: string;
  onTaskChange: (taskId: string) => void;
  onProjectChange: (projectId: string) => void;
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({
  tasks,
  projects,
  selectedTaskId,
  selectedProjectId,
  onTaskChange,
  onProjectChange
}) => {
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Group tasks by project
  const tasksByProject = tasks.reduce((acc, task) => {
    if (!acc[task.projectId]) {
      acc[task.projectId] = [];
    }
    acc[task.projectId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleProjectChange = (projectId: string) => {
    onProjectChange(projectId);
    // Clear task selection when project changes
    onTaskChange('');
  };

  const handleTaskChange = (taskId: string) => {
    onTaskChange(taskId);
    // Auto-select project based on task
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onProjectChange(task.projectId);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.field}>
        <label style={styles.label}>Project</label>
        <select
          value={selectedProjectId}
          onChange={(e) => handleProjectChange(e.target.value)}
          style={styles.select}
        >
          <option value="">Select a project...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Task</label>
        <select
          value={selectedTaskId}
          onChange={(e) => handleTaskChange(e.target.value)}
          style={styles.select}
          disabled={!selectedProjectId}
        >
          <option value="">Select a task...</option>
          {selectedProjectId && tasksByProject[selectedProjectId]?.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name} {task.status === 'in_progress' ? '(In Progress)' : ''}
            </option>
          ))}
          {!selectedProjectId && tasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            return (
              <option key={task.id} value={task.id}>
                {task.name} {project ? `- ${project.name}` : ''}
              </option>
            );
          })}
        </select>
      </div>

      {selectedTask && (
        <div style={styles.taskInfo}>
          <span style={styles.priorityBadge(selectedTask.priority)}>
            {selectedTask.priority}
          </span>
          {selectedTask.estimatedHours && (
            <span style={styles.estimatedHours}>
              Est: {selectedTask.estimatedHours}h
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties | any } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#555'
  },
  select: {
    padding: '10px 12px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  taskInfo: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  priorityBadge: (priority: string) => ({
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor: priority === 'high' ? '#fee' : priority === 'medium' ? '#ffeaa7' : '#dfe6e9',
    color: priority === 'high' ? '#c0392b' : priority === 'medium' ? '#d63031' : '#636e72'
  }),
  estimatedHours: {
    fontSize: '12px',
    color: '#7f8c8d'
  }
};