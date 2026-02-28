#!/usr/bin/env node
/**
 * Cost Tracker Skill
 * Monitors and logs all API costs to Mission Control
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../mission-control/data/db.json');

// Provider pricing (per 1K tokens)
const PRICING = {
  'moonshot/kimi-k2.5': { input: 0.0015, output: 0.0015 },
  'gemini-1.5-flash': { input: 0.0001, output: 0.0001 },
  'deepseek-chat': { input: 0.0003, output: 0.0003 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'browser-use': { perRequest: 0.01 } // Approximate
};

function logAPICall(provider, model, tokensIn, tokensOut, description = '') {
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    
    // Calculate cost
    const pricing = PRICING[`${provider}/${model}`] || PRICING[model] || { input: 0.001, output: 0.001 };
    const cost = ((tokensIn / 1000) * pricing.input) + ((tokensOut / 1000) * pricing.output);
    
    const newExpense = {
      id: db.expenses.length + 1,
      description: description || `${provider} ${model} call`,
      amount: Math.round(cost * 10000) / 10000,
      category: 'api_call',
      provider,
      model,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      created_at: new Date().toISOString()
    };
    
    db.expenses.push(newExpense);
    
    // Update budget status
    const total = db.expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(`💰 API Call: $${newExpense.amount.toFixed(4)} | Total: $${total.toFixed(2)}`);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return newExpense;
  } catch (err) {
    console.error('Failed to log API call:', err.message);
    return null;
  }
}

function getBudgetStatus() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const total = db.expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = 200;
    const percent = (total / budget) * 100;
    
    return {
      spent: total,
      budget,
      remaining: budget - total,
      percentUsed: percent,
      status: percent > 90 ? 'critical' : percent > 75 ? 'warning' : 'ok'
    };
  } catch (err) {
    console.error('Failed to get budget status:', err.message);
    return null;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'status') {
    const status = getBudgetStatus();
    if (status) {
      console.log(`\n📊 Budget Status`);
      console.log(`Spent: $${status.spent.toFixed(2)} / $${status.budget}`);
      console.log(`Remaining: $${status.remaining.toFixed(2)}`);
      console.log(`Used: ${status.percentUsed.toFixed(1)}%`);
      console.log(`Status: ${status.status.toUpperCase()}`);
    }
  } else if (args[0] === 'log' && args[1] && args[2]) {
    const [provider, model, tokensIn, tokensOut, description] = args.slice(1);
    logAPICall(provider, model, parseInt(tokensIn), parseInt(tokensOut), description);
  } else {
    console.log('Usage:');
    console.log('  node track.js status                           # Show budget status');
    console.log('  node track.js log <provider> <model> <in> <out> [desc]  # Log API call');
  }
}

module.exports = { logAPICall, getBudgetStatus };
