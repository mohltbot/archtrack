# HEARTBEAT.md - Periodic Tasks

## Nightly Work Session (2 AM PST)

Every night at 2 AM, spawn a sub-agent to:

1. **Review Mission Control**
   - Check pending tasks
   - Review API spend vs $200 budget
   - Update task statuses

2. **Process New Information**
   - Check for new emails (if configured)
   - Review any new notes/ideas
   - Update memories from recent conversations

3. **Advance Active Projects**
   - Pick highest priority pending task
   - Do 30-60 min of focused work
   - Create PR if work is complete

4. **Report Progress**
   - Post summary to Discord
   - Update Mission Control with new tasks/expenses

## Mid-Day Check (12 PM PST)

Quick 10-min check:
- Any urgent tasks?
- API spend trending OK?
- Anything need immediate attention?

## Budget Alerts

- At $150/mo (75%): Warning notification
- At $180/mo (90%): Critical alert, pause non-essential work
- At $195/mo (97.5%): Stop all API calls, manual approval required
