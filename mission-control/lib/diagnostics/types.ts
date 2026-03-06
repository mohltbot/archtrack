export type DiagnosticLevel = 'info' | 'completed' | 'warning' | 'error' | 'critical';

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  agentName: string;
  level: DiagnosticLevel;
  type: 'execution' | 'budget' | 'performance' | 'system' | 'blocked';
  message: string;
  details?: Record<string, unknown>;
  duration?: number;
  suggestedAction?: string;
}

export interface DiagnosticsConfig {
  enabled: boolean;
  reportToDiscord: boolean;
  budgetThresholds: {
    warning: number;
    critical: number;
  };
  performanceThresholds: {
    slowExecution: number;
  };
}

export const defaultConfig: DiagnosticsConfig = {
  enabled: true,
  reportToDiscord: true,
  budgetThresholds: {
    warning: 0.7,  // 70% of budget
    critical: 0.9, // 90% of budget
  },
  performanceThresholds: {
    slowExecution: 300000, // 5 minutes
  },
};
