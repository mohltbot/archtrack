export interface BrowserUseConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface RunTaskRequest {
  task: string;
  maxSteps?: number;
  url?: string;
  variables?: Record<string, string>;
}

export interface RunTaskResponse {
  id: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
  steps?: StepResult[];
  error?: string;
  usage: {
    tokens: number;
    steps: number;
  };
}

export interface StepResult {
  step: number;
  action: string;
  result: string;
  screenshot?: string;
}

export interface TaskStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: {
    currentStep: number;
    totalSteps: number;
  };
  result?: RunTaskResponse;
}
