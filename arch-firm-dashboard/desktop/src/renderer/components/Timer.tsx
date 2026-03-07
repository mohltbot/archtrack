import React from 'react';
import type { TimeEntry } from '@archtrack/shared';

interface TimerProps {
  activeEntry: TimeEntry | null;
  onStart: () => void;
  onStop: () => void;
}

export const Timer: React.FC<TimerProps> = ({ activeEntry, onStart, onStop }) => {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeEntry) {
      const startTime = new Date(activeEntry.startTime).getTime();
      
      interval = setInterval(() => {
        const now = Date.now();
        setElapsed(Math.floor((now - startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEntry]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.timeDisplay}>
        {formatTime(elapsed)}
      </div>
      
      {activeEntry ? (
        <button style={styles.stopButton} onClick={onStop}>
          ⏹ Stop Tracking
        </button>
      ) : (
        <button style={styles.startButton} onClick={onStart}>
          ▶ Start Tracking
        </button>
      )}
      
      {activeEntry && (
        <div style={styles.activeInfo}>
          <span style={styles.statusBadge}>Tracking</span>
          {activeEntry.description && (
            <span style={styles.description}>{activeEntry.description}</span>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  timeDisplay: {
    fontSize: '72px',
    fontWeight: 300,
    fontFamily: 'monospace',
    color: '#2c3e50',
    letterSpacing: '4px'
  },
  startButton: {
    padding: '16px 48px',
    fontSize: '18px',
    fontWeight: 600,
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(39, 174, 96, 0.3)'
  },
  stopButton: {
    padding: '16px 48px',
    fontSize: '18px',
    fontWeight: 600,
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(231, 76, 60, 0.3)'
  },
  activeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px'
  },
  statusBadge: {
    padding: '4px 12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  description: {
    color: '#666',
    fontSize: '14px'
  }
};