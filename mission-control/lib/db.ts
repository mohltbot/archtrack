import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DbSchema {
  tasks: Task[];
  expenses: Expense[];
  memories: Memory[];
  agents: Agent[];
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  created_at: string;
  completed_at?: string;
  agent_id?: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: 'api_call' | 'infrastructure' | 'tool' | 'other';
  provider?: string;
  model?: string;
  tokens_in?: number;
  tokens_out?: number;
  created_at: string;
}

interface Memory {
  id: number;
  content: string;
  category?: string;
  source?: string;
  importance: 1 | 2 | 3;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  task?: string;
  started_at?: string;
  completed_at?: string;
  result?: string;
}

function ensureDb(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ tasks: [], expenses: [], memories: [], agents: [] }, null, 2));
  }
}

function readDb(): DbSchema {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDb(db: DbSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export type { Task, Expense, Memory, Agent };

export function getTasks(): Task[] {
  return readDb().tasks;
}

export function createTask(task: Omit<Task, 'id' | 'created_at'>): Task {
  const db = readDb();
  const newTask: Task = { ...task, id: Date.now(), created_at: new Date().toISOString() };
  db.tasks.push(newTask);
  writeDb(db);
  return newTask;
}

export function updateTaskStatus(id: number, status: Task['status']): void {
  const db = readDb();
  const task = db.tasks.find(t => t.id === id);
  if (task) {
    task.status = status;
    if (status === 'completed') {
      task.completed_at = new Date().toISOString();
    }
    writeDb(db);
  }
}

export function deleteTask(id: number): void {
  const db = readDb();
  db.tasks = db.tasks.filter(t => t.id !== id);
  writeDb(db);
}

export function getExpenses(): Expense[] {
  return readDb().expenses;
}

export function addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Expense {
  const db = readDb();
  const newExpense: Expense = { ...expense, id: Date.now(), created_at: new Date().toISOString() };
  db.expenses.push(newExpense);
  writeDb(db);
  return newExpense;
}

export function getMonthlySpend(): number {
  const db = readDb();
  const now = new Date();
  return db.expenses
    .filter(e => {
      const date = new Date(e.created_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getAgents(): Agent[] {
  return readDb().agents;
}

export function createAgent(agent: Omit<Agent, 'started_at'>): Agent {
  const db = readDb();
  const newAgent: Agent = { ...agent, started_at: new Date().toISOString() };
  db.agents.push(newAgent);
  writeDb(db);
  return newAgent;
}

export function updateAgentStatus(id: string, status: Agent['status'], result?: string): void {
  const db = readDb();
  const agent = db.agents.find(a => a.id === id);
  if (agent) {
    agent.status = status;
    agent.result = result;
    if (status === 'completed' || status === 'error') {
      agent.completed_at = new Date().toISOString();
    }
    writeDb(db);
  }
}

export function getMemories(): Memory[] {
  return readDb().memories;
}

export function createMemory(memory: Omit<Memory, 'id' | 'created_at'>): Memory {
  const db = readDb();
  const newMemory: Memory = { ...memory, id: Date.now(), created_at: new Date().toISOString() };
  db.memories.push(newMemory);
  writeDb(db);
  return newMemory;
}

export function deleteMemory(id: number): void {
  const db = readDb();
  db.memories = db.memories.filter(m => m.id !== id);
  writeDb(db);
}

export function getDashboardStats() {
  const db = readDb();
  const totalTasks = db.tasks.length;
  const completedTasks = db.tasks.filter(t => t.status === 'completed').length;
  const activeAgents = db.agents.filter(a => a.status === 'running').length;
  const monthlySpend = getMonthlySpend();
  const memoryCount = db.memories.length;
  
  return { totalTasks, completedTasks, activeAgents, monthlySpend, memoryCount };
}
