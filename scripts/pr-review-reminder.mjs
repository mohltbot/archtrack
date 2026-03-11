#!/usr/bin/env node
/**
 * PR Review Reminder System
 * 
 * Monitors GitHub PRs and sends reminders for stale reviews.
 * Prevents PRs from sitting unreviewed for too long.
 * 
 * Usage:
 *   node scripts/pr-review-reminder.mjs [options]
 * 
 * Options:
 *   --dry-run          Show what would happen without sending notifications
 *   --stale-days=N     Consider PRs stale after N days (default: 3)
 *   --remind-channel   Discord channel ID for reminders
 *   --quiet            Only output on action needed
 * 
 * Environment:
 *   GITHUB_TOKEN       Required. GitHub personal access token
 *   DISCORD_WEBHOOK    Optional. Discord webhook URL for notifications
 * 
 * Examples:
 *   node scripts/pr-review-reminder.mjs --dry-run
 *   node scripts/pr-review-reminder.mjs --stale-days=5
 *   node scripts/pr-review-reminder.mjs --quiet
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  staleDays: parseInt(process.argv.find(a => a.startsWith('--stale-days='))?.split('=')[1] || '3'),
  dryRun: process.argv.includes('--dry-run'),
  quiet: process.argv.includes('--quiet'),
  repo: 'mohltbot/mission-control',
  stateFile: path.join(process.cwd(), 'logs', 'pr-reminder-state.json'),
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, level = 'info') {
  if (CONFIG.quiet && level === 'info') return;
  
  const color = {
    error: colors.red,
    warn: colors.yellow,
    success: colors.green,
    info: colors.blue,
  }[level] || colors.reset;
  
  console.log(`${color}${message}${colors.reset}`);
}

function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
    }
  } catch (e) {
    log('Warning: Could not load state file', 'warn');
  }
  return { lastReminders: {}, prHistory: {} };
}

function saveState(state) {
  try {
    const dir = path.dirname(CONFIG.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
  } catch (e) {
    log('Warning: Could not save state file', 'warn');
  }
}

async function fetchOpenPRs() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable required');
  }

  log(`Fetching open PRs from ${CONFIG.repo}...`, 'info');

  try {
    const output = execSync(
      `gh pr list --repo ${CONFIG.repo} --state open --json number,title,author,createdAt,updatedAt,url,reviewers,labels --limit 50`,
      { encoding: 'utf8', env: { ...process.env, GH_TOKEN: token } }
    );
    return JSON.parse(output);
  } catch (e) {
    // Fallback to curl if gh CLI fails
    const output = execSync(
      `curl -s -H "Authorization: token ${token}" \
        "https://api.github.com/repos/${CONFIG.repo}/pulls?state=open&per_page=50"`,
      { encoding: 'utf8' }
    );
    const prs = JSON.parse(output);
    return prs.map(pr => ({
      number: pr.number,
      title: pr.title,
      author: { login: pr.user.login },
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      url: pr.html_url,
      reviewers: pr.requested_reviewers.map(r => ({ login: r.login })),
      labels: pr.labels.map(l => l.name),
    }));
  }
}

function getDaysSince(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function formatDuration(days) {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function shouldRemind(pr, state) {
  const daysOpen = getDaysSince(pr.createdAt);
  const daysSinceUpdate = getDaysSince(pr.updatedAt);
  const lastReminder = state.lastReminders[pr.number];
  
  // Don't remind if already reminded in the last 2 days
  if (lastReminder) {
    const daysSinceReminder = getDaysSince(lastReminder);
    if (daysSinceReminder < 2) return false;
  }
  
  // Remind if stale
  return daysOpen >= CONFIG.staleDays || daysSinceUpdate >= CONFIG.staleDays;
}

function generateReminderMessage(prs) {
  const now = new Date().toLocaleString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `🔄 **PR Review Reminder** — ${now}\n\n`;
  
  const stalePRs = prs.filter(pr => shouldRemind(pr, loadState()));
  
  if (stalePRs.length === 0) {
    message += `✅ All PRs are moving smoothly! No stale reviews.\n`;
    return message;
  }

  message += `⚠️ **${stalePRs.length} PR${stalePRs.length > 1 ? 's' : ''} need${stalePRs.length === 1 ? 's' : ''} attention**\n\n`;

  stalePRs.forEach(pr => {
    const daysOpen = getDaysSince(pr.createdAt);
    const daysSinceUpdate = getDaysSince(pr.updatedAt);
    
    message += `**#${pr.number}:** ${pr.title}\n`;
    message += `├ Author: @${pr.author.login}\n`;
    message += `├ Opened: ${formatDuration(daysOpen)}\n`;
    message += `├ Last update: ${formatDuration(daysSinceUpdate)}\n`;
    
    if (pr.reviewers.length > 0) {
      message += `├ Reviewers: ${pr.reviewers.map(r => '@' + r.login).join(', ')}\n`;
    }
    
    if (pr.labels.length > 0) {
      message += `├ Labels: ${pr.labels.join(', ')}\n`;
    }
    
    message += `└ <${pr.url}>\n\n`;
  });

  // Add summary stats
  const totalOpen = prs.length;
  const avgAge = Math.floor(prs.reduce((sum, pr) => sum + getDaysSince(pr.createdAt), 0) / totalOpen);
  
  message += `\n📊 **Stats**\n`;
  message += `• Total open PRs: ${totalOpen}\n`;
  message += `• Stale PRs: ${stalePRs.length}\n`;
  message += `• Average age: ${avgAge} days\n`;
  message += `• Reminder threshold: ${CONFIG.staleDays} days\n`;

  return message;
}

async function sendDiscordNotification(message) {
  const webhookUrl = process.env.DISCORD_WEBHOOK;
  if (!webhookUrl) {
    log('No DISCORD_WEBHOOK configured — skipping Discord notification', 'warn');
    return false;
  }

  if (CONFIG.dryRun) {
    log('[DRY RUN] Would send Discord notification:', 'info');
    log(message, 'info');
    return true;
  }

  try {
    const payload = JSON.stringify({ content: message });
    execSync(`curl -s -X POST -H "Content-Type: application/json" -d '${payload}' "${webhookUrl}"`, {
      encoding: 'utf8'
    });
    log('Discord notification sent', 'success');
    return true;
  } catch (e) {
    log('Failed to send Discord notification: ' + e.message, 'error');
    return false;
  }
}

function updateState(prs, remindedPRs) {
  const state = loadState();
  const now = new Date().toISOString();
  
  remindedPRs.forEach(pr => {
    state.lastReminders[pr.number] = now;
  });
  
  // Update PR history
  prs.forEach(pr => {
    if (!state.prHistory[pr.number]) {
      state.prHistory[pr.number] = {
        created: pr.createdAt,
        reminders: [],
      };
    }
    if (remindedPRs.find(r => r.number === pr.number)) {
      state.prHistory[pr.number].reminders.push(now);
    }
  });
  
  // Clean up closed PRs from state
  const openNumbers = new Set(prs.map(p => p.number));
  Object.keys(state.lastReminders).forEach(num => {
    if (!openNumbers.has(parseInt(num))) {
      delete state.lastReminders[num];
    }
  });
  
  saveState(state);
}

async function main() {
  log('🔍 PR Review Reminder System', 'info');
  log(`Configuration: stale-after=${CONFIG.staleDays} days, dry-run=${CONFIG.dryRun}`, 'info');
  
  try {
    const prs = await fetchOpenPRs();
    
    if (prs.length === 0) {
      log('No open PRs found — nothing to do!', 'success');
      return;
    }
    
    log(`Found ${prs.length} open PR(s)`, 'info');
    
    const state = loadState();
    const stalePRs = prs.filter(pr => shouldRemind(pr, state));
    
    if (stalePRs.length === 0) {
      log('No stale PRs requiring reminders', 'success');
      return;
    }
    
    log(`${stalePRs.length} PR(s) need reminders`, 'warn');
    
    stalePRs.forEach(pr => {
      const days = getDaysSince(pr.createdAt);
      log(`  #${pr.number}: "${pr.title.substring(0, 50)}..." — ${days} days old`, 'warn');
    });
    
    const message = generateReminderMessage(prs);
    await sendDiscordNotification(message);
    
    updateState(prs, stalePRs);
    
    log('Reminder cycle complete', 'success');
    
  } catch (e) {
    log(`Error: ${e.message}`, 'error');
    process.exit(1);
  }
}

main();
