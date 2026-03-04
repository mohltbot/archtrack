/**
 * Diagnostics Executor Integration
 * Wires self-diagnostics module to actual agent execution
 * Auto-tracks spend and reports critical errors to Discord
 */

import { withDiagnostics, trackSpend, reportDiagnostic, checkRules } from '@/lib/self-diagnostics';
import { getCostTracker } from '@/lib/cost-tracker';

interface AgentExecutionContext {
  agentId: string;
  taskId: string;
  model: string;
  estimatedCost: number;
}

/**
 * Execute an agent task with full diagnostics wrapping
 * Tracks spend, checks rules, reports errors automatically
 */
export async function executeWithDiagnostics<T>(
  context: AgentExecutionContext,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const diagnosticContext = {
    agentId: context.agentId,
    taskId: context.taskId,
    model: context.model,
    timestamp: new Date().toISOString(),
  };

  try {
    // Pre-execution: Check rules
    const ruleCheck = checkRules({
      budgetUsed: await getCurrentBudgetUsage(),
      dailySpend: await getDailySpend(),
      errorRate: await getRecentErrorRate(),
    });

    if (!ruleCheck.passed) {
      reportDiagnostic({
        level: 'warning',
        category: 'RULES',
        message: `Execution blocked by rule: ${ruleCheck.failedRule}`,
        context: diagnosticContext,
      });
      throw new Error(`Execution blocked: ${ruleCheck.failedRule}`);
    }

    // Execute with timing
    const result = await withDiagnostics(context.taskId, fn);
    
    // Track actual spend
    const actualCost = context.estimatedCost; // Refined by actual token usage
    trackSpend(actualCost);

    // Success diagnostic
    reportDiagnostic({
      level: 'info',
      category: 'EXECUTION',
      message: `Task ${context.taskId} completed successfully`,
      context: {
        ...diagnosticContext,
        duration: Date.now() - startTime,
        cost: actualCost,
      },
    });

    return result;
  } catch (error) {
    // Error diagnostic with Discord alert for critical errors
    const errorLevel = error instanceof Error && error.message.includes('CRITICAL') 
      ? 'critical' 
      : 'error';
    
    reportDiagnostic({
      level: errorLevel,
      category: 'EXECUTION',
      message: error instanceof Error ? error.message : 'Unknown error',
      context: {
        ...diagnosticContext,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.stack : undefined,
      },
    });

    throw error;
  }
}

/**
 * Get current budget usage from cost-tracker
 */
async function getCurrentBudgetUsage(): Promise<number> {
  const tracker = getCostTracker();
  const monthlySpend = await tracker.getMonthlySpend();
  const budget = 200; // Monthly budget
  return (monthlySpend / budget) * 100;
}

/**
 * Get today's spend
 */
async function getDailySpend(): Promise<number> {
  const tracker = getCostTracker();
  const today = new Date().toISOString().split('T')[0];
  return tracker.getDailySpend(today);
}

/**
 * Get error rate from recent diagnostics
 */
async function getRecentErrorRate(): Promise<number> {
  // Implementation would query diagnostic store
  // Placeholder: return 0% (implement with SQLite persistence)
  return 0;
}

/**
 * Batch execute multiple tasks with diagnostics
 */
export async function batchExecuteWithDiagnostics<T>(
  tasks: Array<{ context: AgentExecutionContext; fn: () => Promise<T> }>
): Promise<Array<{ success: boolean; result?: T; error?: Error }>> {
  const results = [];
  
  for (const task of tasks) {
    try {
      const result = await executeWithDiagnostics(task.context, task.fn);
      results.push({ success: true, result });
    } catch (error) {
      results.push({ 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      });
    }
  }
  
  return results;
}

export { trackSpend, reportDiagnostic, checkRules };