import React, { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { TaskSelector } from './components/TaskSelector';
import { TimeEntryList } from './components/TimeEntryList';
import { SyncStatus } from './components/SyncStatus';
import { Settings } from './components/Settings';
import { EmployeeSetup } from './components/EmployeeSetup';
import { EmployeeSelector } from './components/EmployeeSelector';
import type { TimeEntry, Task, Project, AppSettings, Employee } from '@archtrack/shared';

const App: React.FC = () => {
  // Employee state
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  
  // App state
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [idleTime, setIdleTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check setup on mount
  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const result = await window.electronAPI.checkSetup();
      if (result.success) {
        setIsSetup(result.data.isSetup);
        if (result.data.isSetup) {
          setCurrentEmployee(result.data.employee);
          loadData();
        }
      }
    } catch (error) {
      console.error('Error checking setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsSetup(true);
    loadData();
  };

  const handleSwitchEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setShowEmployeeSelector(false);
    loadData();
  };

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [activeResult, tasksResult, projectsResult, entriesResult, settingsResult] = await Promise.all([
        window.electronAPI.getActiveTimeEntry(),
        window.electronAPI.getTasks(),
        window.electronAPI.getProjects(),
        window.electronAPI.getTimeEntries(),
        window.electronAPI.getSettings()
      ]);

      if (activeResult.success) setActiveEntry(activeResult.data);
      if (tasksResult.success) setTasks(tasksResult.data);
      if (projectsResult.success) setProjects(projectsResult.data);
      if (entriesResult.success) setTimeEntries(entriesResult.data);
      if (settingsResult.success) setSettings(settingsResult.data);
      
      setupEventListeners();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    window.electronAPI.onOnline(() => setIsOnline(true));
    window.electronAPI.onOffline(() => setIsOnline(false));
    window.electronAPI.onIdleDetected((detectedIdleTime: number) => {
      setIdleTime(detectedIdleTime);
      if (activeEntry && settings?.trackIdleTime) {
        console.log('Idle detected:', detectedIdleTime);
      }
    });
  };

  // Cleanup listeners
  useEffect(() => {
    return () => {
      window.electronAPI.removeAllListeners('app:online');
      window.electronAPI.removeAllListeners('app:offline');
      window.electronAPI.removeAllListeners('idle:detected');
    };
  }, []);

  const handleStart = async () => {
    try {
      const result = await window.electronAPI.startTimeEntry({
        taskId: selectedTaskId || undefined,
        projectId: selectedProjectId || undefined,
        description: description || undefined,
        isBillable: true
      });

      if (result.success) {
        setActiveEntry(result.data);
        setIdleTime(0);
        loadData();
      }
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handleStop = async () => {
    if (!activeEntry) return;

    try {
      const now = new Date();
      const startTime = new Date(activeEntry.startTime);
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);

      const result = await window.electronAPI.stopTimeEntry({
        endTime: now.toISOString(),
        duration,
        idleTime
      });

      if (result.success) {
        setActiveEntry(null);
        setIdleTime(0);
        loadData();
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const handleSync = async () => {
    try {
      const result = await window.electronAPI.syncWithServer();
      if (result.success) {
        console.log('Synced', result.data.syncedEntries, 'entries');
      }
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const result = await window.electronAPI.updateSettings(newSettings);
      if (result.success) {
        const settingsResult = await window.electronAPI.getSettings();
        if (settingsResult.success) {
          setSettings(settingsResult.data);
        }
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Show loading state
  if (isLoading && isSetup === null) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading ArchTrack...</div>
      </div>
    );
  }

  // Show setup screen if not set up
  if (!isSetup) {
    return <EmployeeSetup onComplete={handleSetupComplete} />;
  }

  // Show employee selector
  if (showEmployeeSelector) {
    return (
      <EmployeeSelector 
        onSelect={handleSwitchEmployee} 
        onCancel={() => setShowEmployeeSelector(false)}
        currentEmployeeId={currentEmployee?.id}
      />
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>ArchTrack</h1>
          {currentEmployee && (
            <button 
              style={styles.employeeButton}
              onClick={() => setShowEmployeeSelector(true)}
            >
              👤 {currentEmployee.name}
            </button>
          )}
        </div>
        <div style={styles.headerActions}>
          <SyncStatus isOnline={isOnline} onSync={handleSync} />
          <button style={styles.iconButton} onClick={() => setShowSettings(!showSettings)}>
            ⚙️
          </button>
          <button style={styles.iconButton} onClick={() => window.electronAPI.minimizeToTray()}>
            🗕️
          </button>
        </div>
      </header>

      {showSettings && settings && (
        <Settings 
          settings={settings} 
          onSave={handleSaveSettings} 
          onCancel={() => setShowSettings(false)} 
        />
      )}

      <main style={styles.main}>
        <div style={styles.timerSection}>
          <Timer 
            activeEntry={activeEntry}
            onStart={handleStart}
            onStop={handleStop}
          />
          
          {!activeEntry && (
            <div style={styles.inputSection}>
              <TaskSelector
                tasks={tasks}
                projects={projects}
                selectedTaskId={selectedTaskId}
                selectedProjectId={selectedProjectId}
                onTaskChange={setSelectedTaskId}
                onProjectChange={setSelectedProjectId}
              />
              <input
                type="text"
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.descriptionInput}
              />
            </div>
          )}
        </div>

        <div style={styles.entriesSection}>
          <h2 style={styles.sectionTitle}>Recent Time Entries</h2>
          <TimeEntryList entries={timeEntries} tasks={tasks} />
        </div>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    fontSize: '18px',
    color: '#666'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#2c3e50',
    margin: 0
  },
  employeeButton: {
    padding: '6px 12px',
    backgroundColor: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '16px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#1565c0'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background 0.2s'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  timerSection: {
    padding: '32px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0'
  },
  inputSection: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  descriptionInput: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '100%'
  },
  entriesSection: {
    flex: 1,
    padding: '24px',
    overflow: 'auto'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#333'
  }
};

export default App;