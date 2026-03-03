#!/usr/bin/env node
/**
 * Expense Tracking Automation
 * Syncs API costs from local logs to Google Sheets for accurate budget tracking
 * Fixes the budget tracking bug by reconciling actual vs tracked spend
 * 
 * Usage: node scripts/sync-expenses-to-sheets.mjs
 * Cron: 0 */6 * * * (every 6 hours)
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPENSE_LOG = path.join(__dirname, '../data/expenses.json');
const TOKEN_PATH = path.join(process.env.HOME, '.config/gog/tokens.json');

// Google Sheets config
const SPREADSHEET_ID = process.env.MISSION_CONTROL_SHEET_ID || '1YourSheetIDHere';
const SHEET_NAME = 'API Costs';

async function loadExpenses() {
  try {
    const data = await fs.readFile(EXPENSE_LOG, 'utf8');
    return JSON.parse(data);
  } catch {
    return { entries: [], totalTracked: 0 };
  }
}

async function getAuth() {
  const tokens = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);
  return auth;
}

async function syncToSheets(expenses) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Prepare data rows
  const rows = expenses.entries.map(e => [
    new Date(e.timestamp).toISOString(),
    e.provider,
    e.model,
    e.tokensIn,
    e.tokensOut,
    e.cost,
    e.task,
    e.sessionId?.slice(0, 8) || 'N/A'
  ]);
  
  // Add header if sheet is empty
  if (rows.length === 0) {
    console.log('ℹ️ No new expenses to sync');
    return;
  }
  
  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: rows }
  });
  
  console.log(`✅ Synced ${rows.length} expense entries to Google Sheets`);
  
  // Calculate totals by provider
  const totals = expenses.entries.reduce((acc, e) => {
    acc[e.provider] = (acc[e.provider] || 0) + e.cost;
    return acc;
  }, {});
  
  console.log('\n📊 Provider Totals (this batch):');
  Object.entries(totals).forEach(([provider, cost]) => {
    console.log(`  ${provider}: $${cost.toFixed(4)}`);
  });
}

async function reconcileBudget(expenses) {
  // Calculate actual spend from log entries
  const actualSpend = expenses.entries.reduce((sum, e) => sum + e.cost, 0);
  const discrepancy = expenses.totalTracked - actualSpend;
  
  console.log('\n🔍 Budget Reconciliation:');
  console.log(`  Tracked: $${expenses.totalTracked.toFixed(2)}`);
  console.log(`  Actual:  $${actualSpend.toFixed(2)}`);
  console.log(`  Diff:    $${discrepancy.toFixed(2)} ${discrepancy > 0 ? '(overtracked)' : '(undertracked)'}`);
  
  if (Math.abs(discrepancy) > 0.01) {
    console.log('\n⚠️  Budget tracking bug detected!');
    console.log('   Run: npm run budget:fix to reset tracked amounts');
  }
}

async function main() {
  console.log('💰 Expense Tracking Automation');
  console.log('==============================\n');
  
  try {
    const expenses = await loadExpenses();
    
    if (expenses.entries.length === 0) {
      console.log('ℹ️ No expenses logged yet');
      return;
    }
    
    await syncToSheets(expenses);
    await reconcileBudget(expenses);
    
    console.log('\n✅ Expense sync complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 Fix: Run "gog auth refresh" to renew Google tokens');
    }
    process.exit(1);
  }
}

main();
