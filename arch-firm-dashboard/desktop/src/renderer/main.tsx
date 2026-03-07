import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Type declaration for the exposed electron API
declare global {
  interface Window {
    electronAPI: {
      // Employee
      checkSetup: () => Promise<any>;
      getEmployee: () => Promise<any>;
      createEmployee: (input: { name: string; email: string }) => Promise<any>;
      updateEmployee: (updates: any) => Promise<any>;
      getEmployees: () => Promise<any>;
      switchEmployee: (employeeId: string) => Promise<any>;
      
      // Time tracking
      startTimeEntry: (input: any) => Promise<any>;
      stopTimeEntry: (input: any) => Promise<any>;
      getActiveTimeEntry: () => Promise<any>;
      getTimeEntries: (startDate?: string, endDate?: string) => Promise<any>;
      
      // Tasks & Projects
      getTasks: () => Promise<any>;
      getTask: (id: string) => Promise<any>;
      getProjects: () => Promise<any>;
      
      // Settings
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<any>;
      
      // Sync
      syncWithServer: () => Promise<any>;
      getSyncStatus: () => Promise<any>;
      
      // App state
      minimizeToTray: () => void;
      quit: () => void;
      onOnline: (callback: () => void) => void;
      onOffline: (callback: () => void) => void;
      onIdleDetected: (callback: (idleTime: number) => void) => void;
      onTaskAssigned: (callback: (data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);