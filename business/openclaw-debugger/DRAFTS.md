# OpenClaw Debugger - Post Drafts (Copy-Paste Ready)

**Last Updated:** March 26, 2026

---

## 🚀 READY TO POST (Start Here)

---

## 📝 CONTENT DRAFTS (Ready to Post)

### Twitter Thread 13: 2026.3.23-2 Approval System Infinite Loop Bug

**Status:** ✅ Ready to post
**Platform:** Twitter/X
**Topic:** Critical approval system bug in 2026.3.23-2 — trending today, burns API tokens
**Link:** https://twitter.com/compose/tweet

**COPY AND PASTE (one tweet at a time):**

Tweet 1:
```
🚨 CRITICAL BUG: OpenClaw 2026.3.23-2

If you're on the latest version, your approval system might be stuck in an infinite loop — burning API tokens with every iteration.

One user reported 13+ approval loops for a single command.

Here's what's happening and how to stop the bleeding:

🧵
```

Tweet 2:
```
The Problem:

Fresh install of 2026.3.23-2 has a broken approval queue:
• You approve a command (allow-once or allow-always)
• Command executes ✅
• Approval request stays in queue ❌
• System retries same command endlessly 🔁

Each retry = more API calls = more $$$
```

Tweet 3:
```
Who's Affected:

• Anyone who installed/updated to 2026.3.23-2 (March 24, 2026)
• Users with safeBins configured (any command requiring approval)
• Both new installs AND updates

If you're not sure: check your gateway logs for repeated "approval requested" messages.
```

Tweet 4:
```
Immediate Workaround #1: Disable Approvals

If you trust your environment, temporarily disable approvals:

    {
      "gateway": {
        "safeBins": []
      }
    }

⚠️ Only do this if you understand the security implications.
```

Tweet 5:
```
Immediate Workaround #2: Clear the Cache

Stop the bleeding manually:

    openclaw gateway stop
    rm -rf ~/.openclaw/cache/approvals/
    openclaw gateway start

This clears the stuck approval queue. You'll need to do this every time it happens.
```

Tweet 6:
```
Immediate Workaround #3: Downgrade

The safest option — go back to 2026.3.23-1:

    npm install -g openclaw@2026.3.23-1

Approvals work correctly in this version.
```

Tweet 7:
```
The Root Cause:

The approval queue isn't being cleared after successful execution in 2026.3.23-2.

This is a regression — the same config worked fine in previous versions.
```

Tweet 8:
```
When Will This Be Fixed?

No ETA yet from the core team. Track issue #54533 for updates.

Given that this actively burns user money (API tokens), expect a hotfix soon.
```

Tweet 9:
```
How to Check If You're Affected:

Run this and watch your logs:

    tail -f ~/.openclaw/logs/gateway.log | grep -i "approval"

If you see the same command requesting approval multiple times, you're in the loop.
```

Tweet 10:
```
Need Help Now?

If your production setup is burning tokens and you need immediate help:

I debug OpenClaw issues regularly — $75 for 30 min, usually resolved in 15.

DM me or check my GitHub: @mohlt
```

Tweet 11:
```
Follow for more OpenClaw debugging tips

I track every critical bug, regression, and workaround so you don't have to.

Stay on 2026.3.23-1 until this is fixed.

/end
```

---

## ✅ ALREADY POSTED (Archive)

### Twitter Threads 1-12 [ALL POSTED Mar 17-26]
*(Content archived - see LEADS.md for status)*

### Case Studies 1-4 [POSTED Mar 17-24]
*(Content archived - see LEADS.md for status)*

### Community Replies 1-30 [ALL POSTED Mar 17-26]
*(Content archived - see LEADS.md for status)*

### Reddit DMs 1-5 [POSTED Mar 17-25]
*(Content archived - see LEADS.md for status)*

### GitHub DM Reaches (DMs 1-31) [POSTED Mar 17-26]
*(Content archived - see LEADS.md for status)*

---
*End of DRAFTS.md*
