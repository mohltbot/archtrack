/**
 * Ollama Local LLM Integration
 * 
 * Provides FREE local inference for simple tasks
 * Falls back to cloud APIs for complex tasks
 */

export interface OllamaConfig {
  enabled: boolean;
  host: string;
  port: number;
  defaultModel: string;
  fallbackThreshold: number; // Tokens threshold for cloud fallback
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

// Default configuration
export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  enabled: process.env.OLLAMA_ENABLED === 'true' || true,
  host: process.env.OLLAMA_HOST || 'localhost',
  port: parseInt(process.env.OLLAMA_PORT || '11434'),
  defaultModel: process.env.OLLAMA_MODEL || 'smollm2:360m',
  fallbackThreshold: parseInt(process.env.OLLAMA_FALLBACK_THRESHOLD || '150'), // ~100-150 tokens
};

// Available local models with their capabilities
export const LOCAL_MODELS: Record<string, {
  size: string;
  ramGB: number;
  speed: string;
  quality: 'basic' | 'good' | 'excellent';
  bestFor: string[];
}> = {
  'smollm2:360m': {
    size: '360M',
    ramGB: 1,
    speed: '~50 tok/s',
    quality: 'basic',
    bestFor: ['summarization', 'extraction', 'classification', 'simple_qa'],
  },
  'phi3:mini': {
    size: '3.8B',
    ramGB: 4,
    speed: '~25 tok/s',
    quality: 'good',
    bestFor: ['coding', 'analysis', 'writing', 'chat'],
  },
  'gemma:2b': {
    size: '2B',
    ramGB: 3,
    speed: '~30 tok/s',
    quality: 'good',
    bestFor: ['writing', 'summarization', 'chat'],
  },
};

/**
 * Check if Ollama is available
 */
export async function checkOllamaHealth(config: OllamaConfig = DEFAULT_OLLAMA_CONFIG): Promise<{
  available: boolean;
  models: string[];
  error?: string;
}> {
  try {
    const response = await fetch(`http://${config.host}:${config.port}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return {
        available: false,
        models: [],
        error: `Ollama returned ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      available: true,
      models: data.models?.map((m: any) => m.name) || [],
    };
  } catch (error) {
    return {
      available: false,
      models: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate text using Ollama
 */
export async function generateLocal(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    config?: OllamaConfig;
  } = {}
): Promise<{
  text: string;
  model: string;
  tokens: number;
  duration: number;
  cost: number; // Always 0 for local
  fallbackRequired?: boolean;
}> {
  const config = options.config || DEFAULT_OLLAMA_CONFIG;
  const model = options.model || config.defaultModel;

  // Check token count estimate
  const estimatedTokens = Math.ceil(prompt.length / 4);
  if (estimatedTokens > config.fallbackThreshold) {
    return {
      text: '',
      model,
      tokens: 0,
      duration: 0,
      cost: 0,
      fallbackRequired: true,
    };
  }

  try {
    const startTime = Date.now();
    
    const response = await fetch(`http://${config.host}:${config.port}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          num_predict: options.maxTokens || 150,
          temperature: options.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    const duration = Date.now() - startTime;

    return {
      text: data.response,
      model: data.model,
      tokens: data.eval_count || 0,
      duration,
      cost: 0, // FREE!
    };
  } catch (error) {
    console.error('Ollama error:', error);
    return {
      text: '',
      model,
      tokens: 0,
      duration: 0,
      cost: 0,
      fallbackRequired: true,
    };
  }
}

/**
 * Determine if a task should use local inference
 */
export function shouldUseLocalInference(
  task: string,
  promptLength: number,
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): {
  useLocal: boolean;
  reason: string;
  recommendedModel: string;
} {
  // Simple heuristics for task routing
  const promptLower = task.toLowerCase();
  
  // Complex tasks that need cloud
  const complexIndicators = [
    'complex', 'detailed', 'research', 'analysis', 'code review',
    'architecture', 'design', 'planning', 'strategy', 'creative writing',
    'long', 'comprehensive', 'in-depth', 'sophisticated'
  ];
  
  const isComplex = complexIndicators.some(ind => promptLower.includes(ind));
  
  // Token threshold
  const estimatedTokens = Math.ceil(promptLength / 4);
  if (estimatedTokens > config.fallbackThreshold || isComplex) {
    return {
      useLocal: false,
      reason: isComplex 
        ? 'Task complexity requires cloud model'
        : `Prompt too long (${estimatedTokens} tokens > ${config.fallbackThreshold})`,
      recommendedModel: 'kimi-k2.5', // Default to good cloud model
    };
  }

  // Simple tasks go local
  const simpleIndicators = [
    'summarize', 'extract', 'list', 'short', 'brief', 'quick',
    'classify', 'tag', 'simple', 'basic', 'format', 'convert'
  ];
  
  const isSimple = simpleIndicators.some(ind => promptLower.includes(ind));
  
  // Choose appropriate local model
  if (promptLower.includes('code') || promptLower.includes('programming')) {
    return {
      useLocal: true,
      reason: 'Coding task within token limit',
      recommendedModel: 'phi3:mini', // Better for code
    };
  }
  
  return {
    useLocal: true,
    reason: isSimple 
      ? 'Simple task suitable for local inference'
      : 'Task within token limit for local model',
    recommendedModel: config.defaultModel,
  };
}

/**
 * Get cost comparison: Local vs Cloud
 */
export function getInferenceComparison(
  estimatedTokens: number,
  cloudModel: string = 'kimi-k2.5'
): {
  local: { cost: number; speed: string; quality: string };
  cloud: { cost: number; speed: string; quality: string };
  savings: number;
} {
  // Cloud model costs (per 1K tokens)
  const cloudCosts: Record<string, number> = {
    'gemini-1.5-flash': 0.0001,
    'deepseek-chat': 0.0003,
    'kimi-k2.5': 0.0015,
    'claude-3-sonnet': 0.003,
  };
  
  const cloudCost = (cloudCosts[cloudModel] || 0.0015) * (estimatedTokens / 1000);
  
  return {
    local: {
      cost: 0,
      speed: '~30-50 tok/s',
      quality: 'Good for simple tasks',
    },
    cloud: {
      cost: cloudCost,
      speed: '~5-20 tok/s',
      quality: 'Excellent',
    },
    savings: cloudCost,
  };
}

// Export for use in model router
export { DEFAULT_OLLAMA_CONFIG as ollamaConfig };
