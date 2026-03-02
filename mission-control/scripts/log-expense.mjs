#!/usr/bin/env node
/**
 * Expense Tracking Automation Script
 * 
 * This script automatically logs API expenses from various sources:
 * - Moonshot API calls
 * - DeepSeek API calls  
 * - Gemini API calls
 * - Any other API provider
 * 
 * Usage:
 *   node scripts/log-expense.mjs --provider=moonshot --model=kimi-k2.5 --tokens-in=1000 --tokens-out=500 --description="Task description"
 *   node scripts/log-expense.mjs --from-json=./api-calls.json
 * 
 * Environment:
 *   - Reads MISSION_CONTROL_URL from env (defaults to http://localhost:3000)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const MISSION_CONTROL_URL = process.env.MISSION_CONTROL_URL || 'http://localhost:3000';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || true;
    }
  }
  
  return options;
}

// Log a single expense to Mission Control
async function logExpense({ provider, model, tokensIn, tokensOut, description, actualCost }) {
  try {
    const response = await fetch(`${MISSION_CONTROL_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description || `${provider} ${model} API call`,
        amount: actualCost || 0, // Calculate server-side if not provided
        category: 'api_call',
        provider,
        model,
        tokens_in: parseInt(tokensIn) || 0,
        tokens_out: parseInt(tokensOut) || 0,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log(`✅ Logged expense: $${result.expense?.amount?.toFixed(4) || 'unknown'} for ${provider}/${model}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to log expense: ${error.message}`);
    process.exit(1);
  }
}

// Log expenses from JSON file
async function logFromJson(filePath) {
  try {
    const fullPath = resolve(filePath);
    const data = JSON.parse(readFileSync(fullPath, 'utf-8'));
    
    if (!Array.isArray(data)) {
      throw new Error('JSON file must contain an array of expense entries');
    }
    
    console.log(`📁 Processing ${data.length} expenses from ${filePath}...`);
    
    for (const entry of data) {
      await logExpense(entry);
    }
    
    console.log(`✅ All ${data.length} expenses logged successfully`);
  } catch (error) {
    console.error(`❌ Failed to process JSON file: ${error.message}`);
    process.exit(1);
  }
}

// Main
async function main() {
  const args = parseArgs();
  
  // Show help
  if (args.help || args.h) {
    console.log(`
Expense Tracking Automation

Usage:
  node log-expense.mjs --provider=<name> --model=<name> --tokens-in=<n> --tokens-out=<n> [options]
  node log-expense.mjs --from-json=<path>

Options:
  --provider     API provider (moonshot, deepseek, gemini, etc.)
  --model        Model name (kimi-k2.5, deepseek-chat, etc.)
  --tokens-in    Number of input tokens
  --tokens-out   Number of output tokens
  --description  Description of the API call
  --actual-cost  Actual cost in USD (optional, calculated if not provided)
  --from-json    Path to JSON file with multiple expense entries
  --help, -h     Show this help message

Environment:
  MISSION_CONTROL_URL  Mission Control base URL (default: http://localhost:3000)

Examples:
  node log-expense.mjs --provider=moonshot --model=kimi-k2.5 --tokens-in=56000 --tokens-out=7500 --description="Ghost shift session"
  node log-expense.mjs --from-json=./logs/api-calls.json
`);
    process.exit(0);
  }
  
  // Batch mode from JSON
  if (args['from-json']) {
    await logFromJson(args['from-json']);
    return;
  }
  
  // Single expense mode
  if (!args.provider || !args.model) {
    console.error('❌ Error: --provider and --model are required');
    console.error('   Use --help for usage information');
    process.exit(1);
  }
  
  await logExpense({
    provider: args.provider,
    model: args.model,
    tokensIn: args['tokens-in'] || 0,
    tokensOut: args['tokens-out'] || 0,
    description: args.description,
    actualCost: args['actual-cost'] ? parseFloat(args['actual-cost']) : undefined,
  });
}

main();
