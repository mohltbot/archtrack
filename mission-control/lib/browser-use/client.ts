import { BrowserUseConfig, RunTaskRequest, RunTaskResponse, TaskStatus } from './types';

export class BrowserUseAgent {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: BrowserUseConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.browser-use.com';
  }

  /**
   * Run a browser automation task
   */
  async run(request: RunTaskRequest): Promise<RunTaskResponse> {
    const response = await fetch(`${this.baseUrl}/v1/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: request.task,
        max_steps: request.maxSteps || 10,
        url: request.url,
        variables: request.variables,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Browser Use API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.mapResponse(data);
  }

  /**
   * Run task and wait for completion (polling)
   */
  async runAndWait(
    request: RunTaskRequest,
    options: { pollInterval?: number; maxWait?: number } = {}
  ): Promise<RunTaskResponse> {
    const { pollInterval = 2000, maxWait = 120000 } = options;
    
    // Start the task
    const task = await this.run(request);
    
    if (task.status !== 'running') {
      return task;
    }

    // Poll for completion
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      await this.sleep(pollInterval);
      
      const status = await this.getStatus(task.id);
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status.result || task;
      }
    }

    throw new Error(`Task ${task.id} did not complete within ${maxWait}ms`);
  }

  /**
   * Get task status
   */
  async getStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${this.baseUrl}/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Extract content from a webpage
   */
  async extract(url: string, instructions: string): Promise<string> {
    const result = await this.runAndWait({
      task: `Go to ${url} and ${instructions}`,
      maxSteps: 15,
    });

    if (result.error) {
      throw new Error(`Extraction failed: ${result.error}`);
    }

    return result.output || '';
  }

  /**
   * Scrape newsletter content (Ben's Bites use case)
   */
  async scrapeNewsletter(newsletterUrl: string): Promise<{
    title: string;
    content: string;
    tools: string[];
  }> {
    const result = await this.runAndWait({
      task: `Go to ${newsletterUrl} and extract the newsletter content. 
Find: 1) The main title/headline, 2) All mentioned AI tools/products with their URLs, 3) A summary of key updates.
Return as JSON with fields: title, content, tools (array of strings).`,
      maxSteps: 20,
    });

    if (result.error) {
      throw new Error(`Failed to scrape newsletter: ${result.error}`);
    }

    // Try to parse JSON output
    try {
      const parsed = JSON.parse(result.output || '{}');
      return {
        title: parsed.title || 'Unknown',
        content: parsed.content || result.output || '',
        tools: parsed.tools || [],
      };
    } catch {
      // Return raw output if not valid JSON
      return {
        title: 'Scraped Content',
        content: result.output || '',
        tools: [],
      };
    }
  }

  private mapResponse(data: any): RunTaskResponse {
    return {
      id: data.id,
      status: data.status,
      output: data.output,
      steps: data.steps,
      error: data.error,
      usage: {
        tokens: data.usage?.tokens || 0,
        steps: data.usage?.steps || 0,
      },
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
