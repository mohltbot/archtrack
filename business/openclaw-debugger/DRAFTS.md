# Ready-to-Send Drafts — OpenClaw Debugger

**Last Updated:** 2026-03-05

---

## ✅ PUBLISHED (March 5, 2026)

### Twitter Thread: "5 OpenClaw Errors That Waste Hours"
**Status:** ✅ Posted  
**URL:** https://x.com/i/status/2029821780068909216  
**Date:** March 5, 2026  
**Platform:** Twitter/X  

**Content Summary:**
- Tweet 1: Hook — 20+ hours debugging, 5 errors that waste time
- Tweet 2: Model routing conflicts (40% of issues)
- Tweet 3: Auth profile mismatches (25% of issues)
- Tweet 4: JSON schema validation (15% of issues)
- Tweet 5: Gateway port conflicts (10% of issues)
- Tweet 6: Skill dependency issues (10% of issues)
- Tweet 7: CTA — $75 debugging service, DM for help

**Performance:** _To be tracked in LEADS.md_

---

### Twitter Thread: "Sandbox Mode Broke My OpenClaw"
**Status:** ✅ Posted  
**Author:** @Mohammed__Wasif  
**Date:** March 5, 2026  
**Platform:** Twitter/X  
**Views:** 11 (as of posting)

**Thread Summary:**
- **Tweet 1:** OpenClaw warned about browser-use sandbox being off → told it to fix → sandbox ON → instantly broke
- **Tweet 2:** Root cause: Docker not installed on Mac, agent crashed on boot
- **Tweet 3:** Framework panicked, failed over to every other model, spat out errors for DeepSeek, Minimax, even LOCAL MLX model demanding API keys
- **Tweet 4:** Thought he'd need dummy API keys, started hunting config files
- **Tweet 5:** .openclaw is hidden folder (Cmd+Shift+. to see it)
- **Tweet 6:** Realized API key errors were red herrings — system was panic-failing
- **Tweet 7:** Found sandbox setting on line 209: `"mode": "all"` → changed to `"off"`
- **Tweet 8:** Primary model booted perfectly. 3-letter JSON edit saved the day

**Key Lesson:** Sandbox mode requires Docker. Without it, the cascade failover creates misleading API key errors.

**Performance:** _To be tracked in LEADS.md_

---

### Twitter Thread: "Chrome Extension Hidden Folder Fix"
**Status:** ✅ Posted  
**Author:** @Mohammed__Wasif  
**Date:** March 4, 2026  
**Platform:** Twitter/X  
**Views:** 29 (as of posting)

**Thread Summary:**
- **Tweet 1:** Anyone else unable to find ~/.openclaw/browser/chrome-extension? (especially Mac Mini users coming from Windows)
- **Tweet 2:** Run `openclaw browser extension install` if you haven't already
- **Tweet 3:** Follow steps until "Load unpacked" → select: ~/.openclaw/browser/chrome-extension
- **Tweet 4:** Run `openclaw browser extension path`
- **Tweet 5:** Finder won't show the path — folder is hidden
- **Tweet 6:** Hit Command + Shift + G, paste the path
- **Tweet 7:** Your welcome

**Key Lesson:** Hidden folders (.) don't show in Finder by default. Cmd+Shift+G is the bypass.

**Performance:** _To be tracked in LEADS.md_

---

## 📝 CONTENT IDEAS (Drafted)

### 1. Quick Tip: Config Validation
**Platform:** Twitter  
**Status:** ✅ Drafted (NOT posted — still in queue)  
**Hook:** "This one config line prevents 80% of OpenClaw crashes"

### 2. Case Study: Reddit Fix
**Platform:** Twitter + IndieHackers  
**Status:** ✅ Drafted  
**Hook:** "maxTokens: expected number, received string — here's the 30-second fix"

### 3. Thread: Docker vs Node Versions
**Platform:** Twitter  
**Status:** ✅ Drafted  
**Hook:** "14 hours debugging OpenClaw. Fixed in 5 minutes with this one change."

### 4. Thread — "5 OpenClaw v2026.2.26 Migration Issues"
**Platform:** Twitter  
**Status:** ✅ Ready to post  
**Hook:** "Upgraded to OpenClaw v2026.2.26? Your config is probably broken. Here's why:"
**Source:** GitHub issues #29780, #30401, #32176  
**Priority:** HIGH — trending issue

### 5. Quick Tip — "Is your Discord bot deaf?"
**Platform:** Twitter  
**Status:** ✅ Ready to post  
**Hook:** "Discord bot shows online but doesn't respond? Check these 3 intents:"
**Source:** GitHub issue #32176

### 6. Case Study — "Fixed Hostinger + OpenClaw in 30 min"
**Platform:** Twitter + IndieHackers  
**Status:** ✅ Ready to post  
**Hook:** "Non-dev user was ready to give up on OpenClaw. 3 commands later: working."
**Source:** Reddit post u/HostingerNightmare

### 7. LinkedIn Post — Professional Debugging Service
**Platform:** LinkedIn  
**Status:** ✅ Ready to post  
**Hook:** Professional angle on OpenClaw debugging services

---

## 📊 Published (Track Performance)

| Date | Platform | Content | Impressions | Engagements | Leads Generated |
|------|----------|---------|-------------|-------------|-----------------|
| 2026-03-05 | Twitter | Thread: 5 OpenClaw Errors | POSTED | — | — |
| 2026-03-05 | Twitter | Thread: 5 v2026.2.26 issues | SCHEDULED | — | — |
| 2026-03-05 | IndieHackers | Case study: Hostinger fix | SCHEDULED | — | — |
| 2026-03-05 | LinkedIn | Debugging service | SCHEDULED | — | — |
| 2026-03-05 | Twitter | Quick tip: Discord bot deaf | SCHEDULED | — | — |

---

## 🗓️ Content Calendar (This Week)

### Thursday (March 6)
- [ ] Post Twitter: Week recap so far
- [ ] Post IndieHackers: "Week 1 building in public"
- [ ] Post Quick tip: openclaw doctor --fix
- [ ] Discord: Help 3 people in #troubleshooting

### Friday (March 7)
- [ ] Twitter: Week lessons learned
- [ ] LinkedIn: First week retrospective
- [ ] Update LEADS.md with week's progress
- [ ] Plan Week 2 content themes

---

## 🎯 Content Goals

**This Week:**
- 5 Twitter threads/tips
- 2 IndieHackers posts
- 1 LinkedIn post
- Daily engagement (replies, likes, follows)

**Metrics to Track:**
- Impressions per post
- Profile visits
- DMs received
- Leads generated

---

## 📋 OUTREACH TEMPLATES (Moved from completed drafts)

### Reddit Reply: u/HostingerNightmare
**Post:** https://www.reddit.com/r/openclaw/comments/1rja32v/  
**Status:** ✅ SENT (March 4)  
**Template:** Hostinger VPS + Chrome Extension + agent path fixes

### GitHub Comment: Issue #32176 (Discord Bot Deaf)
**Issue:** https://github.com/openclaw/openclaw/issues/32176  
**Status:** ✅ SENT (March 4)  
**Template:** Discord gateway intent handshake diagnostic steps

### DM: @rstormsf (High-Value Target)
**Profile:** https://x.com/rstormsf  
**Status:** ✅ SENT (March 4)  
**Template:** Monitoring service pitch ($300/month)

### DM: @matthewjetthall
**Profile:** https://x.com/matthewjetthall  
**Status:** ✅ SENT (March 4)  
**Template:** Docker fix + free config review offer

---

*All completed drafts moved to archive. Active drafts only above.*
