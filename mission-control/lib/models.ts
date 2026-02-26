export interface Task {
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

export interface Expense {
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

export interface Memory {
  id: number;
  content: string;
  category?: string;
  source?: string;
  importance: 1 | 2 | 3;
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  task?: string;
  started_at?: string;
  completed_at?: string;
  result?: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  activeAgents: number;
  monthlySpend: number;
  memoryCount: number;
}
