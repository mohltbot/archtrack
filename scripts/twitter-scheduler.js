#!/usr/bin/env node
/**
 * Twitter/X Scheduler - Main script to post scheduled tweets
 * 
 * Usage: node scripts/twitter-scheduler.js
 * 
 * This script:
 * 1. Reads scheduled tweets from data/scheduled-tweets.json
 * 2. Posts tweets that are due (scheduled time <= now)
 * 3. Moves posted tweets to the 'posted' array
 * 4. Retries failed tweets (max 3 attempts)
 * 
 * Run via cron every 15 minutes:
 * */15 * * * * cd /Users/mohlt/.openclaw/workspace && node scripts/twitter-scheduler.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_FILE = path.join(__dirname, '..', 'data', 'scheduled-tweets.json');
const MAX_RETRIES = 3;

// Load scheduled tweets
function loadTweets() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading tweets:', err.message);
    return { tweets: [], posted: [], failed: [] };
  }
}

// Save scheduled tweets
function saveTweets(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving tweets:', err.message);
    return false;
  }
}

// Post a tweet using X API v2
async function postTweet(text, mediaIds = []) {
  // Check for required environment variables
  const required = ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  // Use twitter-api-v2 if available, otherwise use native fetch
  try {
    const { TwitterApi } = require('twitter-api-v2');
    const client = new TwitterApi({
      appKey: process.env.X_API_KEY,
      appSecret: process.env.X_API_SECRET,
      accessToken: process.env.X_ACCESS_TOKEN,
      accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
    });

    const tweet = await client.v2.tweet(text);
    return { success: true, id: tweet.data.id, text: tweet.data.text };
  } catch (err) {
    // Fallback to native fetch if twitter-api-v2 not installed
    if (err.code === 'MODULE_NOT_FOUND') {
      return postTweetNative(text, mediaIds);
    }
    throw err;
  }
}

// Native fetch implementation (OAuth 1.0a)
async function postTweetNative(text, mediaIds = []) {
  const crypto = require('crypto');
  
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

  const url = 'https://api.twitter.com/2/tweets';
  const method = 'POST';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);

  const params = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0'
  };

  // Create signature base string
  const paramString = Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const sigBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const sigKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
  const signature = crypto.createHmac('sha1', sigKey).update(sigBase).digest('base64');

  params.oauth_signature = signature;

  const authHeader = 'OAuth ' + Object.keys(params).map(k => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`).join(', ');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { success: true, id: data.data.id, text: data.data.text };
}

// Main scheduler function
async function runScheduler() {
  console.log(`\n[${new Date().toISOString()}] Starting Twitter scheduler...`);

  const data = loadTweets();
  const now = new Date();
  const dueTweets = [];
  const remainingTweets = [];

  // Find tweets that are due
  for (const tweet of data.tweets) {
    const scheduledTime = new Date(tweet.scheduledTime);
    if (scheduledTime <= now) {
      dueTweets.push(tweet);
    } else {
      remainingTweets.push(tweet);
    }
  }

  if (dueTweets.length === 0) {
    console.log('No tweets due for posting.');
    return;
  }

  console.log(`Found ${dueTweets.length} tweet(s) due for posting.`);

  // Post due tweets
  for (const tweet of dueTweets) {
    console.log(`\nPosting tweet scheduled for ${tweet.scheduledTime}:`);
    console.log(`Content: ${tweet.text.substring(0, 50)}...`);

    try {
      const result = await postTweet(tweet.text, tweet.mediaIds || []);
      
      // Move to posted
      const postedTweet = {
        ...tweet,
        postedAt: new Date().toISOString(),
        tweetId: result.id
      };
      data.posted.push(postedTweet);
      console.log(`✅ Posted successfully! Tweet ID: ${result.id}`);
    } catch (err) {
      console.error(`❌ Failed to post: ${err.message}`);
      
      // Increment retry count
      tweet.attempts = (tweet.attempts || 0) + 1;
      tweet.lastError = err.message;
      tweet.lastAttempt = new Date().toISOString();

      if (tweet.attempts >= MAX_RETRIES) {
        console.log(`Max retries (${MAX_RETRIES}) reached. Moving to failed.`);
        data.failed.push(tweet);
      } else {
        console.log(`Will retry (attempt ${tweet.attempts}/${MAX_RETRIES}).`);
        remainingTweets.push(tweet);
      }
    }
  }

  // Update data
  data.tweets = remainingTweets;
  
  if (saveTweets(data)) {
    console.log(`\n✅ Scheduler complete. ${dueTweets.length} processed, ${data.tweets.length} remaining.`);
  }
}

// Run if called directly
if (require.main === module) {
  runScheduler().catch(err => {
    console.error('Scheduler error:', err);
    process.exit(1);
  });
}

module.exports = { runScheduler, postTweet };
