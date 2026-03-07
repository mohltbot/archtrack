import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import type { TimeEntry, Task, Project, Employee } from '@archtrack/shared';

let db: Database.Database | null = null;

export function initDatabase(): Database.Database {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'archtrack.db');
  
  // Ensure directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  createTables();
  seedTestData();
  
  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function createTables(): void {
  if (!db) return;

  // Employees table (local cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      hourly_rate REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Projects table (local cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      client_name TEXT,
      status TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      budget REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tasks table (local cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      estimated_hours REAL,
      assigned_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Time entries table (local + sync)
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      task_id TEXT,
      project_id TEXT,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration INTEGER DEFAULT 0,
      is_billable INTEGER DEFAULT 1,
      idle_time INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_start ON time_entries(start_time);
    CREATE INDEX IF NOT EXISTS idx_time_entries_synced ON time_entries(synced);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
  `);
}

function seedTestData(): void {
  if (!db) return;

  // Check if we already have data
  const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get() as { count: number };
  if (employeeCount.count > 0) return;

  const now = new Date().toISOString();

  // Seed test projects
  const projects: Project[] = [
    {
      id: 'proj-001',
      name: 'Downtown Office Complex',
      description: 'Modern office building with sustainable design',
      clientName: 'ABC Corp',
      status: 'active',
      startDate: now,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-002',
      name: 'Residential Tower',
      description: 'High-rise residential building',
      clientName: 'XYZ Developers',
      status: 'active',
      startDate: now,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-003',
      name: 'Community Center',
      description: 'Multi-purpose community facility',
      clientName: 'City Council',
      status: 'active',
      startDate: now,
      createdAt: now,
      updatedAt: now
    }
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, client_name, status, start_date, budget, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of projects) {
    insertProject.run(p.id, p.name, p.description, p.clientName, p.status, p.startDate, p.budget || 0, p.createdAt, p.updatedAt);
  }

  // Note: We don't seed employees anymore - user creates their own profile
  // Tasks will be assigned after employee creation
}

// Employee operations
export function createEmployee(employee: Employee): void {
  const db = getDatabase();
  
  db.prepare(`
    INSERT INTO employees (id, name, email, role, department, hourly_rate, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    employee.id,
    employee.name,
    employee.email,
    employee.role,
    employee.department || null,
    employee.hourlyRate || null,
    employee.createdAt,
    employee.updatedAt
  );
  
  // Create some default tasks for this employee
  seedTasksForEmployee(employee.id);
}

export function getEmployeeById(id: string): Employee | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
  if (!row) return null;
  return mapEmployee(row);
}

export function getAllEmployees(): Employee[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM employees ORDER BY name').all() as any[];
  return rows.map(mapEmployee);
}

export function updateEmployee(id: string, updates: Partial<Employee>): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const sets: string[] = [];
  const values: any[] = [];
  
  if (updates.name !== undefined) { sets.push('name = ?'); values.push(updates.name); }
  if (updates.email !== undefined) { sets.push('email = ?'); values.push(updates.email); }
  if (updates.department !== undefined) { sets.push('department = ?'); values.push(updates.department); }
  if (updates.hourlyRate !== undefined) { sets.push('hourly_rate = ?'); values.push(updates.hourlyRate); }
  
  sets.push('updated_at = ?'); values.push(now);
  values.push(id);
  
  db.prepare(`UPDATE employees SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    hourlyRate: row.hourly_rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function seedTasksForEmployee(employeeId: string): void {
  if (!db) return;
  
  const now = new Date().toISOString();
  
  const tasks: Task[] = [
    {
      id: `task-${employeeId}-001`,
      projectId: 'proj-001',
      name: 'Initial Design Concepts',
      description: 'Create initial design concepts and mood boards',
      status: 'in_progress',
      priority: 'high',
      estimatedHours: 40,
      assignedTo: employeeId,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `task-${employeeId}-002`,
      projectId: 'proj-001',
      name: 'Site Analysis',
      description: 'Analyze site conditions and constraints',
      status: 'todo',
      priority: 'high',
      estimatedHours: 16,
      assignedTo: employeeId,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `task-${employeeId}-003`,
      projectId: 'proj-002',
      name: 'Floor Plan Development',
      description: 'Develop detailed floor plans',
      status: 'todo',
      priority: 'medium',
      estimatedHours: 60,
      assignedTo: employeeId,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `task-${employeeId}-004`,
      projectId: 'proj-003',
      name: 'Client Meeting Preparation',
      description: 'Prepare presentation materials for client meeting',
      status: 'todo',
      priority: 'low',
      estimatedHours: 8,
      assignedTo: employeeId,
      createdAt: now,
      updatedAt: now
    }
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, project_id, name, description, status, priority, estimated_hours, assigned_to, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of tasks) {
    insertTask.run(t.id, t.projectId, t.name, t.description, t.status, t.priority, t.estimatedHours, t.assignedTo, t.createdAt, t.updatedAt);
  }
}

// Time Entry operations
export function createTimeEntry(entry: Omit<TimeEntry, 'createdAt' | 'updatedAt'>): TimeEntry {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO time_entries (id, employee_id, task_id, project_id, description, start_time, end_time, duration, is_billable, idle_time, synced, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.id,
    entry.employeeId,
    entry.taskId || null,
    entry.projectId || null,
    entry.description || null,
    entry.startTime,
    entry.endTime || null,
    entry.duration,
    entry.isBillable ? 1 : 0,
    entry.idleTime,
    0, // not synced
    now,
    now
  );

  return { ...entry, createdAt: now, updatedAt: now };
}

export function updateTimeEntry(id: string, updates: Partial<TimeEntry>): TimeEntry | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const sets: string[] = [];
  const values: any[] = [];
  
  if (updates.endTime !== undefined) { sets.push('end_time = ?'); values.push(updates.endTime); }
  if (updates.duration !== undefined) { sets.push('duration = ?'); values.push(updates.duration); }
  if (updates.idleTime !== undefined) { sets.push('idle_time = ?'); values.push(updates.idleTime); }
  if (updates.description !== undefined) { sets.push('description = ?'); values.push(updates.description); }
  if (updates.isBillable !== undefined) { sets.push('is_billable = ?'); values.push(updates.isBillable ? 1 : 0); }
  
  sets.push('synced = ?'); values.push(0);
  sets.push('updated_at = ?'); values.push(now);
  values.push(id);
  
  db.prepare(`UPDATE time_entries SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  
  return getTimeEntryById(id);
}

export function getTimeEntryById(id: string): TimeEntry | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(id) as any;
  if (!row) return null;
  return mapTimeEntry(row);
}

export function getActiveTimeEntry(employeeId: string): TimeEntry | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM time_entries WHERE employee_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1').get(employeeId) as any;
  if (!row) return null;
  return mapTimeEntry(row);
}

export function getTimeEntries(employeeId: string, startDate?: string, endDate?: string): TimeEntry[] {
  const db = getDatabase();
  let query = 'SELECT * FROM time_entries WHERE employee_id = ?';
  const params: any[] = [employeeId];
  
  if (startDate) {
    query += ' AND start_time >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND start_time <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY start_time DESC';
  
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapTimeEntry);
}

export function getUnsyncedTimeEntries(): TimeEntry[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM time_entries WHERE synced = 0').all() as any[];
  return rows.map(mapTimeEntry);
}

export function markTimeEntriesAsSynced(ids: string[]): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE time_entries SET synced = 1 WHERE id = ?');
  for (const id of ids) {
    stmt.run(id);
  }
}

function mapTimeEntry(row: any): TimeEntry {
  return {
    id: row.id,
    employeeId: row.employee_id,
    taskId: row.task_id,
    projectId: row.project_id,
    description: row.description,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    isBillable: row.is_billable === 1,
    idleTime: row.idle_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Task operations
export function getTasks(employeeId?: string): Task[] {
  const db = getDatabase();
  let query = 'SELECT * FROM tasks';
  const params: any[] = [];
  
  if (employeeId) {
    query += ' WHERE assigned_to = ?';
    params.push(employeeId);
  }
  
  query += ' ORDER BY updated_at DESC';
  
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapTask);
}

export function getTaskById(id: string): Task | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
  if (!row) return null;
  return mapTask(row);
}

function mapTask(row: any): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    status: row.status,
    priority: row.priority,
    estimatedHours: row.estimated_hours,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Project operations
export function getProjects(): Project[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM projects WHERE status = ? ORDER BY name').all('active') as any[];
  return rows.map(mapProject);
}

export function getProjectById(id: string): Project | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!row) return null;
  return mapProject(row);
}

function mapProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    clientName: row.client_name,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: row.budget,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}