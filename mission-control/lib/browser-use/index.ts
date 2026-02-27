import { BrowserUseAgent } from './client';

// Re-exports
export { BrowserUseAgent } from './client';
export type {
  BrowserUseConfig,
  RunTaskRequest,
  RunTaskResponse,
  TaskStatus,
  StepResult,
} from './types';

/**
 * Create a Browser Use agent instance from environment variables
 */
export function createBrowserUseAgent(): BrowserUseAgent {
  const apiKey = process.env.BROWSER_USE_API_KEY;
  
  if (!apiKey) {
    throw new Error('BROWSER_USE_API_KEY environment variable is required');
  }

  return new BrowserUseAgent({
    apiKey,
    baseUrl: process.env.BROWSER_USE_BASE_URL,
  });
}

/**
 * Quick task execution helper
 */
export async function runBrowserTask(task: string, options?: { maxSteps?: number; url?: string }) {
  const agent = createBrowserUseAgent();
  return agent.runAndWait({
    task,
    maxSteps: options?.maxSteps || 10,
    url: options?.url,
  });
}

/**
 * Extract content from a URL
 */
export async function extractFromUrl(url: string, instructions: string) {
  const agent = createBrowserUseAgent();
  return agent.extract(url, instructions);
}
