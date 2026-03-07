import React from 'react';
import type { TimeEntry, Task } from '@archtrack/shared';

interface TimeEntryListProps {
  entries: TimeEntry[];
  tasks: Task[];
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, tasks }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskName = (taskId?: string): string => {
    if (!taskId) return 'General Work';
    const task = tasks.find(t => t.id === taskId);
    return task?.name || 'Unknown Task';
  };

  if (entries.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No time entries yet. Start tracking to see your entries here!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {entries.slice(0, 20).map((entry) => (
        <div key={entry.id} style={styles.entry}>
          <div style={styles.entryMain}>
            <div style={styles.entryHeader}>
              <span style={styles.taskName}>{getTaskName(entry.taskId)}</span>
              {entry.isBillable && <span style={styles.billableBadge}>$</span>}
            </div>
            {entry.description && (
              <p style={styles.description}>{entry.description}</p>
            )}
            <span style={styles.date}>{formatDate(entry.startTime)}</span>
          </div>
          <div style={styles.duration}>
            {entry.duration > 0 ? formatDuration(entry.duration) : 'In progress...'}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#95a5a6'
  },
  entry: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  entryMain: {
    flex: 1
  },
  entryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  taskName: {
    fontWeight: 500,
    color: '#2c3e50'
  },
  billableBadge: {
    padding: '2px 6px',
    backgroundColor: '#27ae60',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600
  },
  description: {
    fontSize: '13px',
    color: '#7f8c8d',
    margin: '4px 0'
  },
  date: {
    fontSize: '12px',
    color: '#95a5a6'
  },
  duration: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#2c3e50',
    fontFamily: 'monospace'
  }
};