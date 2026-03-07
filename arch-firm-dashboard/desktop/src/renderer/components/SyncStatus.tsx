import React from 'react';

interface SyncStatusProps {
  isOnline: boolean;
  onSync: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ isOnline, onSync }) => {
  return (
    <div style={styles.container}>
      <div style={styles.statusIndicator(isOnline)}>
        <span style={styles.dot(isOnline)} />
        {isOnline ? 'Online' : 'Offline'}
      </div>
      <button onClick={onSync} style={styles.syncButton} title="Sync now">
        🔄
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties | any } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusIndicator: (isOnline: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: isOnline ? '#27ae60' : '#e74c3c',
    padding: '4px 8px',
    backgroundColor: isOnline ? '#e8f5e9' : '#ffebee',
    borderRadius: '12px'
  }),
  dot: (isOnline: boolean) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isOnline ? '#27ae60' : '#e74c3c'
  }),
  syncButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px'
  }
};