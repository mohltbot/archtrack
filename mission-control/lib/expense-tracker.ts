import { addExpense } from './store';

// Pricing per 1K tokens (input, output)
export const API_PRICING: Record<string, { input: number; output: number }> = {
  // Moonshot (Chinese models, very cheap)
  'kimi-k2.5': { input: 0.0005, output: 0.0015 },
  'kimi-k1.5': { input: 0.0003, output: 0.001 },
  'kimi-latest': { input: 0.0005, output: 0.0015 },
  'kimi-k2': { input: 0.0003, output: 0.001 },
  
  // OpenAI
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  
  // Anthropic
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  
  // DeepSeek
  'deepseek-chat': { input: 0.00014, output: 0.00028 },
  'deepseek-reasoner': { input: 0.00055, output: 0.00219 },
  'deepseek-r1': { input: 0.00055, output: 0.00219 },
  
  // Google/Gemini
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  
  // Minimax (Chinese)
  'minimax-m2.5': { input: 0.0002, output: 0.001 },
  'minimax-text-01': { input: 0.0002, output: 0.001 },
  
  // GLM (Chinese)
  'glm-5': { input: 0.0003, output: 0.0009 },
  'glm-4': { input: 0.0005, output: 0.0015 },
  
  // OpenRouter (aggregates many)
  'openrouter': { input: 0.001, output: 0.003 }, // Approximate
};

export interface APICall {
  provider: 'moonshot' | 'openai' | 'anthropic' | 'deepseek' | 'google' | 'minimax' | 'glm' | 'openrouter' | string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  description?: string;
}

// Calculate cost for any API call
export function calculateCost(call: APICall): number {
  const pricing = API_PRICING[call.model.toLowerCase()];
  
  if (!pricing) {
    // Unknown model - estimate based on provider
    console.warn(`Unknown model ${call.model}, estimating cost`);
    return (call.tokensIn + call.tokensOut) / 1000 * 0.001; // Conservative $0.001/1K tokens
  }
  
  const inputCost = (call.tokensIn / 1000) * pricing.input;
  const outputCost = (call.tokensOut / 1000) * pricing.output;
  
  return inputCost + outputCost;
}

// Auto-log any API call
export function logAPICall(call: APICall): void {
  const cost = calculateCost(call);
  
  if (cost > 0) {
    addExpense({
      description: call.description || `${call.provider} ${call.model} API call`,
      amount: cost,
      category: 'api_call',
      provider: call.provider,
      model: call.model,
      tokens_in: call.tokensIn,
      tokens_out: call.tokensOut,
    });
    
    console.log(`💰 Logged: $${cost.toFixed(4)} for ${call.provider}/${call.model}`);
  }
}

// Log expense for non-token-based costs (subscriptions, etc)
export function logExpense(
  description: string,
  amount: number,
  category: 'api_call' | 'infrastructure' | 'tool' | 'other' = 'other',
  provider?: string
): void {
  addExpense({
    description,
    amount,
    category,
    provider,
  });
}

// Get current budget status
export function getBudgetStatus() {
  const { getMonthlySpend } = require('./store');
  const spent = getMonthlySpend();
  const budget = 200;
  const remaining = budget - spent;
  const percentUsed = (spent / budget) * 100;
  
  return {
    spent,
    budget,
    remaining,
    percentUsed,
    status: percentUsed > 90 ? 'critical' : percentUsed > 75 ? 'warning' : 'ok',
  };
}
