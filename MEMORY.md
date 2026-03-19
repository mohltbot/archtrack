# MEMORY.md - Long-Term Memory

_This file contains curated long-term memories, lessons learned, and important context that persists across sessions._

---

## About Your Human

**Name:** Mohammed (wasifmo2)
**What to call them:** Mohammed
**Communication style:** Direct, expects quick answers, values honesty about limitations
**Work style:** Entrepreneurial, multiple projects, values automation and efficiency

### Key Projects

1. **OpenClaw Debugger** - Lead generation business helping OpenClaw users
   - Tracks leads from Reddit, GitHub, Discord
   - Revenue model: $75 avg per lead, target $1,800/month
   - Hot leads need DM within 24 hours

2. **ArchTrack** - Employee monitoring dashboard for uncle's architecture firm
   - 3 employees: Ahmed ($65/hr), Mohammed ($75/hr), Sarah ($85/hr)
   - 3 projects: $1.55M total portfolio value
   - Deployed via DigitalOcean on Mac mini
   - Status: Ready to ship after mobile fixes

3. **Voice Bridge** - Twilio phone system for calling AI while running
   - Phone number: (940) 283-5926
   - Status: WebSocket auth issues, needs OpenAI key
   - Cost: ~$6-10/month

### Preferences

- **Budget conscious:** $200/month AI budget, currently at ~$6
- **Values testing:** "Test repeatedly and thoroughly"
- **Direct feedback:** Prefers honest "not ready" over false confidence
- **Mobile-first:** Everything must work on phone
- **Risk tolerance:** Willing to try deposit model for client projects

### Recent Context

**March 19, 2026:**
- First Twitter thread with engagement: OpenClaw 2026.3.13 skills issue — 1 like, 1 comment, 3 impressions. Topic: timely pain points work. dnu (@DnuLkjkjh) engaged with technical feedback — potential lead
- Content insight: Technical how-to threads on breaking changes get engagement

**March 18, 2026:**
- vmkkumar lead: TIMELINE BLOCKER — Wants to build a voice + text AI customer service agent to sell to other businesses. High engagement (cross-platform), requested pricing, budget constraint with follow-up intent → Staying WARM
- Lead pipeline: 9 hot, 11 warm, 5 cold leads

**March 16, 2026:**
- vmkkumar lead: Asked for pricing on custom build (HOT - $2K-10K potential)
- ArchTrack: Fixed mobile layout, loading states, WebSocket resilience
- Lead pipeline: 9 hot, 11 warm, 5 cold leads

**March 14, 2026:**
- Merged Ben's Bites PR: visualization skills, build loop pattern
- Tested all 4 features on real projects
- Fixed ArchTrack action items

### Important Decisions

1. **Don't ship ArchTrack to uncle until deployment architecture fixed** - Done ✅
2. **Use deposit model for custom builds** - Reduces risk for both parties
3. **Mac mini must stay on 24/7** for ArchTrack to work
4. **Render deployment failed** - Using DigitalOcean instead

### Lessons Learned

- Always check deployment architecture before saying "ready to ship"
- Test on actual mobile devices, not just dev tools
- WebSocket auth needs proper challenge/response handling
- GitHub push protection blocks commits with secrets
- **Formatting preference:** Mohammed liked the drafts.md formatting on first attempt (March 19) — no reformatting needed
- **Git workflow for DRAFTS.md updates:** When Mohammed says "truncate posted drafts" or "update drafts":
  1. Edit the local file directly (workspace copy)
  2. `git checkout main && git pull origin main` (ensure on latest main)
  3. Re-apply the edit to the file
  4. `git add business/openclaw-debugger/DRAFTS.md`
  5. `git commit -m "message"`
  6. `git push origin main`
  7. Do NOT use feature branches or force push — causes divergence issues
  8. Verify with raw GitHub URL if needed: `https://raw.githubusercontent.com/mohltbot/mission-control/main/business/openclaw-debugger/DRAFTS.md`

### Lead Outreach Status

**March 19, 2026:**
- All outreach posted except GitHub DMs
- GitHub DMs blocked — followed users instead (hoping this enables future DM capability)

### Running Tasks

- [ ] Follow up with vmkkumar on pricing
- [ ] Complete voice bridge setup (needs OpenAI key)
- [ ] Monitor ArchTrack deployment
- [ ] Process hot leads (8 remaining)

### Tools & Resources

- **GitHub:** mohltbot/mission-control
- **ArchTrack URL:** http://165.227.78.107/
- **Budget:** $5.94 / $200 used this month
- **Workspace:** /Users/mohlt/.openclaw/workspace

---

_Last updated: March 19, 2026_
