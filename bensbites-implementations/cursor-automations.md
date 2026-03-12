# Cursor Automations Integration
# Build always-on agents with event triggers
# Source: Ben's Bites March 11, 2026 - Cursor Automations

## Overview
Cursor now supports automations that run on schedules or events (like Slack messages).

## Use Cases for Your Workflow

### 1. Auto-PR Review
Trigger: New PR opened
Action: Run automated review, post summary

### 2. Daily Standup Bot  
Trigger: 9 AM daily
Action: Check Mission Control, post status to Discord

### 3. Lead Response
Trigger: New lead message
Action: Draft response, notify you

## Implementation

```json
// .cursor/automations.json
{
  "automations": [
    {
      "name": "daily-standup",
      "trigger": {
        "type": "schedule",
        "cron": "0 9 * * *"
      },
      "actions": [
        {
          "type": "script",
          "command": "node scripts/daily-standup.js"
        }
      ]
    },
    {
      "name": "pr-review",
      "trigger": {
        "type": "webhook",
        "event": "pull_request.opened"
      },
      "actions": [
        {
          "type": "script", 
          "command": "node scripts/auto-review.js"
        }
      ]
    }
  ]
}
```

## Setup

1. Enable Cursor Automations in settings
2. Create `.cursor/automations.json`
3. Define triggers and actions
4. Deploy

## Benefits
- No manual ghost shifts needed
- Always-on monitoring
- Event-driven responses
