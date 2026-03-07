import React, { useState } from 'react';
import type { AppSettings } from '@archtrack/shared';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: Partial<AppSettings>) => void;
  onCancel: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    serverUrl: settings.serverUrl,
    idleThresholdMinutes: settings.idleThresholdMinutes,
    trackIdleTime: settings.trackIdleTime,
    minimizeToTray: settings.minimizeToTray
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button onClick={onCancel} style={styles.closeButton}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Server URL</label>
            <input
              type="url"
              value={formData.serverUrl}
              onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Idle Threshold (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.idleThresholdMinutes}
              onChange={(e) => setFormData({ ...formData, idleThresholdMinutes: parseInt(e.target.value) })}
              style={styles.input}
            />
          </div>

          <div style={styles.checkboxField}>
            <input
              type="checkbox"
              id="trackIdleTime"
              checked={formData.trackIdleTime}
              onChange={(e) => setFormData({ ...formData, trackIdleTime: e.target.checked })}
            />
            <label htmlFor="trackIdleTime">Track idle time</label>
          </div>

          <div style={styles.checkboxField}>
            <input
              type="checkbox"
              id="minimizeToTray"
              checked={formData.minimizeToTray}
              onChange={(e) => setFormData({ ...formData, minimizeToTray: e.target.checked })}
            />
            <label htmlFor="minimizeToTray">Minimize to system tray</label>
          </div>

          <div style={styles.buttons}>
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0'
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#95a5a6'
  },
  form: {
    padding: '24px'
  },
  field: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box'
  },
  checkboxField: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ecf0f1',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px'
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 500
  }
};