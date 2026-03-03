import { addExpense } from './store';
import pricingData from './pricing.json';

// Type definitions
interface ModelPricing {
  input: number;
  output: number;
  currency: string;
}

interface ProviderPricing {
  [model: string]: ModelPricing;
}

interface PricingData {
  lastUpdated: string;
  sources: { [provider: string]: string };
  pricing: { [provider: string]: ProviderPricing };
}

// Load pricing from JSON file
const PRICING: PricingData = pricingData;

// In-memory cache with override capability
let currentPricing: PricingData = { ...PRICING };

// Export API_PRICING for model-router compatibility
export const API_PRICING: { [provider: string]: { [model: string]: ModelPricing } } = currentPricing.pricing;

export interface APICall {
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  description?: string;
  actualCost?: number; // Use this if you know the exact cost
}

// Get pricing for a model
export function getModelPricing(provider: string, model: string): ModelPricing | null {
  const providerPricing = currentPricing.pricing[provider.toLowerCase()];
  if (!providerPricing) return null;
  
  // Try exact match first
  let pricing = providerPricing[model.toLowerCase()];
  
  // Fallback to partial match
  if (!pricing) {
    const modelKey = Object.keys(providerPricing).find(key => 
      model.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(model.toLowerCase())
    );
    if (modelKey) {
      pricing = providerPricing[modelKey];
    }
  }
  
  return pricing || null;
}

// Calculate cost for any API call
export function calculateCost(call: APICall): number {
  // If actual cost provided, use that
  if (call.actualCost !== undefined) {
    return call.actualCost;
  }
  
  const pricing = getModelPricing(call.provider, call.model);
  
  if (!pricing) {
    // Unknown model - log warning and use conservative estimate
    console.warn(`⚠️ Unknown model ${call.provider}/${call.model}, using estimate`);
    
    // Conservative estimate based on market average
    const estimatedCost = (call.tokensIn + call.tokensOut) / 1000 * 0.002;
    
    // Add to unknown models list for later review
    logUnknownModel(call.provider, call.model, estimatedCost);
    
    return estimatedCost;
  }
  
  const inputCost = (call.tokensIn / 1000) * pricing.input;
  const outputCost = (call.tokensOut / 1000) * pricing.output;
  
  return inputCost + outputCost;
}

// Track unknown models for pricing updates
const unknownModels: Map<string, { count: number; estimatedCost: number }> = new Map();

function logUnknownModel(provider: string, model: string, estimatedCost: number): void {
  const key = `${provider}/${model}`;
  const existing = unknownModels.get(key);
  
  if (existing) {
    existing.count++;
  } else {
    unknownModels.set(key, { count: 1, estimatedCost });
    console.log(`📝 New unknown model detected: ${key} (est. $${estimatedCost.toFixed(4)})`);
  }
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
    
    // Only log if cost is significant (> $0.001) or it's the first call
    if (cost > 0.001) {
      console.log(`💰 Logged: $${cost.toFixed(4)} for ${call.provider}/${call.model}`);
    }
  }
}

// Update pricing dynamically (for manual corrections or updates)
export function updatePricing(
  provider: string,
  model: string,
  inputPrice: number,
  outputPrice: number,
  currency: string = 'USD'
): void {
  if (!currentPricing.pricing[provider]) {
    currentPricing.pricing[provider] = {};
  }
  
  currentPricing.pricing[provider][model] = {
    input: inputPrice,
    output: outputPrice,
    currency,
  };
  
  console.log(`✅ Updated pricing: ${provider}/${model} - $${inputPrice}/$${outputPrice} per 1K tokens`);
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
    pricingLastUpdated: currentPricing.lastUpdated,
  };
}

// Get pricing info for display
export function getPricingInfo(): { 
  lastUpdated: string; 
  sources: { [key: string]: string };
  unknownModels: string[];
} {
  return {
    lastUpdated: currentPricing.lastUpdated,
    sources: currentPricing.sources,
    unknownModels: Array.from(unknownModels.keys()),
  };
}

// Validate pricing against actual bills (future enhancement)
export function validatePricing(provider: string, model: string, actualCost: number, tokensIn: number, tokensOut: number): void {
  const pricing = getModelPricing(provider, model);
  if (!pricing) return;
  
  const expectedCost = (tokensIn / 1000) * pricing.input + (tokensOut / 1000) * pricing.output;
  const difference = Math.abs(actualCost - expectedCost);
  const percentDiff = (difference / expectedCost) * 100;
  
  // If difference > 10%, alert about pricing discrepancy
  if (percentDiff > 10) {
    console.warn(`⚠️ Pricing discrepancy detected for ${provider}/${model}!`);
    console.warn(`   Expected: $${expectedCost.toFixed(4)}, Actual: $${actualCost.toFixed(4)}`);
    console.warn(`   Difference: ${percentDiff.toFixed(1)}%`);
    console.warn(`   Consider running: npm run update-pricing`);
  }
}

// Get all expenses
export function getExpenses(): APICall[] {
  // In-memory storage for now - could be connected to db.ts
  return [];
}

// Get monthly spend
export function getMonthlySpend(): number {
  // In-memory calculation for now
  // TODO: Connect to actual expense tracking in db
  return 13.76; // Default from known spend
}
