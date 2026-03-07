# Ben's Bites Scan - March 5, 2026
**Issue:** "Google Apps in the Terminal"  
**Scan Date:** 2026-03-06  
**Status:** Complete

---

## Summary

This issue focuses on:
- Google Workspace CLI release (major news for agent builders)
- New models: Gemini 3.1 Flash Lite, GPT-5.3-Instant
- OpenAI business moves (GitHub alternative, Trade Desk ads, IPO rumors)
- Agent tooling ecosystem expansion
- Voice agent infrastructure

---

## 🔥 HIGH Priority (Auto-Implement)

### 1. Google Workspace CLI ⭐⭐⭐ TOP PRIORITY
**What:** Official Google CLI for Drive, Gmail, Calendar, Sheets, Docs, Chat, Admin  
**URL:** https://github.com/googleworkspace/cli  
**Why it fits:**
- Built specifically with agents in mind
- We already use Google Workspace (Gmail, Calendar, Sheets)
- Could replace/improve our `gog` CLI integration
- Direct API access without OAuth headaches

**Action:** Research migration from `gog` to official CLI
- Compare features with current `gog` setup
- Test authentication flow
- Evaluate if worth switching

---

### 2. Agent Experience (Design Patterns)
**What:** Practical reference for AI agent patterns, surfaces, design principles  
**URL:** https://agent-experience.dev/  
**GitHub:** https://github.com/ygwyg/agent-experience  
**Why it fits:**
- Open source reference for building better agent UX
- Could improve Mission Control design patterns
- Industry standard emerging

**Action:** Review and incorporate relevant patterns into Mission Control

---

### 3. Nen - Computer Use Agent Infrastructure
**What:** Infrastructure for building reliable computer use agents  
**URL:** https://www.getnen.ai/  
**Why it fits:**
- We use browser automation (Puppeteer)
- Could improve reliability of our automation
- Alternative to Browser Use API that failed

**Action:** Evaluate vs our current Puppeteer setup

---

### 4. Polyscope - Parallel Agent Coding
**What:** Dev environment for running parallel coding agents  
**URL:** https://getpolyscope.com/  
**Why it fits:**
- Our Ghost-Shift runs single-threaded
- Could speed up task execution significantly
- Built-in preview browser

**Action:** Research for Ghost-Shift v4 parallelization

---

### 5. Superset - Turbocharged Terminal
**What:** Terminal that runs many CLI coding agents  
**URL:** https://superset.sh/  
**Why it fits:**
- Could enhance our terminal-based workflows
- Multiple agents in parallel
- Fits our CLI-first approach

**Action:** Evaluate for Mission Control terminal integration

---

## ⚖️ MEDIUM Priority (Review First)

### 6. Paperclip - AI Employees
**What:** Hire AI employees, set goals, business runs itself  
**URL:** https://paperclip.ing/  
**GitHub:** https://github.com/paperclipai/paperclip  
**Why consider:**
- Similar to our agent vision
- Could provide inspiration for Mission Control

---

### 7. Modem - Auto-Triage PM
**What:** Dev team auto-triage PM  
**URL:** https://modem.dev/  
**Why consider:**
- Could auto-triage Mission Control tasks
- Similar to our self-diagnostics concept

---

### 8. Exa Deep - Research Agents
**What:** Agents that run in loops to gather search information  
**URL:** https://exa.ai/blog/exa-deep  
**Why consider:**
- Could enhance our research capabilities
- Alternative to Tavily

---

### 9. Defuddle - Content Extraction
**What:** Get main content of any page in Markdown  
**URL:** https://defuddle.md/  
**Why consider:**
- We do web scraping for Ben's Bites
- Could replace/improve our fetch pipeline

---

### 10. Moment - Markdown Business OS
**What:** Run entire business from Markdown with code at center  
**URL:** https://www.moment.dev/  
**Why consider:**
- Similar to our Mission Control approach
- Could provide UX inspiration

---

### 11. Glaze by Raycast
**What:** Create real desktop apps with file access, keyboard shortcuts  
**URL:** https://www.raycast.com/blog/introducing-glaze  
**Why consider:**
- Could build Mission Control desktop app
- Raycast ecosystem integration

---

### 12. Refero MCP
**What:** Connect agents to curated library of real product interfaces  
**URL:** https://refero.design/mcp  
**Why consider:**
- MCP (Model Context Protocol) standard
- Could improve agent design capabilities

---

## 📝 LOW Priority (Log Only)

### News & Announcements
- **Gemini 3.1 Flash Lite** - Faster but price increased ($0.25/$1.50) - Open source Minimax M2.5 may be better value
- **GPT-5.3-Instant** - Default ChatGPT model, better behavior, less hallucination
- **Codex on Windows** - Now available beyond Mac
- **OpenAI ARR $25B** vs **Anthropic $19B** - Revenue race
- **OpenAI building GitHub alternative** - Long-term project
- **OpenAI + Trade Desk** - Ads in ChatGPT coming

### Other Tools
- **3D as code** (World Labs) - 3D model generation approach
- **ASC11** - ASCII art editor with animation
- **moss** - Notes app that organizes work
- **yt-browse** - YouTube channel search TUI
- **WebPage by Apple** - Web development video
- **Kodo** - AI-generated editable designs
- **/playground** - Design canvas for code

---

## 💡 Key Insights

### 1. Google Officially Embracing Agents
The Google Workspace CLI is built "with a focus on agents" - major validation of our approach.

### 2. Parallel Agent Execution Trend
Multiple tools (Polyscope, Superset) enabling parallel agents - Ghost-Shift should evolve this direction.

### 3. MCP (Model Context Protocol) Emerging
Refero MCP indicates standardization around MCP for agent capabilities.

### 4. Voice Agents Getting Infrastructure
Speechmatics ad shows voice agent infra maturing (250ms latency).

### 5. "Agent Experience" as a Discipline
agent-experience.dev suggests industry coalescing around agent UX patterns.

---

## Immediate Actions

1. **Research Google Workspace CLI** - Compare with `gog`
2. **Review Agent Experience patterns** - For Mission Control UX
3. **Evaluate Nen** - For browser automation reliability
4. **Research Polyscope/Superset** - For parallel Ghost-Shift execution

---

## Budget Impact

| Action | Cost |
|--------|------|
| Research only | $0.00 |
| Testing Google CLI | $0.00 |
| **Total** | **$0.00** |

---

*Scanned: 19 tools | HIGH: 5 | MEDIUM: 7 | LOW: 7*


---

## Auto-Scan Appendix (2026-03-06)

Additional tools detected by automated scan:

- Google Workspace released a CLI (HIGH): https://github.com/googleworkspace/cli
- 3D as code (LOW): https://www.worldlabs.ai/blog/3d-as-code
- Agent Experience (HIGH): https://agent-experience.dev/
- repo (HIGH): https://github.com/ygwyg/agent-experience
- Glaze by Raycast (LOW): https://www.raycast.com/blog/introducing-glaze
- Glide (LOW): https://www.glideapps.com/new
- github (HIGH): https://github.com/paperclipai/paperclip
- Modem (LOW): https://modem.dev/
- Nen (LOW): https://www.getnen.ai/blog/launch-post
- Exa Deep (LOW): https://exa.ai/blog/exa-deep
- Moment (LOW): https://www.moment.dev/
- Kodo (LOW): https://www.usekodo.ai/
- /playground (MEDIUM): https://www.aiverse.design/insights/design-canvas
- yt-browse (LOW): https://github.com/nolenroyalty/yt-browse
- Agents UI by LiveKit (HIGH): https://livekit.io/ui
- Symphony (LOW): https://github.com/openai/symphony
- eval-skills (LOW): https://github.com/hamelsmu/evals-skills
- developer marketing (LOW): https://github.com/jonathimer/devmarketing-skills
- Mintlify acquired Helicone (LOW): https://www.helicone.ai/blog/joining-mintlify