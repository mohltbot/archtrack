#!/usr/bin/env node
/**
 * Add Tweet - CLI tool to queue tweets for scheduling
 * 
 * Usage:
 *   node scripts/add-tweet.js "Your tweet text" --time "2026-03-07 14:30"
 *   node scripts/add-tweet.js "Your tweet text" --in "2h30m"
 *   node scripts/add-tweet.js "Your tweet text" --now
 * 
 * Options:
 *   --time, -t    Schedule at specific time (ISO 8601 or "YYYY-MM-DD HH:MM")
 *   --in, -i      Schedule in relative time (e.g., "2h30m", "1d", "30m")
 *   --now, -n     Post immediately (adds with past timestamp)
 *   --media, -m   Comma-separated list of media file paths
 *   --list, -l    List all scheduled tweets
 *   --remove, -r  Remove a tweet by ID
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'scheduled-tweets.json');

function loadTweets() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { tweets: [], posted: [], failed: [] };
  }
}

function saveTweets(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return 'tw_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

function parseRelativeTime(input) {
  const regex = /(\d+)([dhms])/g;
  let totalMs = 0;
  let match;
  
  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
      case 'h': totalMs += value * 60 * 60 * 1000; break;
      case 'm': totalMs += value * 60 * 1000; break;
      case 's': totalMs += value * 1000; break;
    }
  }
  
  return totalMs;
}

function formatTime(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function listTweets() {
  const data = loadTweets();
  
  console.log('\n📋 SCHEDULED TWEETS\n' + '='.repeat(50));
  
  if (data.tweets.length === 0) {
    console.log('No scheduled tweets.');
  } else {
    data.tweets
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
      .forEach(tweet => {
        const time = formatTime(new Date(tweet.scheduledTime));
        const status = new Date(tweet.scheduledTime) <= new Date() ? '⏰ DUE' : '⏳';
        console.log(`${status} [${time}] ${tweet.text.substring(0, 40)}...`);
        console.log(`   ID: ${tweet.id}`);
        if (tweet.attempts > 0) {
          console.log(`   ⚠️  ${tweet.attempts} failed attempt(s)`);
        }
        console.log('');
      });
  }
  
  console.log(`\n✅ Posted: ${data.posted.length} | ❌ Failed: ${data.failed.length}`);
}

function removeTweet(id) {
  const data = loadTweets();
  const initialCount = data.tweets.length;
  
  data.tweets = data.tweets.filter(t => t.id !== id && !t.id.startsWith(id));
  
  if (data.tweets.length < initialCount) {
    saveTweets(data);
    console.log(`✅ Removed tweet ${id}`);
  } else {
    console.log(`❌ Tweet ${id} not found`);
  }
}

function addTweet(text, scheduledTime, mediaPaths = []) {
  const data = loadTweets();
  
  const tweet = {
    id: generateId(),
    text,
    scheduledTime: scheduledTime.toISOString(),
    createdAt: new Date().toISOString(),
    attempts: 0,
    mediaIds: []
  };
  
  if (mediaPaths.length > 0) {
    tweet.mediaPaths = mediaPaths;
  }
  
  data.tweets.push(tweet);
  saveTweets(data);
  
  console.log('\n✅ Tweet scheduled!');
  console.log(`ID: ${tweet.id}`);
  console.log(`Time: ${formatTime(scheduledTime)}`);
  console.log(`Text: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`);
  
  return tweet;
}

// Main CLI
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Add Tweet - Queue tweets for scheduling

Usage:
  node add-tweet.js "Your tweet text" [options]

Options:
  --time, -t     Schedule at specific time ("2026-03-07 14:30" or ISO)
  --in, -i       Schedule in relative time (e.g., "2h30m", "1d")
  --now, -n      Post immediately (sets time to now)
  --list, -l     List all scheduled tweets
  --remove, -r   Remove a tweet by ID

Examples:
  node add-tweet.js "Hello world" --now
  node add-tweet.js "Hello tomorrow" --in "1d"
  node add-tweet.js "Meeting reminder" --time "2026-03-07 09:00"
  node add-tweet.js "Later tweet" --in "2h30m"
  node add-tweet.js --list
  node add-tweet.js --remove tw_abc123
`);
    return;
  }
  
  // List mode
  if (args.includes('--list') || args.includes('-l')) {
    listTweets();
    return;
  }
  
  // Remove mode
  const removeIndex = args.findIndex(a => a === '--remove' || a === '-r');
  if (removeIndex !== -1 && args[removeIndex + 1]) {
    removeTweet(args[removeIndex + 1]);
    return;
  }
  
  // Get tweet text (first non-flag argument)
  let text = '';
  let i = 0;
  while (i < args.length && !args[i].startsWith('--') && args[i] !== '-t' && args[i] !== '-i' && args[i] !== '-n' && args[i] !== '-m') {
    text += (text ? ' ' : '') + args[i];
    i++;
  }
  
  if (!text) {
    console.error('Error: Tweet text required');
    process.exit(1);
  }
  
  // Validate tweet length
  if (text.length > 280) {
    console.error(`Error: Tweet is ${text.length} characters (max 280)`);
    process.exit(1);
  }
  
  // Determine scheduled time
  let scheduledTime = null;
  
  const nowIndex = args.findIndex(a => a === '--now' || a === '-n');
  const timeIndex = args.findIndex(a => a === '--time' || a === '-t');
  const inIndex = args.findIndex(a => a === '--in' || a === '-i');
  
  if (nowIndex !== -1) {
    scheduledTime = new Date();
  } else if (timeIndex !== -1 && args[timeIndex + 1]) {
    scheduledTime = new Date(args[timeIndex + 1]);
    if (isNaN(scheduledTime.getTime())) {
      console.error('Error: Invalid time format');
      process.exit(1);
    }
  } else if (inIndex !== -1 && args[inIndex + 1]) {
    const ms = parseRelativeTime(args[inIndex + 1]);
    if (ms === 0) {
      console.error('Error: Invalid relative time format (use like "2h30m")');
      process.exit(1);
    }
    scheduledTime = new Date(Date.now() + ms);
  } else {
    // Default: schedule for 1 hour from now
    scheduledTime = new Date(Date.now() + 60 * 60 * 1000);
    console.log('No time specified, scheduling for 1 hour from now.');
  }
  
  // Get media paths
  const mediaIndex = args.findIndex(a => a === '--media' || a === '-m');
  let mediaPaths = [];
  if (mediaIndex !== -1 && args[mediaIndex + 1]) {
    mediaPaths = args[mediaIndex + 1].split(',').map(p => p.trim());
  }
  
  addTweet(text, scheduledTime, mediaPaths);
}

main();
