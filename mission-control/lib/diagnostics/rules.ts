import { DiagnosticsConfig, defaultConfig } from './types';

// Simple budget tracking (per session)
let sessionSpend = 0;
const MONTHLY_BUDGET = 200;

/**
 * Check if execution should report diagnostics based on rules
 */
export function checkRules(config: DiagnosticsConfig = defaultConfig): {
  shouldReport: boolean;
  level?: 'warning' | 'error' | 'critical';
  reason?: string;
} {
  // Check budget thresholds
  const budgetPercent = sessionSpend / MONTHLY_BUDGET;
  
  if (budgetPercent >= config.budgetThresholds.critical) {
    return {
      shouldReport: true,
      level: 'critical',
      reason: `Budget at ${(budgetPercent * 100).toFixed(0)}% of $${MONTHLY_BUDGET} limit`,
    };
  }
  
  if (budgetPercent >= config.budgetThresholds.warning) {
    return {
      shouldReport: true,
      level: 'error',
      reason: `Budget at ${(budgetPercent * 100).toFixed(0)}% of $${MONTHLY_BUDGET} limit`,
    };
  }

  return { shouldReport: false };
}

/**
 * Track API spend (called by agent after each API call)
 */
export function trackSpend(amount: number): void {
  sessionSpend += amount;
}

/**
 * Get current spend
 */
export function getCurrentSpend(): number {
  return sessionSpend;
}

/**
 * Reset spend (for testing)
 */
export function resetSpend(): void {
  sessionSpend = 0;
}

/**
 * Check if execution time is too slow
 */
export function checkPerformance(duration: number, threshold: number): boolean {
  return duration > threshold;
}
