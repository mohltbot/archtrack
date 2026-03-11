# DRAFTS — OpenClaw Debugger

**Last Updated:** March 11, 2026 — 9:59 AM PST

---

## 🚀 READY TO POST (March 11, 2026)

**Post these today. Copy-paste ready.**

---

### 📝 Twitter Thread: "5 OpenClaw Config Mistakes That Cost You Hours"
**Status:** Ready to post | **Platform:** Twitter

**Tweet 1 (Hook):**
I spent 6 hours debugging an "impossible" OpenClaw crash. Turns out it was a 30-second config fix.

Here are 5 OpenClaw config mistakes that cost you hours (and how to avoid them):

**Tweet 2:**
Mistake #1: Not backing up config before updates

OpenClaw updates can subtly corrupt your config.

Fix: Backup before every update
→ cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup-$(date +%Y%m%d)

Takes 5 seconds. Saves hours.

**Tweet 3:**
Mistake #2: Binding to 127.0.0.1 on VPS

If you're on Zeabur, Railway, or any VPS:
Binding to 127.0.0.1 = startup probe fails = crash loop

Fix: Use 0.0.0.0 or lan mode
→ gateway.bind: "0.0.0.0:8080"

**Tweet 4:**
Mistake #3: Forgetting memoryFlush

By default, OpenClaw memory fills up and loses context. Your agent slowly gets dumber and dumber.

Fix: Enable memoryFlush in config
→ memoryFlush: { enabled: true, interval: "1h" }

**Tweet 5:**
Mistake #4: Wrong auth token format

Old: gateway.token
New: gateway.auth.token

Using the old format = "pairing required" errors forever

Fix: Update your config keys after v2026.2+

**Tweet 6 (CTA):**
Mistake #5: Not using openclaw doctor

Before you spend hours debugging:
→ openclaw doctor --fix

It catches 80% of common issues automatically.

---

Still stuck? I debug OpenClaw configs for $75 in 30 min. DM me or check my profile.

---

### 📝 Quick Tip: "The 30-Second Config Backup"
**Status:** Ready to post | **Platform:** Twitter

The 30-second habit that saves hours of OpenClaw debugging:

Before every update, run:
→ cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup-$(date +%Y%m%d)

When something breaks:
→ cp ~/.openclaw/openclaw.json.backup-* ~/.openclaw/openclaw.json

Prevention > debugging.

---

### 📝 Reddit Reply: Device Token Rotation
**Status:** Ready to post | **Target:** r/openclaw "I'm begging here" posts
**Link:** https://reddit.com/r/openclaw

That "rotate/reissue device token" error is frustrating — I've been there.

Quick fix:
1. Stop the gateway: openclaw gateway stop
2. Clear old tokens: rm ~/.openclaw/token.json
3. Re-pair: openclaw pairing list --channel <your-channel>
4. Follow the pairing flow in your TUI

If you're using a custom channel (not Discord), make sure your channel auth is configured correctly in the config.

If you're still stuck after this, happy to jump on a quick call and debug it together — most auth issues take 15 min to fix once you know what to look for.

---

### 📝 GitHub Comment: Model Migration Issue
**Status:** Ready to post | **Target:** GitHub Issue #17876
**Link:** https://github.com/openclaw/openclaw/issues/17876

Great feature request! The "switch primary model and pray" workflow is painful.

In the meantime, here's a safer manual approach:

1. Test the new model in a sub-agent first
2. Run your test suite through the sub-agent
3. Only then update your primary model
4. Keep the old model as fallback for 24h

This has saved me from multiple "oops, everything broke" moments.

Would love to see this as a built-in `openclaw models test` command!

---

## 📅 TOMORROW (March 12, 2026)

**Day 2 follow-ups for March 10 leads**

---

### 📝 Day 2 Follow-up: u/HostingerNightmare
**Status:** Send March 12 | **Target:** Reddit DM
**Link:** https://reddit.com/r/openclaw/comments/1rja32v

Hey! Just checking in — did those quick fixes help get your Hostinger setup sorted?

The Chrome Extension workaround and agent path fixes usually resolve the main issues.

If you're still stuck on anything, happy to jump on a quick screen share and get you running. Most Hostinger + OpenClaw setups take 20-30 min to fix once we know what to look for.

No pressure either way — just want to make sure you're not still banging your head against the wall!

---

### 📝 Day 2 Follow-up: GitHub #41804
**Status:** Send March 12 | **Target:** GitHub issue
**Link:** https://github.com/openclaw/openclaw/issues/41804

Hey, did the PowerShell workaround help with the orphaned processes?

If you're still seeing the port conflict after using the taskkill script, there might be another process holding onto 18789.

You can check with: netstat -ano | findstr :18789

Then cross-reference the PID with Task Manager.

Also, if this is happening frequently, I can share the PowerShell wrapper I mentioned that handles this automatically — just let me know.

Happy to debug further if needed.

---

### 📝 Day 2 Follow-up: GitHub #40931
**Status:** Send March 12 | **Target:** GitHub issue
**Link:** https://github.com/openclaw/openclaw/issues/40931

Hey, did the plugin ID fix resolve the gateway responsiveness issue?

The feishu -> "feishu-openclaw-plugin" mismatch and the mem9 async registration are the two most common culprits.

If you're still having to run `doctor --fix` repeatedly, there might be something else overwriting your config.

Check if you have:
- Any automated backup tools touching ~/.openclaw/
- Multiple OpenClaw installations (Homebrew + npm)
- A startup script that's restoring old configs

Let me know what you find — happy to help trace this down.

---

### 📝 Day 2 Follow-up: Umbrel Forums
**Status:** Send March 12 | **Target:** Umbrel forum
**Link:** https://community.umbrel.com/t/openclaw-restart-issue/24870

Hey, just following up — were you able to get the gateway running again?

The `umbrel app restart openclaw` command usually does the trick for that flickering "please wait" screen.

If you're still seeing issues, posting the output of `openclaw gateway status --deep` would help diagnose what's going on.

Happy to help further if needed!

---

## ✅ ALREADY POSTED (March 9-10, 2026)

**Move this section to bottom going forward**

---

### March 9, 2026 — All Posted

**Reddit Replies:**
- u/AI_Agents_frustrated — https://reddit.com/r/AI_Agents/comments/1r70lq9
- u/hetzner_installer — https://reddit.com/r/hetzner/comments/1rdt9cu
- u/gateway_errors — https://reddit.com/r/openclaw/comments/1rgeozb
- u/buildinpublic_watchdog — https://reddit.com/r/buildinpublic/comments/1rana79/

**GitHub Comments:**
- #39476 — https://github.com/openclaw/openclaw/issues/39476
- #40932 — https://github.com/openclaw/openclaw/issues/40932

**Day 7 Follow-ups (all sent):**
- @rstormsf — https://x.com/rstormsf
- @matthewjetthall — https://x.com/matthewjetthall
- @StMichaelsForge — https://x.com/StMichaelsForge
- @Franzferdinan57 — https://x.com/Franzferdinan57
- @Shpigford — https://x.com/Shpigford

**Content Posted:**
- Twitter: "5 OpenClaw Rate Limit Mistakes"
- Twitter: Hetzner + OpenClaw Setup tip
- Twitter: "The 6 Mac Resets Story"
- Twitter: "OpenClaw Doctor" tip
- Twitter: "From $30 Errors to $5/Month" case study

---

### March 10, 2026 — All Posted

**Reddit Replies:**
- u/HostingerNightmare — https://reddit.com/r/openclaw/comments/1rja32v

**GitHub Comments:**
- #41804 — https://github.com/openclaw/openclaw/issues/41804
- #40931 — https://github.com/openclaw/openclaw/issues/40931
- #40812 — https://github.com/openclaw/openclaw/issues/40812
- #41144 — https://github.com/openclaw/openclaw/issues/41144

**Forum Replies:**
- Umbrel restart issue — https://community.umbrel.com/t/openclaw-restart-issue/24870

**Content Posted:**
- Twitter: "The macOS LaunchAgent Bug That Breaks Everything"
- Twitter: "Why Your OpenClaw Gateway Keeps Dying on macOS"
- GitHub: #41715 task-based model routing

---

## 🚫 REMOVED PLATFORMS

- LinkedIn (per user request)
- IndieHackers (per user request)

**Active platforms:** Reddit, GitHub, Twitter only

---

## 📊 NOTES

**Format going forward:**
1. READY TO POST (today's content at top)
2. TOMORROW (scheduled content)
3. ALREADY POSTED (archive at bottom)

**Link format:** All links are clickable (not in code blocks)
