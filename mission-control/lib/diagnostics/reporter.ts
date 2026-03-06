import { DiagnosticReport, DiagnosticLevel } from './types';

// In-memory store for recent diagnostics (last 100)
const recentDiagnostics: DiagnosticReport[] = [];
const MAX_STORED = 100;

/**
 * Report a diagnostic event
 */
export async function reportDiagnostic(report: Omit<DiagnosticReport, 'id' | 'timestamp'>): Promise<void> {
  const fullReport: DiagnosticReport = {
    ...report,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  // Store in memory
  recentDiagnostics.unshift(fullReport);
  if (recentDiagnostics.length > MAX_STORED) {
    recentDiagnostics.pop();
  }

  // Log to console
  const emoji = getEmojiForLevel(fullReport.level);
  console.log(`${emoji} [${fullReport.agentName}] ${fullReport.message}`);

  // Report to Discord if critical or error
  if (fullReport.level === 'error' || fullReport.level === 'critical') {
    await reportToDiscord(fullReport);
  }

  // Could also save to file/DB for persistence
}

/**
 * Get recent diagnostics
 */
export function getRecentDiagnostics(limit = 10): DiagnosticReport[] {
  return recentDiagnostics.slice(0, limit);
}

/**
 * Get diagnostics by agent
 */
export function getDiagnosticsByAgent(agentName: string): DiagnosticReport[] {
  return recentDiagnostics.filter(d => d.agentName === agentName);
}

/**
 * Get latest diagnostic for an agent
 */
export function getLatestDiagnostic(agentName: string): DiagnosticReport | undefined {
  return recentDiagnostics.find(d => d.agentName === agentName);
}

/**
 * Report to Discord webhook
 */
async function reportToDiscord(report: DiagnosticReport): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const color = getColorForLevel(report.level);
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `🤖 Agent ${report.level.toUpperCase()}: ${report.agentName}`,
          description: report.message,
          color: color,
          fields: [
            ...(report.duration ? [{ name: 'Duration', value: `${(report.duration / 1000).toFixed(1)}s`, inline: true }] : []),
            ...(report.suggestedAction ? [{ name: 'Suggested Action', value: report.suggestedAction }] : []),
            ...(report.details ? Object.entries(report.details).map(([key, value]) => ({
              name: key,
              value: String(value),
              inline: true,
            })) : []),
          ],
          timestamp: report.timestamp,
        }],
      }),
    });
  } catch (error) {
    console.error('Failed to report to Discord:', error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getEmojiForLevel(level: DiagnosticLevel): string {
  const emojis: Record<DiagnosticLevel, string> = {
    info: 'ℹ️',
    completed: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
  };
  return emojis[level];
}

function getColorForLevel(level: DiagnosticLevel): number {
  const colors: Record<DiagnosticLevel, number> = {
    info: 0x3498db,
    completed: 0x2ecc71,
    warning: 0xf39c12,
    error: 0xe74c3c,
    critical: 0x992d22,
  };
  return colors[level];
}
