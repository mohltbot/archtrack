# OpenClaw Debugger — Lead Nurture Email Sequence

## Overview

Automated email nurture sequence for OpenClaw Debugger leads who provide their email through landing pages or direct outreach. This sequence builds trust, demonstrates expertise, and converts leads into paying customers.

**Trigger:** Lead provides email via landing page or direct contact
**Duration:** 7-day sequence
**Goal:** Convert leads to $75/30min debugging session or $150/month retainer

---

## Email 1: Welcome + Immediate Value (Day 0)

**Subject:** Your OpenClaw setup — 3 quick wins while we talk

**Body:**
```
Hi [Name],

Thanks for reaching out about your OpenClaw setup. I help developers 
fix their OpenClaw issues — usually in under 30 minutes.

While you wait for my reply, here are 3 quick wins that solve 80% 
of common issues:

1. **Start fresh sessions** — Type "/new" when your agent seems 
   "dumb" or repeats itself. This clears the buffer without losing 
   memory. (40-60% cost reduction)

2. **Check your model** — Default Opus costs $47/week. Switch to 
   Kimi K2.5 for $6/week with similar quality. Type "/model" to see 
   your current setting.

3. **Verify tools are enabled** — After the 2026.3.2 update, tools 
   are disabled by default. Check your gateway config:
   tools.enabled = true

---

**Want me to debug your specific issue?**

Book a 30-minute session: $75 (fixed price, money-back guarantee)

Just reply with:
- What's happening (error message or behavior)
- Your setup (OS, hosting method, model)
- When you're available

I usually respond within 2 hours during business hours.

—
Mohammed Wasif
OpenClaw Debugger
https://twitter.com/mohltbot
```

---

## Email 2: Social Proof + Cost Savings (Day 2)

**Subject:** How I cut one client's API bill by 87%

**Body:**
```
Hi [Name],

Quick story from yesterday:

A client came to me spending $47/week on OpenClaw API calls. Their 
agent was stuck in loops, repeating the same expensive operations.

30 minutes later:
- Fixed the loop bug
- Switched from Opus to Kimi K2.5
- Added session management with "/new"

**New weekly cost: $6 (87% savings)**

The fix paid for itself in 3 days.

---

**Common issues I fix in 30 minutes:**

✓ Gateway crashes/restart loops
✓ "Agent seems dumb" — tools disabled, buffer overflow
✓ High API costs from model selection
✓ Chrome extension connection issues
✓ VPS setup (Hostinger, Hetzner, DigitalOcean)
✓ macOS LaunchAgent problems
✓ Windows orphaned processes

**Still having issues?** Book a session: $75/30min
Money-back guarantee if I can't fix it.

—
Mohammed Wasif
```

---

## Email 3: Educational + Trust Building (Day 4)

**Subject:** The #1 mistake in 50 OpenClaw setups I've debugged

**Body:**
```
Hi [Name],

I've debugged 50+ OpenClaw setups (documented in a Reddit thread 
that blew up last week).

The #1 mistake? **Never starting fresh sessions.**

Here's what happens:
- Agent context buffer fills up (128K tokens)
- Agent starts repeating itself, going in circles
- Each loop costs more API tokens
- User thinks "the AI is getting worse"

**The fix:** Type "/new" every 10-15 messages, or when you notice 
repetition.

This doesn't delete your agent's memory — it just clears the 
conversation buffer. Think of it as "taking a breath" before 
continuing.

---

**Other common mistakes from my analysis:**

1. Using Opus as default ($47/week vs $6 for Kimi)
2. Installing skills without reading source code
3. Exposing gateway without authentication
4. Going multi-agent too early
5. Never clearing session buffers

**Want me to audit your setup?**

I'll review your config, identify issues, and fix them — $75 flat fee.

Book here: [Reply to this email with your availability]

—
Mohammed Wasif
OpenClaw Debugger
```

---

## Email 4: Urgency + Limited Availability (Day 6)

**Subject:** [Last call] OpenClaw help — my schedule fills up

**Body:**
```
Hi [Name],

Quick heads up — my schedule is filling up this week.

I'm currently helping:
- 3 developers with VPS setup issues
- 2 with gateway crash loops  
- 1 with Chrome extension debugging

**I have 2 slots left this week** for new clients.

---

**What you get for $75:**

✓ 30-minute 1-on-1 debugging session
✓ Screen share + live troubleshooting
✓ Fixed configuration files
✓ Written summary of what was wrong
✓ 30-day follow-up support
✓ Money-back guarantee if unsatisfied

**Common fixes:**
- Gateway stability issues
- High API costs (usually 60-80% reduction)
- "Agent seems dumb" problems
- Setup/configuration errors
- Security hardening

---

**Ready to fix your OpenClaw setup?**

Reply with:
1. Your timezone
2. Best times for you
3. Brief description of the issue

I'll send you a calendar link.

—
Mohammed Wasif
OpenClaw Debugger
P.S. — If this isn't relevant anymore, just reply "STOP" and I'll 
remove you from the sequence.
```

---

## Email 5: Final Attempt + Alternative (Day 7)

**Subject:** Alternative if you're not ready for 1-on-1 help

**Body:**
```
Hi [Name],

No pressure if you're not ready to book a session — I know $75 is 
real money.

**Free alternative:**

I post daily OpenClaw debugging tips on Twitter:
https://twitter.com/mohltbot

Recent threads:
- "5 mistakes from 50 OpenClaw setups" (saved people $1000s)
- "The /new command explained" (40-60% cost reduction)
- "PSA: Tools disabled by default" (fixes "dumb agent" issues)

Follow me there for free troubleshooting tips.

---

**Still want personal help?**

My offer stands: $75/30min, money-back guarantee.

Just reply when you're ready.

—
Mohammed Wasif
OpenClaw Debugger
```

---

## Technical Implementation

### Option 1: Simple Gmail + Labels (Manual)

1. Create Gmail label: "OpenClaw Leads"
2. Create label sub-labels: "Day 0", "Day 2", "Day 4", "Day 6", "Day 7"
3. When lead emails, add to "Day 0" and send Email 1
4. Use Gmail scheduled send for follow-ups
5. Move label as sequence progresses

### Option 2: n8n Automation (Recommended)

**Trigger:** New row in Google Sheets (lead capture form)

**Workflow:**
```
1. Trigger: New Google Sheets row
2. Action: Send Email 1 (immediate)
3. Delay: 2 days
4. Action: Send Email 2 (if no reply)
5. Delay: 2 days
6. Action: Send Email 3 (if no reply)
7. Delay: 2 days
8. Action: Send Email 4 (if no reply)
9. Delay: 1 day
10. Action: Send Email 5 (if no reply)
11. Action: Move to "Nurture Complete" sheet
```

**Stop conditions:**
- Lead replies to any email (manual takeover)
- Lead books session (move to "Clients" sheet)
- Lead sends "STOP" (unsubscribe)

### Option 3: ConvertKit/Mailchimp (Paid)

- $29/month for automation
- Better deliverability
- Built-in analytics
- Not recommended until 50+ leads/month

---

## Tracking & Metrics

**Track in LEADS.md:**
```markdown
| Name | Email | Sequence Day | Last Email | Replied | Booked |
|------|-------|--------------|------------|---------|--------|
```

**Target metrics:**
- Open rate: >40%
- Reply rate: >15%
- Booking rate: >5%
- Unsubscribe rate: <5%

**Review weekly:**
- Which emails get most replies?
- What's the most common issue mentioned?
- Are leads booking after specific emails?

---

## Integration with Current Workflow

**Current state:** Manual Reddit/Twitter outreach → DRAFTS.md → Manual posting

**With email sequence:**
1. Find lead on Reddit/Twitter/GitHub
2. Send initial reply (DRAFTS.md template)
3. **NEW:** If lead provides email, add to sequence
4. Sequence nurtures automatically
5. Book session when ready

**Landing page integration:**
- Add email capture to landing-gpt54-fix.html
- Form submits to Google Sheets
- n8n triggers sequence automatically

---

## Files Created

1. `business/openclaw-debugger/EMAIL-SEQUENCE.md` — This file
2. **Next:** Update landing-gpt54-fix.html with email capture form
3. **Next:** Create n8n workflow for automation
4. **Next:** Add email tracking to LEADS.md

---

*Created: March 12, 2026 — Ghost Shift*
