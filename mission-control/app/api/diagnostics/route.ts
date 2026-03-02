import { NextResponse } from 'next/server';
import { getDashboardStats, getExpenses, getTasks, getAgents } from '@/lib/store';

interface DiagnosticCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

interface DiagnosticsReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
  checks: DiagnosticCheck[];
  recommendations: string[];
}

// Budget thresholds
const BUDGET_LIMIT = 200;
const BUDGET_WARNING_THRESHOLD = 0.75; // 75%
const BUDGET_CRITICAL_THRESHOLD = 0.90; // 90%

// Task thresholds
const MAX_OPEN_TASKS = 50;
const MAX_TASK_AGE_DAYS = 7;

export async function GET(): Promise<NextResponse<DiagnosticsReport>> {
  const checks: DiagnosticCheck[] = [];
  const recommendations: string[] = [];
  
  // Get current data
  const stats = getDashboardStats();
  const expenses = getExpenses();
  const tasks = getTasks();
  const agents = getAgents();
  
  // Check 1: Budget status
  const budgetPercent = stats.monthlySpend / BUDGET_LIMIT;
  const budgetCheck: DiagnosticCheck = {
    name: 'Budget Status',
    status: budgetPercent > BUDGET_CRITICAL_THRESHOLD ? 'fail' : budgetPercent > BUDGET_WARNING_THRESHOLD ? 'warn' : 'pass',
    message: `Monthly spend: $${stats.monthlySpend.toFixed(2)} / $${BUDGET_LIMIT} (${(budgetPercent * 100).toFixed(1)}%)`,
    details: {
      spent: stats.monthlySpend,
      limit: BUDGET_LIMIT,
      remaining: BUDGET_LIMIT - stats.monthlySpend,
      percentage: budgetPercent * 100,
    },
    timestamp: new Date().toISOString(),
  };
  checks.push(budgetCheck);
  
  if (budgetCheck.status === 'fail') {
    recommendations.push('🚨 Budget critical: Pause non-essential API calls immediately');
  } else if (budgetCheck.status === 'warn') {
    recommendations.push('⚠️ Budget warning: Consider switching to cheaper models (DeepSeek/Gemini)');
  }
  
  // Check 2: Task backlog
  const openTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const oldTasks = openTasks.filter(t => {
    const age = Date.now() - new Date(t.created_at).getTime();
    return age > MAX_TASK_AGE_DAYS * 24 * 60 * 60 * 1000;
  });
  
  const taskCheck: DiagnosticCheck = {
    name: 'Task Backlog',
    status: openTasks.length > MAX_OPEN_TASKS ? 'warn' : oldTasks.length > 5 ? 'warn' : 'pass',
    message: `${openTasks.length} open tasks (${oldTasks.length} older than ${MAX_TASK_AGE_DAYS} days)`,
    details: {
      totalTasks: tasks.length,
      openTasks: openTasks.length,
      completedTasks: stats.completedTasks,
      oldTasks: oldTasks.length,
    },
    timestamp: new Date().toISOString(),
  };
  checks.push(taskCheck);
  
  if (oldTasks.length > 5) {
    recommendations.push(`📋 ${oldTasks.length} tasks are stale (>7 days) - consider archiving or prioritizing`);
  }
  
  // Check 3: Agent status
  const activeAgents = agents.filter(a => a.status === 'running');
  const errorAgents = agents.filter(a => a.status === 'error');
  
  const agentCheck: DiagnosticCheck = {
    name: 'Agent Health',
    status: errorAgents.length > 0 ? 'fail' : activeAgents.length > 5 ? 'warn' : 'pass',
    message: `${activeAgents.length} running, ${errorAgents.length} errors`,
    details: {
      total: agents.length,
      active: activeAgents.length,
      idle: agents.filter(a => a.status === 'idle').length,
      completed: agents.filter(a => a.status === 'completed').length,
      errors: errorAgents.length,
    },
    timestamp: new Date().toISOString(),
  };
  checks.push(agentCheck);
  
  if (errorAgents.length > 0) {
    recommendations.push(`🔧 ${errorAgents.length} agent(s) in error state - check logs and restart`);
  }
  
  // Check 4: Expense tracking health
  const recentExpenses = expenses.filter(e => {
    const age = Date.now() - new Date(e.created_at).getTime();
    return age < 24 * 60 * 60 * 1000; // Last 24 hours
  });
  
  const untrackedCalls = recentExpenses.filter(e => !e.provider || !e.model).length;
  
  const trackingCheck: DiagnosticCheck = {
    name: 'Expense Tracking',
    status: untrackedCalls > 5 ? 'warn' : 'pass',
    message: `${recentExpenses.length} expenses logged in last 24h`,
    details: {
      totalExpenses: expenses.length,
      recentExpenses: recentExpenses.length,
      untrackedCalls,
    },
    timestamp: new Date().toISOString(),
  };
  checks.push(trackingCheck);
  
  if (untrackedCalls > 5) {
    recommendations.push('📝 Some API calls missing provider/model metadata - check expense logging');
  }
  
  // Check 5: Data integrity
  const orphanedAgents = agents.filter(a => {
    if (!a.task) return false;
    return !tasks.find(t => t.title === a.task);
  });
  
  const integrityCheck: DiagnosticCheck = {
    name: 'Data Integrity',
    status: orphanedAgents.length > 0 ? 'warn' : 'pass',
    message: orphanedAgents.length > 0 ? `${orphanedAgents.length} orphaned agent references` : 'All references valid',
    details: {
      orphanedAgents: orphanedAgents.length,
    },
    timestamp: new Date().toISOString(),
  };
  checks.push(integrityCheck);
  
  // Determine overall status
  const failed = checks.filter(c => c.status === 'fail').length;
  const warnings = checks.filter(c => c.status === 'warn').length;
  const passed = checks.filter(c => c.status === 'pass').length;
  
  let overallStatus: DiagnosticsReport['status'] = 'healthy';
  if (failed > 0) overallStatus = 'unhealthy';
  else if (warnings > 0) overallStatus = 'degraded';
  
  // Add default recommendation if all good
  if (recommendations.length === 0) {
    recommendations.push('✅ All systems operational - no action needed');
  }
  
  const report: DiagnosticsReport = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    summary: {
      total: checks.length,
      passed,
      warnings,
      failed,
    },
    checks,
    recommendations,
  };
  
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  
  return NextResponse.json(report, { status: statusCode });
}

// POST endpoint to trigger specific diagnostic actions
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'cleanup-old-tasks': {
        const tasks = getTasks();
        const oldTasks = tasks.filter(t => {
          if (t.status !== 'completed') return false;
          const age = Date.now() - new Date(t.created_at).getTime();
          return age > 30 * 24 * 60 * 60 * 1000; // 30 days
        });
        
        return NextResponse.json({
          action: 'cleanup-old-tasks',
          found: oldTasks.length,
          message: `Found ${oldTasks.length} completed tasks older than 30 days`,
          recommendation: 'Use archive endpoint to move these to cold storage',
        });
      }
      
      case 'verify-expense-integrity': {
        const expenses = getExpenses();
        const issues = expenses.filter(e => !e.amount || e.amount < 0);
        
        return NextResponse.json({
          action: 'verify-expense-integrity',
          total: expenses.length,
          issues: issues.length,
          message: issues.length > 0 ? `Found ${issues.length} expenses with invalid amounts` : 'All expenses valid',
        });
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, availableActions: ['cleanup-old-tasks', 'verify-expense-integrity'] },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute diagnostic action', details: String(error) },
      { status: 500 }
    );
  }
}
