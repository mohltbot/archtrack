import { reportDiagnostic, DiagnosticReport } from './reporter';
import { checkRules, checkPerformance, trackSpend } from './rules';
import { DiagnosticsConfig, defaultConfig } from './types';

export interface DiagnosticContext {
  budgetLimit?: number;
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Wrap a function with self-diagnostics
 * Reports success, failures, and anomalies automatically
 */
export async function withDiagnostics<T>(
  agentName: string,
  fn: () => Promise<T>,
  context: DiagnosticContext = {},
  config: DiagnosticsConfig = defaultConfig
): Promise<T> {
  if (!config.enabled) {
    return fn();
  }

  const startTime = Date.now();
  
  try {
    // Check pre-execution rules
    const preCheck = checkRules(config);
    if (preCheck.shouldReport) {
      await reportDiagnostic({
        agentName,
        level: preCheck.level || 'warning',
        type: 'budget',
        message: preCheck.reason || 'Budget threshold check',
        details: context.metadata,
      });
    }

    // Execute the work
    const result = await fn();
    
    const duration = Date.now() - startTime;

    // Check performance
    if (checkPerformance(duration, config.performanceThresholds.slowExecution)) {
      await reportDiagnostic({
        agentName,
        level: 'warning',
        type: 'performance',
        message: `Slow execution detected: ${(duration / 1000).toFixed(1)}s`,
        duration,
        details: context.metadata,
        suggestedAction: 'Consider optimizing the task or breaking it into smaller chunks',
      });
    }

    // Report success
    await reportDiagnostic({
      agentName,
      level: 'completed',
      type: 'execution',
      message: 'Task completed successfully',
      duration,
      details: context.metadata,
    });

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Report failure
    await reportDiagnostic({
      agentName,
      level: 'error',
      type: 'execution',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      duration,
      details: {
        ...context.metadata,
        error: error instanceof Error ? error.stack : String(error),
      },
      suggestedAction: 'Check logs for details and retry if transient',
    });

    throw error;
  }
}

/**
 * Report a manual diagnostic (for agents to self-report issues)
 */
export async function selfReport(
  agentName: string,
  level: DiagnosticReport['level'],
  message: string,
  details?: Record<string, unknown>,
  suggestedAction?: string
): Promise<void> {
  await reportDiagnostic({
    agentName,
    level,
    type: 'system',
    message,
    details,
    suggestedAction,
  });
}

// Re-exports for convenience
export { reportDiagnostic, getRecentDiagnostics, getDiagnosticsByAgent, getLatestDiagnostic } from './reporter';
export { trackSpend, getCurrentSpend } from './rules';
export type { DiagnosticReport, DiagnosticLevel, DiagnosticsConfig } from './types';
