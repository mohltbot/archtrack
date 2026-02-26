import { getDashboardStats, getTasks, getExpenses, getAgents } from '@/lib/store';
import { TaskBoard } from '@/components/TaskBoard';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { AgentStatus } from '@/components/AgentStatus';
import { StatsCard } from '@/components/StatsCard';

export default function Dashboard() {
  const stats = getDashboardStats();
  const tasks = getTasks();
  const expenses = getExpenses();
  const agents = getAgents();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Mission Control
        </h1>
        <p className="text-gray-400 mt-1">AI-powered command center</p>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Tasks" 
          value={stats.totalTasks} 
          subtitle={`${stats.completedTasks} completed`}
          color="blue"
        />
        <StatsCard 
          title="Active Agents" 
          value={stats.activeAgents} 
          subtitle="Currently running"
          color="green"
        />
        <StatsCard 
          title="Monthly Spend" 
          value={`$${stats.monthlySpend.toFixed(2)}`} 
          subtitle="API & infrastructure"
          color="yellow"
        />
        <StatsCard 
          title="Memories" 
          value={stats.memoryCount} 
          subtitle="Stored contexts"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TaskBoard tasks={tasks} />
        <div className="space-y-6">
          <ExpenseTracker expenses={expenses} />
          <AgentStatus agents={agents} />
        </div>
      </div>
    </div>
  );
}
