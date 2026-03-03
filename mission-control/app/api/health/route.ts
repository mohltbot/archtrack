import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/store';
import { getExpenses, getMonthlySpend } from '@/lib/expense-tracker';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: 'pass' | 'fail';
      responseTime: number;
      message?: string;
    };
    tasks: {
      status: 'pass' | 'fail';
      count: number;
      message?: string;
    };
    budget: {
      status: 'pass' | 'warn' | 'fail';
      monthlySpend: number;
      budgetLimit: number;
      percentage: number;
      message?: string;
    };
  };
  uptime: number;
}

const START_TIME = Date.now();
const BUDGET_LIMIT = 200;

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const checks: HealthStatus['checks'] = {
    database: { status: 'fail', responseTime: 0 },
    tasks: { status: 'fail', count: 0 },
    budget: { status: 'pass', monthlySpend: 0, budgetLimit: BUDGET_LIMIT, percentage: 0 },
  };

  let overallStatus: HealthStatus['status'] = 'healthy';

  // Database check
  const dbStart = Date.now();
  try {
    getTasks();
    checks.database = {
      status: 'pass',
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'fail',
      responseTime: Date.now() - dbStart,
      message: error instanceof Error ? error.message : 'Unknown database error',
    };
    overallStatus = 'unhealthy';
  }

  // Tasks check
  try {
    const tasks = getTasks();
    const openTasks = tasks.filter(t => t.status === 'open');
    checks.tasks = {
      status: 'pass',
      count: openTasks.length,
    };
    
    // Warn if too many open tasks
    if (openTasks.length > 50) {
      checks.tasks.message = `High number of open tasks: ${openTasks.length}`;
      if (overallStatus === 'healthy') overallStatus = 'degraded';
    }
  } catch (error) {
    checks.tasks = {
      status: 'fail',
      count: 0,
      message: error instanceof Error ? error.message : 'Unknown task error',
    };
    overallStatus = 'unhealthy';
  }

  // Budget check
  try {
    const spend = getMonthlySpend();
    const percentage = (spend / BUDGET_LIMIT) * 100;
    
    checks.budget = {
      status: percentage > 90 ? 'fail' : percentage > 75 ? 'warn' : 'pass',
      monthlySpend: spend,
      budgetLimit: BUDGET_LIMIT,
      percentage: Math.round(percentage * 100) / 100,
    };

    if (checks.budget.status === 'fail') {
      overallStatus = 'unhealthy';
      checks.budget.message = `Budget exceeded 90%: $${spend.toFixed(2)} / $${BUDGET_LIMIT}`;
    } else if (checks.budget.status === 'warn' && overallStatus === 'healthy') {
      overallStatus = 'degraded';
      checks.budget.message = `Budget warning: ${percentage.toFixed(1)}% used`;
    }
  } catch (error) {
    checks.budget = {
      status: 'fail',
      monthlySpend: 0,
      budgetLimit: BUDGET_LIMIT,
      percentage: 0,
      message: error instanceof Error ? error.message : 'Unknown budget error',
    };
    if (overallStatus === 'healthy') overallStatus = 'degraded';
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks,
    uptime: Date.now() - START_TIME,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}
