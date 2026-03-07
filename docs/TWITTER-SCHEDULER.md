# Twitter/X Scheduler

A simple, budget-conscious tweet scheduling system using the X API free tier (500 posts/month).

## Overview

This scheduler allows you to queue tweets and have them posted automatically at scheduled times. It uses the X API v2 free tier which allows 500 posts per month with write access.

## Files

- `scripts/twitter-scheduler.js` - Main scheduler that posts due tweets
- `scripts/add-tweet.js` - CLI tool to add/list/remove scheduled tweets
- `data/scheduled-tweets.json` - Queue storage for scheduled tweets

## Setup

### 1. Get X API Credentials

1. Go to [developer.x.com](https://developer.x.com/en) and sign in
2. Apply for a developer account (usually instant approval)
3. Create a new project and app
4. In "Keys & Tokens", get:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret
5. Set app permissions to "Read and Write"
6. **Important**: Regenerate Access Token after changing permissions

### 2. Install Dependencies (Optional)

The scheduler works without dependencies using native fetch, but for better reliability:

```bash
cd /Users/mohlt/.openclaw/workspace
npm init -y
npm install twitter-api-v2
```

### 3. Set Environment Variables

Add to your `.zshrc` or `.bashrc`:

```bash
export X_API_KEY="your_api_key"
export X_API_SECRET="your_api_secret"
export X_ACCESS_TOKEN="your_access_token"
export X_ACCESS_TOKEN_SECRET="your_access_token_secret"
```

Then reload: `source ~/.zshrc`

### 4. Set Up Cron Job

Run the scheduler every 15 minutes:

```bash
# Edit crontab
crontab -e

# Add this line:
*/15 * * * * cd /Users/mohlt/.openclaw/workspace && /usr/local/bin/node scripts/twitter-scheduler.js >> logs/twitter-scheduler.log 2>&1
```

Create the logs directory:
```bash
mkdir -p /Users/mohlt/.openclaw/workspace/logs
```

## Usage

### Add a Tweet

```bash
# Post immediately
node scripts/add-tweet.js "Hello world!" --now

# Schedule in relative time
node scripts/add-tweet.js "Hello tomorrow" --in "1d"        # 1 day
node scripts/add-tweet.js "Hello soon" --in "2h30m"         # 2 hours 30 min
node scripts/add-tweet.js "Quick reminder" --in "30m"       # 30 minutes

# Schedule at specific time
node scripts/add-tweet.js "Meeting reminder" --time "2026-03-07 09:00"

# Default (1 hour from now)
node scripts/add-tweet.js "Default timing tweet"
```

### List Scheduled Tweets

```bash
node scripts/add-tweet.js --list
```

### Remove a Tweet

```bash
node scripts/add-tweet.js --remove tw_abc123
```

### Manual Run

```bash
# Run scheduler manually
node scripts/twitter-scheduler.js
```

## Data Format

The `data/scheduled-tweets.json` file has this structure:

```json
{
  "tweets": [
    {
      "id": "tw_abc123",
      "text": "Tweet content",
      "scheduledTime": "2026-03-07T14:30:00.000Z",
      "createdAt": "2026-03-06T10:00:00.000Z",
      "attempts": 0,
      "mediaIds": []
    }
  ],
  "posted": [
    {
      "id": "tw_xyz789",
      "text": "Posted tweet",
      "scheduledTime": "2026-03-06T09:00:00.000Z",
      "postedAt": "2026-03-06T09:15:00.000Z",
      "tweetId": "1234567890"
    }
  ],
  "failed": []
}
```

## Limitations

- **Free tier**: 500 posts/month (resets monthly)
- **No media uploads** in basic implementation (text-only)
- **No threading** support yet
- **No likes/follows** (requires paid tier)

## Troubleshooting

### "Missing environment variables"
- Check that all 4 env vars are set
- Run `echo $X_API_KEY` to verify

### "401 Unauthorized"
- Regenerate Access Token after setting "Read and Write" permissions
- Verify your credentials are correct

### "Tweet is too long"
- X limit is 280 characters
- Use a tool to count characters

### Cron not running
- Check logs: `tail -f logs/twitter-scheduler.log`
- Verify node path: `which node`
- Make sure paths in crontab are absolute

## Alternative: n8n Integration

If you prefer a visual workflow builder, n8n has native X/Twitter integration:

1. Self-host n8n or use n8n Cloud (free tier: 100 executions/month)
2. Create a workflow with:
   - Webhook trigger (receive tweet data)
   - Twitter node (post tweet)
3. Call webhook from this scheduler instead of direct API

This adds a layer but gives you visual debugging and more integrations.

## Alternative: Third-Party Services

- **Buffer**: Free tier: 3 accounts, 10 scheduled posts per account
- **Hootsuite**: Free tier: 2 accounts, 5 scheduled posts
- **Typefully**: Free tier with scheduling

These are easier but less programmable than this solution.

## Security Notes

- Never commit your API credentials
- The JSON data file contains tweet content only (no credentials)
- Consider encrypting the data file if on shared systems
- Use app-specific tokens, not your main account password

## Future Enhancements

- [ ] Media upload support
- [ ] Thread scheduling
- [ ] Duplicate detection
- [ ] Templates/snippets
- [ ] Analytics tracking
- [ ] Webhook notifications
