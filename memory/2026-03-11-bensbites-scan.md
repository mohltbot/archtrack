# Ben's Bites Scan - March 10, 2026
**Issue:** "Just use GPT-5.4 xhigh"  
**Scan Date:** 2026-03-11  
**Status:** Complete

---

## Executive Summary

This issue is **exceptionally dense** with tools for the 1-person unicorn mission. Major themes:
- **Agent infrastructure maturing** - sandboxes, runtimes, billing systems for agents
- **Code review automation** - multiple tools for AI-powered PR reviews
- **Agent scheduling & persistence** - Claude Code /loop, scheduled tasks
- **OpenClaw ecosystem mention** - PinchBench benchmarking OpenClaw setups!

**Total Tools Found:** 35+  
**HIGH Priority:** 8  
**MEDIUM Priority:** 12  
**LOW Priority:** 15+

---

## 🔥 HIGH Priority (Immediate Action Required)

### 1. Cursor Automations ⭐⭐⭐ TOP PRIORITY
**What:** Build always-on agents that run on schedules or events (Slack triggers)  
**URL:** https://cursor.com/blog/automations  
**Why HIGH:**
- Directly replaces/supplements Ghost-Shift
- Event-driven architecture (Slack → Agent)
- Schedule-based execution (cron alternative)
- Cursor is already a proven IDE

**Action:** Research Cursor Automations API for Mission Control integration
**Cost:** Likely included with Cursor Pro ($20/mo)
**Duplicate Check:** ❌ NEW - Not previously registered

---

### 2. Claude Code /loop + Scheduled Tasks ⭐⭐⭐ CRITICAL
**What:** Schedule recurring tasks in Claude Code (up to 3 days), desktop task scheduling  
**URL:** https://x.com/bcherny/status/2030193932404150413  
**Why HIGH:**
- We use Claude Code extensively
- Native scheduling reduces external cron dependencies
- Desktop task execution while computer awake
- Could simplify Ghost-Shift architecture

**Action:** Test /loop feature and scheduled tasks for nightly automation
**Cost:** Free (Claude Code included)
**Duplicate Check:** ❌ NEW - Not previously registered

---

### 3. 21st Agents / Terminal Use ⭐⭐⭐ INFRASTRUCTURE
**What:** Infra for adding agents to your app—runtime, sandboxing, billing, UI, streaming  
**URL:** https://21st.dev/agents  
**Alt:** https://agent-safehouse.dev/ (YC W26, very similar)  
**Why HIGH:**
- Complete agent infrastructure (billing = monetization path)
- Sandboxing = security for user-facing agents
- UI components for agent interfaces
- YC-backed (Terminal Use)

**Action:** Evaluate for Mission Control agent marketplace/hosting
**Cost:** TBD (likely usage-based)
**Duplicate Check:** ❌ NEW - Not previously registered

---

### 4. Air by JetBrains ⭐⭐ AGENTIC IDE
**What:** Agentic dev environment built for working with agents from different vendors  
**URL:** https://air.dev/  
**Why HIGH:**
- JetBrains = proven IDE company
- Multi-vendor agent support (not locked to one AI)
- Built for agent workflows from ground up

**Action:** Compare with Cursor + Claude Code setup
**Cost:** Likely subscription-based
**Duplicate Check:** ❌ NEW - Not previously registered

---

### 5. Copilot Cowork ⭐⭐ MICROSOFT ENTRY
**What:** Handoff tasks to agents across Microsoft 365 apps  
**URL:** https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/copilot-cowork-a-new-way-of-getting-work-done/  
**Why HIGH:**
- Microsoft 365 integration (Excel, Word, Teams)
- Enterprise adoption path
- Cross-app agent workflows

**Action:** Monitor for API access/integration opportunities
**Cost:** Part of Microsoft 365 Copilot
**Duplicate Check:** ❌ NEW - Not previously registered

---

### 6. Code Review Tools (3 options) ⭐⭐ QUALITY ASSURANCE
**What:** AI-powered PR review agents

| Tool | URL | Differentiator |
|------|-----|----------------|
| Warden by Sentry | https://warden.sentry.dev/ | Skills to review every PR |
| Vet by Imbue | http://imbue.com/product/vet/ | Fast, local, verifies agent followed instructions |
| OpenReview | https://github.com/vercel-labs/openreview | Open-source, self-hosted, Vercel AI Cloud |

**Why HIGH:**
- Mission Control needs code review automation
- Self-hosted option (OpenReview) fits budget constraints
- Vet's "verify agent followed instructions" is unique

**Action:** Deploy OpenReview for Mission Control PRs
**Cost:** OpenReview = free (self-hosted), others = TBD
**Duplicate Check:** ❌ NEW - Not previously registered

---

### 7. T3 Code ⭐ DESKTOP CODEX
**What:** Desktop app for Codex CLI (alternative to Codex app)  
**URL:** https://github.com/pingdotgg/t3code  
**Why HIGH:**
- Alternative to Claude Code
- Desktop app (better UX than CLI)
- Still early (alpha) but smooth

**Action:** Test as Claude Code alternative/fallback
**Cost:** Free (open source)
**Duplicate Check:** ❌ NEW - Not previously registered

---

### 8. Karpathy's autoresearch ⭐ RESEARCH AUTOMATION
**What:** Agents autonomously iterate on LLM training code  
**URL:** https://github.com/karpathy/autoresearch  
**Why HIGH:**
- 630 lines, single-GPU, open source
- Found 20 real improvements, 11% speedup in 2 days
- Pattern: agents coming up with ideas + implementing
- Applicable beyond ML (general research automation)

**Action:** Study for research task automation patterns
**Cost:** Free (open source)
**Duplicate Check:** ❌ NEW - Not previously registered

---

## ⚖️ MEDIUM Priority (Review & Evaluate)

### 9. Handles by here.now
**What:** Personalized sub-domains for everything you publish with your agent  
**URL:** https://x.com/adamludwin/status/2030016806434525612  
**Why MEDIUM:** Publishing infrastructure for agent outputs
**Cost:** TBD

### 10. Clawcard
**What:** Real inbox, phone number, credit card for agents (spend control)  
**URL:** https://www.clawcard.sh/  
**Why MEDIUM:** Budget control for agent spending - fits our $200/mo constraint
**Cost:** TBD

### 11. Agent Safehouse
**What:** macOS-native sandboxing for local agents  
**URL:** https://agent-safehouse.dev/  
**Why MEDIUM:** Security for local agent execution
**Cost:** TBD (YC W26)

### 12. Context Hub (Andrew Ng)
**What:** Open tool for coding agent API documentation  
**URL:** https://github.com/andrewyng/context-hub  
**Why MEDIUM:** Keeps agents up-to-date with APIs
**Cost:** Free (open source)

### 13. Flue by Astro
**What:** Framework for sandboxed AI agents and CI workflows  
**URL:** https://github.com/withastro/flue  
**Why MEDIUM:** Sandboxing + CI integration
**Cost:** Free (open source)

### 14. executor
**What:** Local-first execution environment for AI agents  
**URL:** https://github.com/RhysSullivan/executor  
**Why MEDIUM:** Local execution = privacy + cost control
**Cost:** Free (open source)

### 15. agent-coworker
**What:** Agent backend usable from terminal or desktop app  
**URL:** https://github.com/mweinbach/agent-coworker  
**Why MEDIUM:** Backend infrastructure for agents
**Cost:** Free (open source)

### 16. agent-kanban
**What:** VS Code extension - kanban board for coding agent tasks  
**URL:** https://github.com/appsoftwareltd/vscode-agent-kanban  
**Why MEDIUM:** Task management for agent workflows
**Cost:** Free (open source)

### 17. Fractals
**What:** Break down tasks into subtasks, let agents complete them  
**URL:** https://github.com/TinyAGI/fractals  
**Why MEDIUM:** Task decomposition for complex projects
**Cost:** Free (open source)

### 18. Uithub (now open-source)
**What:** Turn GitHub repos into LLM-ready context  
**URL:** https://github.com/janwilmake/uithub  
**Why MEDIUM:** Code context for agents
**Cost:** Free (open source)

### 19. shadcn/cli v4
**What:** Skills, presets, dry-run, monorepo support  
**URL:** https://x.com/shadcn/status/2029974151427989567  
**Why MEDIUM:** UI component management with agent-friendly features
**Cost:** Free

### 20. Notchi
**What:** Tamagotchi in your Mac notch - reacts to how you treat Claude  
**URL:** https://github.com/sk-ruban/notchi  
**Why MEDIUM:** Fun engagement tool, shows agent emotional state
**Cost:** Free (open source)

---

## 📝 LOW Priority (Log Only)

### Model & API News
- **GPT 5.4** (thinking + pro variants) - Better coding, vision, 1M context - $2.5/$15 per M tokens
- **Codex Security** - AI app security agent (free for Enterprise)
- **Codex for Open Source** - 6 months Pro for maintainers
- **OpenAI acquiring Promptfoo** - OSS AI security testing

### Enterprise Tools
- **Code Review by Claude** - $15-25 per PR review
- **Claude Marketplace** - Consolidate AI spending across vendors

### Research & Benchmarks
- **PinchBench** - Ranking models on OpenClaw setups! https://pinchbench.com/
- **KARL by Databricks** - Knowledge Agents via RL for document tasks
- **MultiGen** - Level design for generated multiplayer games

### News
- **AMI Labs** - Yann LeCun's $3.5B startup for world models
- **Anthropic suing DoD** - Supply chain risk designation dispute
- **OpenAI head of robotics resigned** - Caitlin Kalinowski over DOD contract concerns

### Other Tools
- **slacrawl** - Get Slack data locally https://github.com/vincentkoc/slacrawl
- **claude-replay** - Turn Claude Code sessions into HTML replays
- **Sidequest** - Fork convos to explore tangents
- **SwiftUI Agent Skill** - Write better SwiftUI code

---

## 💡 Key Insights

### 1. OpenClaw is Being Benchmarked! 📊
**PinchBench** is specifically ranking models based on "tasks completed successfully on an OpenClaw setup." This validates:
- OpenClaw is becoming a standard platform
- We should monitor PinchBench for best model choices
- Potential to contribute to OpenClaw benchmarking

### 2. Agent Infrastructure commoditizing
Multiple YC companies (Terminal Use, Agent Safehouse) + established players (21st.dev, JetBrains) building:
- Sandboxing
- Runtimes
- Billing systems
- UI components

**Implication:** Focus on WHAT agents do, not infrastructure

### 3. Code Review = New Battleground
3 different approaches (Sentry, Imbue, Vercel) all targeting AI code review. Market validating need.

### 4. Scheduling & Persistence maturing
Claude Code /loop + scheduled tasks means:
- Less need for external cron
- Agents can be truly persistent
- Ghost-Shift architecture may need updates

### 5. Multi-vendor agent environments
Air by JetBrains explicitly supports "agents from different vendors" - trend away from single-AI lock-in.

---

## Duplicate Check Results

| Tool | Previous Scan? | Status |
|------|----------------|--------|
| Cursor Automations | ❌ No | NEW |
| Claude Code /loop | ❌ No | NEW |
| 21st Agents | ❌ No | NEW |
| Air by JetBrains | ❌ No | NEW |
| Copilot Cowork | ❌ No | NEW |
| Code Review tools | ❌ No | NEW |
| T3 Code | ❌ No | NEW |
| autoresearch | ❌ No | NEW |
| Handles | ❌ No | NEW |
| Clawcard | ❌ No | NEW |
| Agent Safehouse | ❌ No | NEW |
| Context Hub | ❌ No | NEW |
| Flue | ❌ No | NEW |
| executor | ❌ No | NEW |
| agent-coworker | ❌ No | NEW |
| agent-kanban | ❌ No | NEW |
| Fractals | ❌ No | NEW |
| Uithub | ❌ No | NEW |
| shadcn/cli v4 | ❌ No | NEW |
| Notchi | ❌ No | NEW |

**Result:** All 20 tools are NEW - no duplicates found

---

## Calendar Conflict Check

**Hackathon Alert:**
- **Factory Hackathon** - Thursday (March 12, 2026)
- **Prize:** Mac Mini
- **Tokens:** 200M free
- **Conflict:** None identified (no existing events on March 12)

**No other event dates mentioned in newsletter**

---

## Budget Impact Analysis

| Priority | Tools | Est. Monthly Cost |
|----------|-------|-------------------|
| HIGH | 8 | $20-50 (mostly free/open source) |
| MEDIUM | 12 | $0 (all open source) |
| LOW | 15+ | $0 (news/research) |
| **TOTAL** | **35+** | **$20-50** |

**Current Budget:** $200/mo  
**Remaining after HIGH priority:** ~$150-180/mo  
**Status:** ✅ Well within budget

---

## Recommended Implementation Order

### Week 1 (Immediate)
1. **OpenReview** - Deploy self-hosted code review for Mission Control
2. **Claude Code /loop** - Test scheduled tasks for Ghost-Shift
3. **autoresearch** - Study patterns for research automation

### Week 2 (Evaluation)
4. **Cursor Automations** - Evaluate vs Ghost-Shift
5. **T3 Code** - Test as Codex alternative
6. **21st Agents** - Review infrastructure for agent marketplace

### Week 3 (Integration)
7. **Air by JetBrains** - Compare with current IDE setup
8. **Code Review tools** - Integrate best option into workflow
9. **Fractals** - Test task decomposition for complex projects

---

## Action Items

### Immediate (Today)
- [ ] Review this scan with Mohammed
- [ ] Deploy OpenReview for Mission Control PRs
- [ ] Test Claude Code /loop feature

### This Week
- [ ] Evaluate Cursor Automations for Ghost-Shift replacement
- [ ] Study autoresearch patterns
- [ ] Test T3 Code desktop app

### Next Week
- [ ] Research 21st Agents infrastructure
- [ ] Compare Air by JetBrains vs Cursor
- [ ] Monitor PinchBench for model recommendations

---

## Files Created

| File | Location | Purpose |
|------|----------|---------|
| This scan | `memory/2026-03-11-bensbites-scan.md` | Complete analysis |

---

*Scanned: 35+ tools*  
*HIGH: 8 | MEDIUM: 12 | LOW: 15+*  
*Budget Impact: $20-50/mo*  
*Duplicates: 0*  
*Calendar Conflicts: None*
