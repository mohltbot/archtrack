import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import type { Employee, Project, Task, TimeEntry } from '@archtrack/shared';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function initDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (db) return db;

  const dbDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'admin.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await createTables();
  await seedTestData();

  return db;
}

export function getDatabase(): Database<sqlite3.Database, sqlite3.Statement> {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

async function createTables(): Promise<void> {
  if (!db) return;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'employee',
      department TEXT,
      hourly_rate REAL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      client_name TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      start_date TEXT NOT NULL,
      end_date TEXT,
      budget REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      estimated_hours REAL,
      assigned_to TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assigned_to) REFERENCES employees(id)
    );

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
      source TEXT DEFAULT 'desktop',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_start ON time_entries(start_time);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
  `);
}

async function seedTestData(): Promise<void> {
  if (!db) return;

  // Check if already seeded
  const count = await db.get('SELECT COUNT(*) as count FROM employees');
  if (count.count > 0) return;

  const now = new Date().toISOString();

  // Seed employees
  const employees = [
    { id: 'emp-001', name: 'Mohammed', email: 'mohammed@archfirm.com', role: 'employee', department: 'Architecture', hourly_rate: 75 },
    { id: 'emp-002', name: 'Ahmed', email: 'ahmed@archfirm.com', role: 'employee', department: 'Architecture', hourly_rate: 65 },
    { id: 'emp-003', name: 'Sarah', email: 'sarah@archfirm.com', role: 'manager', department: 'Design', hourly_rate: 85 },
  ];

  for (const emp of employees) {
    await db.run(
      `INSERT INTO employees (id, name, email, role, department, hourly_rate, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp.id, emp.name, emp.email, emp.role, emp.department, emp.hourly_rate, now, now]
    );
  }

  // Seed projects
  const projects = [
    { id: 'proj-001', name: 'Downtown Office Complex', description: 'Modern office building with sustainable design', client_name: 'ABC Corp', budget: 500000 },
    { id: 'proj-002', name: 'Residential Tower', description: 'High-rise residential building', client_name: 'XYZ Developers', budget: 750000 },
    { id: 'proj-003', name: 'Community Center', description: 'Multi-purpose community facility', client_name: 'City Council', budget: 300000 },
  ];

  for (const proj of projects) {
    await db.run(
      `INSERT INTO projects (id, name, description, client_name, status, start_date, budget, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
      [proj.id, proj.name, proj.description, proj.client_name, now, proj.budget, now, now]
    );
  }

  // Seed tasks
  const tasks = [
    { id: 'task-001', project_id: 'proj-001', name: 'Initial Design Concepts', description: 'Create initial design concepts', priority: 'high', estimated_hours: 40, assigned_to: 'emp-001' },
    { id: 'task-002', project_id: 'proj-001', name: 'Site Analysis', description: 'Analyze site conditions', priority: 'high', estimated_hours: 16, assigned_to: 'emp-002' },
    { id: 'task-003', project_id: 'proj-002', name: 'Floor Plan Development', description: 'Develop detailed floor plans', priority: 'medium', estimated_hours: 60, assigned_to: 'emp-001' },
    { id: 'task-004', project_id: 'proj-003', name: 'Client Meeting Prep', description: 'Prepare presentation materials', priority: 'low', estimated_hours: 8, assigned_to: 'emp-003' },
  ];

  for (const task of tasks) {
    await db.run(
      `INSERT INTO tasks (id, project_id, name, description, status, priority, estimated_hours, assigned_to, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?)`,
      [task.id, task.project_id, task.name, task.description, task.priority, task.estimated_hours, task.assigned_to, now, now]
    );
  }

  console.log('✅ Test data seeded');
}

// Employee operations
export async function getAllEmployees(): Promise<Employee[]> {
  const db = getDatabase();
  const rows = await db.all('SELECT * FROM employees ORDER BY name');
  return rows.map(mapEmployee);
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const db = getDatabase();
  const row = await db.get('SELECT * FROM employees WHERE id = ?', id);
  return row ? mapEmployee(row) : null;
}

export async function createEmployee(employee: Employee): Promise<void> {
  const db = getDatabase();
  await db.run(
    `INSERT INTO employees (id, name, email, role, department, hourly_rate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [employee.id, employee.name, employee.email, employee.role, employee.department, employee.hourlyRate, employee.createdAt, employee.updatedAt]
  );
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const sets: string[] = [];
  const values: any[] = [];
  
  if (updates.name) { sets.push('name = ?'); values.push(updates.name); }
  if (updates.email) { sets.push('email = ?'); values.push(updates.email); }
  if (updates.role) { sets.push('role = ?'); values.push(updates.role); }
  if (updates.department) { sets.push('department = ?'); values.push(updates.department); }
  if (updates.hourlyRate !== undefined) { sets.push('hourly_rate = ?'); values.push(updates.hourlyRate); }
  
  sets.push('updated_at = ?'); values.push(now);
  values.push(id);
  
  await db.run(`UPDATE employees SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function deleteEmployee(id: string): Promise<void> {
  const db = getDatabase();
  await db.run('UPDATE employees SET is_active = 0 WHERE id = ?', id);
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

// Project operations
export async function getAllProjects(): Promise<Project[]> {
  const db = getDatabase();
  const rows = await db.all('SELECT * FROM projects ORDER BY name');
  return rows.map(mapProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = getDatabase();
  const row = await db.get('SELECT * FROM projects WHERE id = ?', id);
  return row ? mapProject(row) : null;
}

export async function createProject(project: Project): Promise<void> {
  const db = getDatabase();
  await db.run(
    `INSERT INTO projects (id, name, description, client_name, status, start_date, end_date, budget, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [project.id, project.name, project.description, project.clientName, project.status, project.startDate, project.endDate, project.budget, project.createdAt, project.updatedAt]
  );
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const sets: string[] = [];
  const values: any[] = [];
  
  if (updates.name) { sets.push('name = ?'); values.push(updates.name); }
  if (updates.description) { sets.push('description = ?'); values.push(updates.description); }
  if (updates.clientName) { sets.push('client_name = ?'); values.push(updates.clientName); }
  if (updates.status) { sets.push('status = ?'); values.push(updates.status); }
  if (updates.budget !== undefined) { sets.push('budget = ?'); values.push(updates.budget); }
  
  sets.push('updated_at = ?'); values.push(now);
  values.push(id);
  
  await db.run(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`, values);
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

// Task operations
export async function getAllTasks(): Promise<Task[]> {
  const db = getDatabase();
  const rows = await db.all('SELECT * FROM tasks ORDER BY updated_at DESC');
  return rows.map(mapTask);
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const db = getDatabase();
  const rows = await db.all('SELECT * FROM tasks WHERE project_id = ?', projectId);
  return rows.map(mapTask);
}

export async function createTask(task: Task): Promise<void> {
  const db = getDatabase();
  await db.run(
    `INSERT INTO tasks (id, project_id, name, description, status, priority, estimated_hours, assigned_to, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [task.id, task.projectId, task.name, task.description, task.status, task.priority, task.estimatedHours, task.assignedTo, task.createdAt, task.updatedAt]
  );
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const sets: string[] = [];
  const values: any[] = [];
  
  if (updates.name) { sets.push('name = ?'); values.push(updates.name); }
  if (updates.description) { sets.push('description = ?'); values.push(updates.description); }
  if (updates.status) { sets.push('status = ?'); values.push(updates.status); }
  if (updates.priority) { sets.push('priority = ?'); values.push(updates.priority); }
  if (updates.assignedTo) { sets.push('assigned_to = ?'); values.push(updates.assignedTo); }
  
  sets.push('updated_at = ?'); values.push(now);
  values.push(id);
  
  await db.run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, values);
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

// Time entry operations
export async function getAllTimeEntries(startDate?: string, endDate?: string): Promise<TimeEntry[]> {
  const db = getDatabase();
  let query = 'SELECT * FROM time_entries';
  const params: any[] = [];
  
  if (startDate || endDate) {
    query += ' WHERE';
    if (startDate) {
      query += ' start_time >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += startDate ? ' AND start_time <= ?' : ' start_time <= ?';
      params.push(endDate);
    }
  }
  
  query += ' ORDER BY start_time DESC';
  
  const rows = await db.all(query, params);
  return rows.map(mapTimeEntry);
}

export async function getTimeEntriesByEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<TimeEntry[]> {
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
  
  const rows = await db.all(query, params);
  return rows.map(mapTimeEntry);
}

export async function createTimeEntry(entry: TimeEntry): Promise<void> {
  const db = getDatabase();
  await db.run(
    `INSERT INTO time_entries (id, employee_id, task_id, project_id, description, start_time, end_time, duration, is_billable, idle_time, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [entry.id, entry.employeeId, entry.taskId, entry.projectId, entry.description, entry.startTime, entry.endTime, entry.duration, entry.isBillable ? 1 : 0, entry.idleTime, entry.createdAt, entry.updatedAt]
  );
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const sets: string[] = [];
  const values: any[] = [];
  
  if (updates.endTime) { sets.push('end_time = ?'); values.push(updates.endTime); }
  if (updates.duration !== undefined) { sets.push('duration = ?'); values.push(updates.duration); }
  if (updates.idleTime !== undefined) { sets.push('idle_time = ?'); values.push(updates.idleTime); }
  
  sets.push('updated_at = ?'); values.push(now);
  values.push(id);
  
  await db.run(`UPDATE time_entries SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function getActiveTimeEntries(): Promise<TimeEntry[]> {
  const db = getDatabase();
  const rows = await db.all('SELECT * FROM time_entries WHERE end_time IS NULL');
  return rows.map(mapTimeEntry);
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

// Dashboard stats
export async function getDashboardStats(): Promise<any> {
  const db = getDatabase();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoStr = monthAgo.toISOString();

  const [totalEmployees, activeProjects, todayHours, weekHours, monthHours, recentEntries] = await Promise.all([
    db.get('SELECT COUNT(*) as count FROM employees WHERE is_active = 1'),
    db.get('SELECT COUNT(*) as count FROM projects WHERE status = "active"'),
    db.get('SELECT COALESCE(SUM(duration), 0) as total FROM time_entries WHERE start_time >= ?', todayStr),
    db.get('SELECT COALESCE(SUM(duration), 0) as total FROM time_entries WHERE start_time >= ?', weekAgoStr),
    db.get('SELECT COALESCE(SUM(duration), 0) as total FROM time_entries WHERE start_time >= ?', monthAgoStr),
    db.all('SELECT * FROM time_entries ORDER BY start_time DESC LIMIT 10')
  ]);

  return {
    totalEmployees: totalEmployees.count,
    activeProjects: activeProjects.count,
    totalHoursToday: Math.round(todayHours.total / 3600 * 10) / 10,
    totalHoursThisWeek: Math.round(weekHours.total / 3600 * 10) / 10,
    totalHoursThisMonth: Math.round(monthHours.total / 3600 * 10) / 10,
    recentTimeEntries: recentEntries.map(mapTimeEntry)
  };
}