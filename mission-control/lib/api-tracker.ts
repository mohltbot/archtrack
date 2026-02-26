import { logAPICall } from './expense-tracker';

// Enhanced API call wrapper with guaranteed expense logging
export async function trackAPICall<T>(
  provider: string,
  model: string,
  operation: () => Promise<T>,
  estimateTokens: { input: number; output: number },
  description: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    // Execute the API call
    const result = await operation();
    
    // Log the expense (guaranteed to run)
    logAPICall({
      provider,
      model,
      tokensIn: estimateTokens.input,
      tokensOut: estimateTokens.output,
      description,
    });
    
    // Log to console for debugging
    console.log(`💰 Tracked: ${provider}/${model} - ${description}`);
    
    return result;
  } catch (error) {
    // Still log the expense even if call failed (tokens were used)
    logAPICall({
      provider,
      model,
      tokensIn: estimateTokens.input,
      tokensOut: 0, // No output on error
      description: `${description} (FAILED)`,
    });
    
    throw error;
  }
}

// Session token tracker
class SessionTracker {
  private tokensIn = 0;
  private tokensOut = 0;
  private calls = 0;
  
  addCall(tokensIn: number, tokensOut: number) {
    this.tokensIn += tokensIn;
    this.tokensOut += tokensOut;
    this.calls++;
  }
  
  getStats() {
    return {
      calls: this.calls,
      tokensIn: this.tokensIn,
      tokensOut: this.tokensOut,
      estimatedCost: this.calculateCost(),
    };
  }
  
  private calculateCost(): number {
    // kimi-k2.5 pricing: $0.0005/1K input, $0.0015/1K output
    const inputCost = (this.tokensIn / 1000) * 0.0005;
    const outputCost = (this.tokensOut / 1000) * 0.0015;
    return inputCost + outputCost;
  }
  
  reset() {
    this.tokensIn = 0;
    this.tokensOut = 0;
    this.calls = 0;
  }
}

export const sessionTracker = new SessionTracker();
