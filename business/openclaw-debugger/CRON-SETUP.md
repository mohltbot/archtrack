# OpenClaw Debugger — Proactive Work System

## Overview
This system runs 4x daily to proactively work on your OpenClaw debugger business.

**Status:** ✅ ACTIVE  
**Schedule:** 8 AM, 12 PM, 4 PM, 8 PM PST  
**Location:** `~/Library/LaunchAgents/com.openclaw.debugger.shift*.plist`

---

## Schedule

| Shift | Time (PST) | Focus | Duration |
|-------|------------|-------|----------|
| **Shift 1** | 8:00 AM | Morning Outreach | 30 min |
| **Shift 2** | 12:00 PM | Midday Content | 30 min |
| **Shift 3** | 4:00 PM | Follow-up & Closing | 30 min |
| **Shift 4** | 8:00 PM | Content + Planning | 30 min |

**Total:** 2 hours/day of proactive business development

---

## What Each Shift Does

### Shift 1: Morning Outreach (8 AM)
- Search Twitter for OpenClaw issues
- Reply to 5 tweets with helpful tips
- DM 2 frustrated people
- Check Discord communities
- Log leads to `LEADS.md`

### Shift 2: Midday Content (12 PM)
- Create 1 piece of content (Twitter thread, tip, case study)
- Engage with community (replies, likes, follows)
- Track performance in `CONTENT-QUEUE.md`

### Shift 3: Afternoon Follow-up (4 PM)
- Follow up with warm leads (Day 2, 7, 14)
- Check Fiverr messages
- Close deals, send payment links
- Update lead statuses

### Shift 4: Evening Content + Planning (8 PM)
- Second content piece (IndieHackers, LinkedIn)
- Prepare tomorrow's content
- Daily report to `memory/YYYY-MM-DD.md`
- Weekly planning (on Sundays)

---

## Files Created

### Core Prompt
`business/openclaw-debugger/AGENT-PROMPT.md` — Detailed instructions for each shift

### Tracking Files (Auto-created)
- `business/openclaw-debugger/LEADS.md` — Prospect tracking
- `business/openclaw-debugger/CONTENT-QUEUE.md` — Content calendar & performance
- `business/openclaw-debugger/METRICS.md` — Daily stats

### Cron Jobs (Visible in Web UI)
- `debugger-shift-1` — 8 AM PST (Morning Outreach)
- `debugger-shift-2` — 12 PM PST (Content Creation)
- `debugger-shift-3` — 4 PM PST (Follow-ups)
- `debugger-shift-4` — 8 PM PST (Content + Planning)

View at: http://localhost:18789/cron

---

## Management Commands

### Check Status (Web UI)
Visit: http://localhost:18789/cron

Or via CLI:
```bash
openclaw cron list
```

### View All Debugger Jobs
```bash
openclaw cron list | grep debugger
```

### Run a Shift Manually (Test)
```bash
openclaw cron run debugger-shift-1
```

### Disable/Enable a Shift
```bash
# Disable Shift 1
openclaw cron disable debugger-shift-1

# Enable Shift 1
openclaw cron enable debugger-shift-1
```

### Remove All Shifts (if needed)
```bash
openclaw cron rm debugger-shift-1
openclaw cron rm debugger-shift-2
openclaw cron rm debugger-shift-3
openclaw cron rm debugger-shift-4
```

### View Run History
```bash
openclaw cron runs debugger-shift-1
```

---

## Expected Results

### Daily Targets
- 10+ outreach messages
- 1-2 content pieces
- 5+ follow-ups
- 2+ new leads

### Weekly Targets (Month 1)
- 10-15 conversations
- 3-5 discovery calls
- 1-2 paying customers
- $75-300 revenue

### Monthly Targets
- Month 1: $500 revenue, 5 reviews
- Month 3: $3,000/month recurring
- Month 6: $7,500/month recurring

---

## Success Metrics

Track these in `business/openclaw-debugger/METRICS.md`:

| Metric | Target | Actual |
|--------|--------|--------|
| Outreach messages/day | 10 | |
| Content pieces/day | 1-2 | |
| New leads/day | 2 | |
| Customers/week | 1-2 | |
| Revenue/week | $150+ | |

---

## First Week Checklist

- [ ] Fiverr gig is live
- [ ] Landing page deployed
- [ ] First shift runs (check logs)
- [ ] LEADS.md created with first prospects
- [ ] First content posted
- [ ] First follow-up sent
- [ ] First customer conversation

---

## Troubleshooting

### Shifts Not Running
1. Check logs: `tail ~/.openclaw/workspace/logs/debugger-shift*-error.log`
2. Verify launch agents: `launchctl list | grep com.openclaw`
3. Reload agents: unload then load

### No Leads Generated
- Check AGENT-PROMPT.md for search terms
- Verify Twitter/Discord access
- Review outreach templates

### No Content Posted
- Check CONTENT-CALENDAR.md for ideas
- Verify social media accounts accessible
- Review content templates

---

## Next Steps

1. **Deploy landing page** (if not done)
2. **Launch Fiverr gig** (if not done)
3. **Check first shift** — Should run at next scheduled time
4. **Review logs** — Check `logs/debugger-shift1.log` after 8 AM
5. **Iterate** — Adjust based on what's working

---

## Support

**Documentation:**
- Full business plan: `business/openclaw-debugger/README.md`
- Agent prompt: `business/openclaw-debugger/AGENT-PROMPT.md`
- Outreach templates: `business/openclaw-debugger/OUTREACH-TEMPLATES.md`

**Logs:**
- All activity: `logs/debugger-*.log`
- Daily reports: `memory/YYYY-MM-DD.md`

---

*Your OpenClaw debugger business is now running on autopilot. 4 shifts/day. 2 hours of proactive work. Let's get to $5K/month.* 🚀
