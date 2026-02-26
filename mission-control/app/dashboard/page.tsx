import { getDashboardStats, getTasks, getExpenses, getAgents } from '@/lib/store';
import { TaskBoard } from '@/components/TaskBoardWrapper';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { AgentStatus } from '@/components/AgentStatus';
import { MemoryBrowser } from '@/components/MemoryBrowser';
import { ModelOptimizer } from '@/components/ModelOptimizer';
import { StatsCard } from '@/components/StatsCard';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  const stats = getDashboardStats();
  const tasks = getTasks();
  const expenses = getExpenses();
  const agents = getAgents();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 slide-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Mission Control
            </h1>
            <p className="text-slate-400 text-sm">AI-powered command center</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          iconName="check"
          title="Total Tasks" 
          value={stats.totalTasks} 
          subtitle={`${stats.completedTasks} completed`}
          trend={stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}
          color="from-emerald-400 to-emerald-600"
          delay={0}
        />
        <StatsCard 
          iconName="bot"
          title="Active Agents" 
          value={stats.activeAgents} 
          subtitle="Currently running"
          trend={stats.activeAgents > 0 ? 100 : 0}
          color="from-blue-400 to-blue-600"
          delay={100}
        />
        <StatsCard 
          iconName="wallet"
          title="Monthly Spend" 
          value={`$${stats.monthlySpend.toFixed(2)}`} 
          subtitle="API & infrastructure"
          trend={Math.round((stats.monthlySpend / 200) * 100)}
          color="from-amber-400 to-orange-600"
          delay={200}
        />
        <StatsCard 
          iconName="brain"
          title="Memories" 
          value={stats.memoryCount} 
          subtitle="Stored contexts"
          trend={0}
          color="from-purple-400 to-purple-600"
          delay={300}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.1s' }}>
          <TaskBoard initialTasks={tasks} />
        </div>
        <div className="space-y-6">
          <div className="slide-in" style={{ animationDelay: '0.2s' }}>
            <ExpenseTracker expenses={expenses} />
          </div>
          <div className="slide-in" style={{ animationDelay: '0.3s' }}>
            <AgentStatus agents={agents} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="slide-in" style={{ animationDelay: '0.4s' }}>
          <MemoryBrowser />
        </div>
        <div className="slide-in" style={{ animationDelay: '0.5s' }}>
          <ModelOptimizer />
        </div>
      </div>

      <footer className="mt-12 text-center text-slate-500 text-sm slide-in" style={{ animationDelay: '0.5s' }}>
        <p>Mission Control v0.1 • Built with Next.js & OpenClaw</p>
      </footer>
    </div>
  );
}
