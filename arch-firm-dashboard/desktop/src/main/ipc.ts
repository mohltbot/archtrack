import { ipcMain, BrowserWindow, powerMonitor } from 'electron';
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import * as WebSocket from 'ws';
import type { 
  CreateTimeEntryInput, 
  UpdateTimeEntryInput,
  TimeEntry,
  AppSettings,
  Employee
} from '@archtrack/shared';
import { 
  initDatabase, 
  createTimeEntry, 
  updateTimeEntry,
  getActiveTimeEntry,
  getTimeEntries,
  getTasks,
  getProjects,
  getUnsyncedTimeEntries,
  markTimeEntriesAsSynced,
  getEmployeeById,
  createEmployee,
  getAllEmployees,
  updateEmployee
} from './db/database';

// Initialize store with defaults
interface StoreSchema {
  employeeId: string;
  employeeName: string;
  serverUrl: string;
  idleThresholdMinutes: number;
  trackIdleTime: boolean;
  startOnBoot: boolean;
  minimizeToTray: boolean;
  lastSyncAt: string;
}

const store = new Store<StoreSchema>({
  defaults: {
    employeeId: '',
    employeeName: '',
    serverUrl: 'http://localhost:3001',
    idleThresholdMinutes: 5,
    trackIdleTime: true,
    startOnBoot: false,
    minimizeToTray: true,
    lastSyncAt: ''
  }
});

let mainWindow: BrowserWindow | null = null;
let idleCheckInterval: NodeJS.Timeout | null = null;
let ws: WebSocket | null = null;
let isIdle = false;
let reconnectInterval: NodeJS.Timeout | null = null;

export function registerIpcHandlers(window: BrowserWindow): void {
  mainWindow = window;
  
  // Initialize database first
  initDatabase();
  
  // Register all IPC handlers before window loads
  registerEmployeeHandlers();
  registerTimeEntryHandlers();
  registerTaskHandlers();
  registerProjectHandlers();
  registerSettingsHandlers();
  registerSyncHandlers();
  registerAppHandlers();
  
  // Connect to WebSocket server
  connectWebSocket();
  
  // Start idle detection
  startIdleDetection();
}

function connectWebSocket(): void {
  const serverUrl = store.get('serverUrl') || 'http://localhost:3001';
  const wsUrl = serverUrl.replace('http', 'ws');
  
  try {
    ws = new WebSocket(`${wsUrl}/ws`);
    
    ws.on('open', () => {
      console.log('WebSocket connected');
      // Register this employee
      const employeeId = store.get('employeeId');
      if (employeeId && ws) {
        ws.send(JSON.stringify({
          type: 'register',
          employeeId,
          employeeName: store.get('employeeName')
        }));
      }
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(message);
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket disconnected, reconnecting...');
      scheduleReconnect();
    });
    
    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
      scheduleReconnect();
    });
  } catch (err) {
    console.error('Failed to connect WebSocket:', err);
    scheduleReconnect();
  }
}

function scheduleReconnect(): void {
  if (reconnectInterval) return;
  reconnectInterval = setInterval(() => {
    console.log('Attempting to reconnect...');
    connectWebSocket();
  }, 5000);
}

function handleWebSocketMessage(message: any): void {
  if (!mainWindow) return;
  
  switch (message.type) {
    case 'sync-request':
      // Server is asking us to sync
      handleSyncRequest();
      break;
    case 'employee-assigned':
      // New task assignment
      mainWindow.webContents.send('ws:task-assigned', message.data);
      break;
  }
}

async function handleSyncRequest(): Promise<void> {
  const unsynced = getUnsyncedTimeEntries();
  if (unsynced.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'time-entries',
      employeeId: store.get('employeeId'),
      entries: unsynced
    }));
    markTimeEntriesAsSynced(unsynced.map(e => e.id));
    store.set('lastSyncAt', new Date().toISOString());
  }
}

function registerEmployeeHandlers(): void {
  // Check if employee is set up
  ipcMain.handle('employee:check-setup', async () => {
    const employeeId = store.get('employeeId');
    if (!employeeId) {
      return { success: true, data: { isSetup: false } };
    }
    
    const employee = getEmployeeById(employeeId);
    if (!employee) {
      return { success: true, data: { isSetup: false } };
    }
    
    return { success: true, data: { isSetup: true, employee } };
  });
  
  // Get current employee
  ipcMain.handle('employee:get', async () => {
    const employeeId = store.get('employeeId');
    if (!employeeId) {
      return { success: false, error: 'No employee configured' };
    }
    
    const employee = getEmployeeById(employeeId);
    if (!employee) {
      return { success: false, error: 'Employee not found' };
    }
    
    return { success: true, data: employee };
  });
  
  // Create new employee profile
  ipcMain.handle('employee:create', async (_, input: { name: string; email: string }) => {
    try {
      const employeeId = uuidv4();
      const employee: Employee = {
        id: employeeId,
        name: input.name,
        email: input.email,
        role: 'employee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      createEmployee(employee);
      
      // Save to store
      store.set('employeeId', employeeId);
      store.set('employeeName', input.name);
      
      // Reconnect WebSocket with new identity
      if (ws) {
        ws.close();
      }
      connectWebSocket();
      
      return { success: true, data: employee };
    } catch (error) {
      console.error('Error creating employee:', error);
      return { success: false, error: String(error) };
    }
  });
  
  // Update employee
  ipcMain.handle('employee:update', async (_, updates: Partial<Employee>) => {
    try {
      const employeeId = store.get('employeeId');
      if (!employeeId) {
        return { success: false, error: 'No employee configured' };
      }
      
      updateEmployee(employeeId, updates);
      
      if (updates.name) {
        store.set('employeeName', updates.name);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: String(error) };
    }
  });
  
  // Get all employees (for switching)
  ipcMain.handle('employee:list', async () => {
    try {
      const employees = getAllEmployees();
      return { success: true, data: employees };
    } catch (error) {
      console.error('Error listing employees:', error);
      return { success: false, error: String(error) };
    }
  });
  
  // Switch to different employee
  ipcMain.handle('employee:switch', async (_, employeeId: string) => {
    try {
      const employee = getEmployeeById(employeeId);
      if (!employee) {
        return { success: false, error: 'Employee not found' };
      }
      
      store.set('employeeId', employeeId);
      store.set('employeeName', employee.name);
      
      // Reconnect WebSocket
      if (ws) {
        ws.close();
      }
      connectWebSocket();
      
      return { success: true, data: employee };
    } catch (error) {
      console.error('Error switching employee:', error);
      return { success: false, error: String(error) };
    }
  });
}

function registerTimeEntryHandlers(): void {
  // Start time entry
  ipcMain.handle('time-entry:start', async (_, input: CreateTimeEntryInput) => {
    try {
      const employeeId = store.get('employeeId');
      if (!employeeId) {
        return { success: false, error: 'No employee configured' };
      }
      
      // Check if there's already an active entry
      const activeEntry = getActiveTimeEntry(employeeId);
      if (activeEntry) {
        // Stop the current entry first
        const now = new Date();
        const startTime = new Date(activeEntry.startTime);
        const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        updateTimeEntry(activeEntry.id, {
          endTime: now.toISOString(),
          duration
        });
        
        // Notify WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'time-entry:stopped',
            employeeId,
            entry: { ...activeEntry, endTime: now.toISOString(), duration }
          }));
        }
      }
      
      const newEntry: Omit<TimeEntry, 'createdAt' | 'updatedAt'> = {
        id: uuidv4(),
        employeeId,
        taskId: input.taskId,
        projectId: input.projectId,
        description: input.description,
        startTime: new Date().toISOString(),
        duration: 0,
        isBillable: input.isBillable ?? true,
        idleTime: 0
      };
      
      const entry = createTimeEntry(newEntry);
      
      // Reset activity tracking
      isIdle = false;
      
      // Notify WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'time-entry:started',
          employeeId,
          entry
        }));
      }
      
      return { success: true, data: entry };
    } catch (error) {
      console.error('Error starting time entry:', error);
      return { success: false, error: String(error) };
    }
  });

  // Stop time entry
  ipcMain.handle('time-entry:stop', async (_, input: UpdateTimeEntryInput) => {
    try {
      const employeeId = store.get('employeeId');
      if (!employeeId) {
        return { success: false, error: 'No employee configured' };
      }
      
      const activeEntry = getActiveTimeEntry(employeeId);
      
      if (!activeEntry) {
        return { success: false, error: 'No active time entry found' };
      }
      
      const entry = updateTimeEntry(activeEntry.id, {
        endTime: input.endTime,
        duration: input.duration,
        idleTime: input.idleTime
      });
      
      isIdle = false;
      
      // Notify WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'time-entry:stopped',
          employeeId,
          entry
        }));
      }
      
      return { success: true, data: entry };
    } catch (error) {
      console.error('Error stopping time entry:', error);
      return { success: false, error: String(error) };
    }
  });

  // Get active time entry
  ipcMain.handle('time-entry:get-active', async () => {
    try {
      const employeeId = store.get('employeeId');
      if (!employeeId) {
        return { success: false, error: 'No employee configured' };
      }
      
      const entry = getActiveTimeEntry(employeeId);
      return { success: true, data: entry };
    } catch (error) {
      console.error('Error getting active time entry:', error);
      return { success: false, error: String(error) };
    }
  });

  // Get time entries
  ipcMain.handle('time-entry:list', async (_, startDate?: string, endDate?: string) => {
    try {
      const employeeId = store.get('employeeId');
      if (!employeeId) {
        return { success: false, error: 'No employee configured' };
      }
      
      const entries = getTimeEntries(employeeId, startDate, endDate);
      return { success: true, data: entries };
    } catch (error) {
      console.error('Error listing time entries:', error);
      return { success: false, error: String(error) };
    }
  });
}

function registerTaskHandlers(): void {
  ipcMain.handle('task:list', async () => {
    try {
      const employeeId = store.get('employeeId');
      if (!employeeId) {
        return { success: false, error: 'No employee configured' };
      }
      
      const tasks = getTasks(employeeId);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('Error listing tasks:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('task:get', async (_, id: string) => {
    try {
      const { getTaskById } = require('./db/database');
      const task = getTaskById(id);
      return { success: true, data: task };
    } catch (error) {
      console.error('Error getting task:', error);
      return { success: false, error: String(error) };
    }
  });
}

function registerProjectHandlers(): void {
  ipcMain.handle('project:list', async () => {
    try {
      const projects = getProjects();
      return { success: true, data: projects };
    } catch (error) {
      console.error('Error listing projects:', error);
      return { success: false, error: String(error) };
    }
  });
}

function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async () => {
    try {
      const settings: AppSettings = {
        employeeId: store.get('employeeId'),
        employeeName: store.get('employeeName'),
        serverUrl: store.get('serverUrl') || 'http://localhost:3001',
        idleThresholdMinutes: store.get('idleThresholdMinutes') || 5,
        trackIdleTime: store.get('trackIdleTime') ?? true,
        startOnBoot: store.get('startOnBoot') || false,
        minimizeToTray: store.get('minimizeToTray') ?? true,
        lastSyncAt: store.get('lastSyncAt')
      };
      return { success: true, data: settings };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('settings:update', async (_, newSettings: Partial<AppSettings>) => {
    try {
      for (const [key, value] of Object.entries(newSettings)) {
        store.set(key, value);
      }
      
      // If server URL changed, reconnect WebSocket
      if (newSettings.serverUrl && ws) {
        ws.close();
        connectWebSocket();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: String(error) };
    }
  });
}

function registerSyncHandlers(): void {
  ipcMain.handle('sync:execute', async () => {
    try {
      const unsynced = getUnsyncedTimeEntries();
      
      if (unsynced.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'time-entries',
          employeeId: store.get('employeeId'),
          entries: unsynced
        }));
        
        markTimeEntriesAsSynced(unsynced.map(e => e.id));
        store.set('lastSyncAt', new Date().toISOString());
      }
      
      return { 
        success: true, 
        data: { 
          syncedEntries: unsynced.length,
          totalEntries: unsynced.length
        } 
      };
    } catch (error) {
      console.error('Error syncing:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('sync:status', async () => {
    try {
      const unsynced = getUnsyncedTimeEntries();
      return { 
        success: true, 
        data: {
          pendingCount: unsynced.length,
          lastSyncAt: store.get('lastSyncAt')
        }
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { success: false, error: String(error) };
    }
  });
}

function registerAppHandlers(): void {
  ipcMain.on('app:minimize-to-tray', () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  ipcMain.on('app:quit', () => {
    if (idleCheckInterval) {
      clearInterval(idleCheckInterval);
    }
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
    }
    if (ws) {
      ws.close();
    }
    require('electron').app.quit();
  });
}

function startIdleDetection(): void {
  const checkInterval = 10000; // Check every 10 seconds
  
  idleCheckInterval = setInterval(() => {
    if (!mainWindow) return;
    
    const idleTime = powerMonitor.getSystemIdleTime();
    const thresholdMs = (store.get('idleThresholdMinutes') || 5) * 60 * 1000;
    
    // Check if system has been idle
    if (idleTime > thresholdMs && !isIdle) {
      isIdle = true;
      mainWindow.webContents.send('idle:detected', idleTime);
    } else if (idleTime < 1000 && isIdle) {
      // User is back
      isIdle = false;
    }
  }, checkInterval);
}