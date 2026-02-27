import { API_PRICING, logAPICall } from './expense-tracker';
import { 
  checkOllamaHealth, 
  generateLocal, 
  shouldUseLocalInference,
  getInferenceComparison,
  DEFAULT_OLLAMA_CONFIG 
} from './ollama';

export type ModelTier = 'fast' | 'balanced' | 'powerful' | 'local';
export type TaskType = 'coding' | 'writing' | 'analysis' | 'creative' | 'chat' | 'vision' | 'simple';

interface ModelRecommendation {
  provider: string;
  model: string;
  estimatedCost: number;
  confidence: number; // 0-1, how sure we are this model is appropriate
  reason: string;
}

// Model capabilities mapping
const MODEL_CAPABILITIES: Record<string, {
  tiers: ModelTier[];
  tasks: TaskType[];
  strengths: string[];
  weaknesses: string[];
}> = {
  // Cheap, fast models
  'deepseek-chat': {
    tiers: ['fast', 'balanced'],
    tasks: ['coding', 'writing', 'chat'],
    strengths: ['fast', 'cheap', 'good_at_coding'],
    weaknesses: ['complex_reasoning', 'creative_tasks'],
  },
  'minimax-m2.5': {
    tiers: ['fast', 'balanced'],
    tasks: ['coding', 'writing', 'chat', 'analysis'],
    strengths: ['fast', 'cheap', 'good_at_coding', 'chinese_language'],
    weaknesses: ['complex_reasoning'],
  },
  'glm-5': {
    tiers: ['balanced', 'powerful'],
    tasks: ['coding', 'writing', 'analysis', 'chat'],
    strengths: ['tool_calling', 'cheap', 'good_at_coding'],
    weaknesses: ['creative_writing'],
  },
  'gemini-1.5-flash': {
    tiers: ['fast'],
    tasks: ['writing', 'chat', 'vision'],
    strengths: ['very_cheap', 'fast', 'vision'],
    weaknesses: ['complex_coding', 'deep_analysis'],
  },
  
  // Mid-tier models
  'kimi-k2.5': {
    tiers: ['balanced', 'powerful'],
    tasks: ['coding', 'writing', 'analysis', 'chat', 'creative'],
    strengths: ['balanced', 'good_at_coding', 'context_window', 'chinese_language'],
    weaknesses: ['extremely_complex_reasoning'],
  },
  'claude-3-sonnet': {
    tiers: ['balanced', 'powerful'],
    tasks: ['coding', 'writing', 'analysis', 'chat', 'creative'],
    strengths: ['coding', 'analysis', 'safety'],
    weaknesses: ['cost'],
  },
  'gpt-4o-mini': {
    tiers: ['fast', 'balanced'],
    tasks: ['coding', 'writing', 'chat'],
    strengths: ['fast', 'cheap', 'vision'],
    weaknesses: ['complex_reasoning'],
  },
  
  // Premium models
  'claude-3-opus': {
    tiers: ['powerful'],
    tasks: ['coding', 'writing', 'analysis', 'creative'],
    strengths: ['complex_reasoning', 'coding', 'analysis', 'creative_writing'],
    weaknesses: ['cost', 'speed'],
  },
  'gpt-4o': {
    tiers: ['balanced', 'powerful'],
    tasks: ['coding', 'writing', 'analysis', 'chat', 'vision', 'creative'],
    strengths: ['versatile', 'vision', 'tool_use'],
    weaknesses: ['cost'],
  },
  'gemini-1.5-pro': {
    tiers: ['balanced', 'powerful'],
    tasks: ['coding', 'analysis', 'vision', 'creative'],
    strengths: ['context_window', 'vision', 'cheap_for_quality'],
    weaknesses: ['consistency'],
  },
};

// Cost per 1K tokens for comparison
function getModelCost(model: string): number {
  // Search through all providers for the model
  for (const providerModels of Object.values(API_PRICING)) {
    const pricing = providerModels[model.toLowerCase()];
    if (pricing) {
      return (pricing.input + pricing.output) / 2; // Average of input/output
    }
    // Try partial match
    const modelKey = Object.keys(providerModels).find(key => 
      model.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(model.toLowerCase())
    );
    if (modelKey) {
      const p = providerModels[modelKey];
      return (p.input + p.output) / 2;
    }
  }
  return 0.005; // Default to conservative estimate
}

// Recommend best model for task
export function recommendModel(
  task: TaskType,
  tier: ModelTier = 'balanced',
  requiredCapabilities: string[] = [],
  maxCost?: number
): ModelRecommendation[] {
  const candidates: ModelRecommendation[] = [];
  
  for (const [model, capabilities] of Object.entries(MODEL_CAPABILITIES)) {
    // Check if model supports the task type
    if (!capabilities.tasks.includes(task)) continue;
    
    // Check if model is in the requested tier
    if (!capabilities.tiers.includes(tier)) continue;
    
    // Check required capabilities
    const hasAllCapabilities = requiredCapabilities.every(cap => 
      capabilities.strengths.includes(cap)
    );
    if (!hasAllCapabilities) continue;
    
    // Calculate cost
    const cost = getModelCost(model);
    if (maxCost && cost > maxCost) continue;
    
    // Calculate confidence score
    let confidence = 0.5;
    if (capabilities.tiers.includes(tier)) confidence += 0.2;
    if (capabilities.tasks.includes(task)) confidence += 0.2;
    confidence += (requiredCapabilities.filter(cap => 
      capabilities.strengths.includes(cap)
    ).length / Math.max(requiredCapabilities.length, 1)) * 0.1;
    
    // Find provider
    let provider = 'unknown';
    for (const [provName, models] of Object.entries(API_PRICING)) {
      if (models[model.toLowerCase()]) {
        provider = provName;
        break;
      }
      // Try partial match
      const modelKey = Object.keys(models).find(key => 
        model.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(model.toLowerCase())
      );
      if (modelKey) {
        provider = provName;
        break;
      }
    }
    
    candidates.push({
      provider,
      model,
      estimatedCost: cost,
      confidence: Math.min(confidence, 1),
      reason: generateReason(model, capabilities, task),
    });
  }
  
  // Sort by cost (cheapest first), then by confidence
  return candidates.sort((a, b) => {
    if (Math.abs(a.confidence - b.confidence) > 0.2) {
      return b.confidence - a.confidence; // Confidence matters more if big difference
    }
    return a.estimatedCost - b.estimatedCost;
  });
}

function generateReason(model: string, capabilities: any, task: TaskType): string {
  const reasons: string[] = [];
  
  if (capabilities.strengths.includes('cheap') || getModelCost(model) < 0.001) {
    reasons.push('very cost-effective');
  }
  
  if (capabilities.strengths.includes('fast')) {
    reasons.push('fast response time');
  }
  
  if (capabilities.strengths.includes('good_at_coding') && task === 'coding') {
    reasons.push('excellent at coding');
  }
  
  if (capabilities.tiers.includes('powerful')) {
    reasons.push('high quality output');
  }
  
  return reasons.join(', ') || 'balanced performance';
}

// Auto-select and use best model
export async function executeWithBestModel(
  task: TaskType,
  prompt: string,
  options: {
    tier?: ModelTier;
    maxCost?: number;
    requiredCapabilities?: string[];
    fallbackToPremium?: boolean;
    preferLocal?: boolean; // New: prefer local inference when possible
  } = {}
): Promise<{
  result: string;
  modelUsed: string;
  cost: number;
  confidence: number;
  local: boolean;
  duration: number;
}> {
  
  // Check if we should try local inference first
  const localDecision = shouldUseLocalInference(task, prompt.length);
  const preferLocal = options.preferLocal ?? true; // Default to using local when possible
  
  // Try local inference for simple tasks
  if (preferLocal && localDecision.useLocal && DEFAULT_OLLAMA_CONFIG.enabled) {
    const health = await checkOllamaHealth();
    
    if (health.available) {
      console.log(`🤖 Using LOCAL inference (${localDecision.recommendedModel})`);
      console.log(`   Reason: ${localDecision.reason}`);
      console.log(`   Cost: $0.00 (FREE!)`);
      
      const localResult = await generateLocal(prompt, {
        model: localDecision.recommendedModel,
        maxTokens: 150,
      });
      
      if (!localResult.fallbackRequired && localResult.text) {
        // Log the "savings" as a negative expense (cost avoidance)
        const comparison = getInferenceComparison(Math.ceil(prompt.length / 4));
        
        logAPICall({
          provider: 'ollama',
          model: localResult.model,
          tokensIn: Math.ceil(prompt.length / 4),
          tokensOut: localResult.tokens,
          description: `Local inference for ${task} task (saved $${comparison.savings.toFixed(4)})`,
        });
        
        return {
          result: localResult.text,
          modelUsed: `ollama/${localResult.model}`,
          cost: 0,
          confidence: 0.7, // Local models are good but not perfect
          local: true,
          duration: localResult.duration,
        };
      }
      
      // Fallback required, continue to cloud
      console.log(`   Local inference unavailable, falling back to cloud...`);
    }
  }
  
  // Fall back to cloud models
  const recommendations = recommendModel(
    task,
    options.tier || 'balanced',
    options.requiredCapabilities || [],
    options.maxCost
  );
  
  if (recommendations.length === 0) {
    throw new Error('No suitable model found for task');
  }
  
  const bestModel = recommendations[0];
  
  console.log(`☁️  Using CLOUD model: ${bestModel.model}`);
  console.log(`   Provider: ${bestModel.provider}`);
  console.log(`   Reason: ${bestModel.reason}`);
  console.log(`   Est. cost: $${bestModel.estimatedCost.toFixed(4)} per 1K tokens`);
  
  // Simulate API call and cost logging
  const estimatedTokens = Math.ceil(prompt.length / 4);
  const actualCost = (estimatedTokens / 1000) * bestModel.estimatedCost;
  
  logAPICall({
    provider: bestModel.provider,
    model: bestModel.model,
    tokensIn: estimatedTokens,
    tokensOut: Math.ceil(estimatedTokens * 0.5),
    description: `Cloud model for ${task} task`,
  });
  
  return {
    result: `[Simulated output from ${bestModel.model}]`,
    modelUsed: bestModel.model,
    cost: actualCost,
    confidence: bestModel.confidence,
    local: false,
    duration: 1000, // Simulated 1s latency
  };
}

// Get cost comparison for a task across all suitable models
export function getCostComparison(
  task: TaskType,
  estimatedTokens: number = 1000
): Array<{
  model: string;
  cost: number;
  tier: ModelTier;
  recommended: boolean;
}> {
  const recommendations = recommendModel(task, 'fast');
  
  return recommendations.map((rec, index) => ({
    model: rec.model,
    cost: rec.estimatedCost * (estimatedTokens / 1000),
    tier: MODEL_CAPABILITIES[rec.model]?.tiers[0] || 'balanced',
    recommended: index === 0,
  }));
}

// Get local inference status and savings report
export async function getLocalInferenceReport(): Promise<{
  available: boolean;
  models: string[];
  config: typeof DEFAULT_OLLAMA_CONFIG;
  estimatedMonthlySavings: number;
}> {
  const health = await checkOllamaHealth();
  
  // Estimate savings: assume 60% of tasks under 150 tokens use local
  // Average cloud task cost: $0.0015 per 1K tokens
  // Daily tasks: ~50, monthly: ~1500
  // Local tasks: 60% of 1500 = 900 tasks
  // Avg tokens per task: ~500
  const monthlyLocalTasks = 900;
  const avgTokensPerTask = 500;
  const avgCloudCostPer1K = 0.0015;
  
  const estimatedMonthlySavings = health.available 
    ? monthlyLocalTasks * (avgTokensPerTask / 1000) * avgCloudCostPer1K
    : 0;
  
  return {
    available: health.available,
    models: health.models,
    config: DEFAULT_OLLAMA_CONFIG,
    estimatedMonthlySavings,
  };
}

// Export Ollama utilities for external use
export { checkOllamaHealth, generateLocal, shouldUseLocalInference, getInferenceComparison };
