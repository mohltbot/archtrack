import { contextBridge, ipcRenderer } from 'electron';
import type { 
  TimeEntry, 
  CreateTimeEntryInput, 
  UpdateTimeEntryInput,
  Task,
  Project,
  AppSettings,
  Employee
} from '@archtrack/shared';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Employee
  checkSetup: () => ipcRenderer.invoke('employee:check-setup'),
  getEmployee: () => ipcRenderer.invoke('employee:get'),
  createEmployee: (input: { name: string; email: string }) => 
    ipcRenderer.invoke('employee:create', input),
  updateEmployee: (updates: Partial<Employee>) => 
    ipcRenderer.invoke('employee:update', updates),
  getEmployees: () => ipcRenderer.invoke('employee:list'),
  switchEmployee: (employeeId: string) => 
    ipcRenderer.invoke('employee:switch', employeeId),
  
  // Time tracking
  startTimeEntry: (input: CreateTimeEntryInput) => 
    ipcRenderer.invoke('time-entry:start', input),
  stopTimeEntry: (input: UpdateTimeEntryInput) => 
    ipcRenderer.invoke('time-entry:stop', input),
  getActiveTimeEntry: () => 
    ipcRenderer.invoke('time-entry:get-active'),
  getTimeEntries: (startDate?: string, endDate?: string) => 
    ipcRenderer.invoke('time-entry:list', startDate, endDate),
  
  // Tasks
  getTasks: () => ipcRenderer.invoke('task:list'),
  getTask: (id: string) => ipcRenderer.invoke('task:get', id),
  
  // Projects
  getProjects: () => ipcRenderer.invoke('project:list'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<AppSettings>) => 
    ipcRenderer.invoke('settings:update', settings),
  
  // Sync
  syncWithServer: () => ipcRenderer.invoke('sync:execute'),
  getSyncStatus: () => ipcRenderer.invoke('sync:status'),
  
  // App state
  minimizeToTray: () => ipcRenderer.send('app:minimize-to-tray'),
  quit: () => ipcRenderer.send('app:quit'),
  onOnline: (callback: () => void) => 
    ipcRenderer.on('app:online', callback),
  onOffline: (callback: () => void) => 
    ipcRenderer.on('app:offline', callback),
  onIdleDetected: (callback: (idleTime: number) => void) => 
    ipcRenderer.on('idle:detected', (_, idleTime) => callback(idleTime)),
  onTaskAssigned: (callback: (data: any) => void) =>
    ipcRenderer.on('ws:task-assigned', (_, data) => callback(data)),
  removeAllListeners: (channel: string) => 
    ipcRenderer.removeAllListeners(channel),
});

export type ElectronAPI = typeof window.electronAPI;