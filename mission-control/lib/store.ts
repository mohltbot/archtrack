import { getDb } from '@/lib/db';
import { Task, Expense, Agent, DashboardStats } from '@/lib/models';

export function getTasks(): Task[] {
  const db = getDb();
  return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as Task[];
}

export function createTask(task: Omit<Task, 'id' | 'created_at'>): Task {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO tasks (title, description, status, priority, category, agent_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(task.title, task.description, task.status, task.priority, task.category, task.agent_id);
  
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;
}

export function updateTaskStatus(id: number, status: Task['status']): void {
  const db = getDb();
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  db.prepare('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?').run(status, completedAt, id);
}

export function getExpenses(): Expense[] {
  const db = getDb();
  return db.prepare('SELECT * FROM expenses ORDER BY created_at DESC').all() as Expense[];
}

export function addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Expense {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO expenses (description, amount, category, provider, model, tokens_in, tokens_out) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(expense.description, expense.amount, expense.category, expense.provider, expense.model, expense.tokens_in, expense.tokens_out);
  
  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as Expense;
}

export function getMonthlySpend(): number {
  const db = getDb();
  const result = db.prepare(
    "SELECT SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
  ).get() as { total: number };
  return result.total || 0;
}

export function getAgents(): Agent[] {
  const db = getDb();
  return db.prepare('SELECT * FROM agents ORDER BY started_at DESC').all() as Agent[];
}

export function createAgent(agent: Omit<Agent, 'started_at'>): Agent {
  const db = getDb();
  const startedAt = new Date().toISOString();
  db.prepare(
    'INSERT INTO agents (id, name, status, task, started_at) VALUES (?, ?, ?, ?, ?)'
  ).run(agent.id, agent.name, agent.status, agent.task, startedAt);
  
  return db.prepare('SELECT * FROM agents WHERE id = ?').get(agent.id) as Agent;
}

export function updateAgentStatus(id: string, status: Agent['status'], result?: string): void {
  const db = getDb();
  const completedAt = status === 'completed' || status === 'error' ? new Date().toISOString() : null;
  db.prepare('UPDATE agents SET status = ?, result = ?, completed_at = ? WHERE id = ?').run(status, result, completedAt, id);
}

export function getDashboardStats(): DashboardStats {
  const db = getDb();
  
  const totalTasks = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count;
  const completedTasks = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get() as { count: number }).count;
  const activeAgents = (db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'running'").get() as { count: number }).count;
  const monthlySpend = getMonthlySpend();
  const memoryCount = (db.prepare('SELECT COUNT(*) as count FROM memories').get() as { count: number }).count;
  
  return { totalTasks, completedTasks, activeAgents, monthlySpend, memoryCount };
}
