// Employee types
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  role: Employee['role'];
  department?: string;
  hourlyRate?: number;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  status: 'active' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  clientName?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

// Task types
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  projectId: string;
  name: string;
  description?: string;
  priority?: Task['priority'];
  estimatedHours?: number;
  assignedTo?: string;
}

// Time entry types
export interface TimeEntry {
  id: string;
  employeeId: string;
  taskId?: string;
  projectId?: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  isBillable: boolean;
  idleTime: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeEntryInput {
  taskId?: string;
  projectId?: string;
  description?: string;
  isBillable?: boolean;
}

export interface UpdateTimeEntryInput {
  endTime: string;
  duration: number;
  idleTime: number;
}

// Sync types
export interface SyncPayload {
  timeEntries: TimeEntry[];
  lastSyncAt: string;
}

export interface SyncResult {
  success: boolean;
  syncedEntries: number;
  errors?: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// WebSocket event types
export interface WebSocketEvents {
  'time-entry:started': TimeEntry;
  'time-entry:stopped': TimeEntry;
  'time-entry:updated': TimeEntry;
  'employee:online': { employeeId: string; timestamp: string };
  'employee:offline': { employeeId: string; timestamp: string };
}

// App settings
export interface AppSettings {
  employeeId?: string;
  employeeName?: string;
  serverUrl: string;
  idleThresholdMinutes: number;
  trackIdleTime: boolean;
  startOnBoot: boolean;
  minimizeToTray: boolean;
  lastSyncAt?: string;
}

// Dashboard types
export interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  totalHoursToday: number;
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  recentTimeEntries: TimeEntry[];
  employeeActivity: EmployeeActivity[];
}

export interface EmployeeActivity {
  employeeId: string;
  employeeName: string;
  isOnline: boolean;
  currentTask?: string;
  hoursToday: number;
  hoursThisWeek: number;
}

export interface ReportData {
  employeeId?: string;
  projectId?: string;
  startDate: string;
  endDate: string;
  entries: TimeEntry[];
  totalHours: number;
  billableHours: number;
}
