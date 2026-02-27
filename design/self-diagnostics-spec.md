# Self-Diagnostics Feature Design Spec

**Date:** 2026-02-27  
**Inspiration:** Raindrop AI ("Sentry for AI Agents")  
**Status:** Design Proposal  
**Author:** Mission Control Intelligence

---

## Executive Summary

This document proposes a **Self-Diagnostics and Health Monitoring System** for Mission Control, inspired by Raindrop AI's approach to agent observability. The system will enable agents to monitor their own health, detect issues, and report status — providing "Sentry-like" monitoring for AI agent operations.

### Key Inspiration from Raindrop

Raindrop AI describes itself as **"Sentry for AI agents"** — monitoring infrastructure that catches when AI agents fail silently in production. Key capabilities:
- **Issue Detection**: Discover, track, and fix agent failures
- **Step-by-step Tracing**: Deep visibility into agent reasoning
- **Real-time Alerts**: Slack notifications for anomalies
- **Semantic Search**: Find patterns across millions of events
- **User Frustration Detection**: Identify when users are unhappy
- **A/B Testing**: Compare prompt/model performance

---

## Goals

1. **Observability**: Agents should report their own health status
2. **Issue Detection**: Automatically detect anomalies and failures
3. **Root Cause Analysis**: Trace through agent decisions to find problems
4. **Proactive Alerts**: Notify before users complain
5. **Continuous Improvement**: Learn from failures to improve over time

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MISSION CONTROL SELF-DIAGNOSTICS                 │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   AGENT      │  │   GATEWAY    │  │   SKILL      │              │
│  │  (Session)   │  │  (Daemon)    │  │ (Execution)  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           │                                         │
│              ┌────────────┴────────────┐                           │
│              │    HEALTH COLLECTOR     │                           │
│              │  (Metrics & Telemetry)  │                           │
│              └────────────┬────────────┘                           │
│                           │                                         │
│  ┌────────────────────────┼────────────────────────┐               │
│  │                        ▼                        │               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │               │
│  │  │   ISSUE     │  │    TRACE    │  │  HEALTH  │ │               │
│  │  │  DETECTOR   │  │   STORAGE   │  │  DASH    │ │               │
│  │  └─────────────┘  └─────────────┘  └──────────┘ │               │
│  │         │                │              │        │               │
│  │         └────────────────┼──────────────┘        │               │
│  │                          ▼                       │               │
│  │              ┌─────────────────────┐             │               │
│  │              │   ALERT MANAGER     │             │               │
│  │              │ (Discord/Slack/CLI) │             │               │
│  │              └─────────────────────┘             │               │
│  │                          │                       │               │
│  │                          ▼                       │               │
│  │              ┌─────────────────────┐             │               │
│  │              │   SELF-HEALING      │             │               │
│  │              │   (Auto-recovery)   │             │               │
│  │              └─────────────────────┘             │               │
│  └──────────────────────────────────────────────────┘               │
│                           │                                         │
│                           ▼                                         │
│              ┌─────────────────────┐                               │
│              │  DIAGNOSTIC REPORT  │                               │
│              │  (Daily/Weekly)     │                               │
│              └─────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Health Metrics Collector

**Purpose**: Gather telemetry from all Mission Control components

**Metrics to Collect**:

| Category | Metric | Type | Description |
|----------|--------|------|-------------|
| **Session** | Session duration | Histogram | How long sessions last |
| | Messages per session | Counter | Interaction volume |
| | Error rate | Gauge | Errors per 100 interactions |
| | Response latency | Histogram | Time to first token |
| | Tool call success | Gauge | % of successful tool calls |
| **Gateway** | Uptime | Gauge | Gateway availability % |
| | Connected channels | Counter | Active Discord/Telegram/etc |
| | Queue depth | Gauge | Pending messages |
| | Memory usage | Gauge | RSS heap size |
| **Skills** | Skill invocations | Counter | Times each skill is used |
| | Skill errors | Counter | Errors per skill |
| | Skill latency | Histogram | Execution time per skill |
| | Tool timeouts | Counter | Tool execution timeouts |
| **LLM** | API calls | Counter | Calls per provider |
| | Token usage | Counter | Input/output tokens |
| | Cost per session | Gauge | Estimated API cost |
| | Model fallback | Counter | Fallback events |
| **User** | Frustration signals | Counter | "wrong", "no", "fix" etc |
| | Repeat queries | Counter | Same question asked |
| | Help requests | Counter | Explicit help asks |

---

### 2. Issue Detector

**Purpose**: Automatically detect anomalies and classify issues

**Detection Methods**:

#### A. Threshold-Based Alerts
```yaml
# config/diagnostics.yml
alerts:
  - name: high_error_rate
    condition: error_rate > 5%
    duration: 5m
    severity: warning
    
  - name: gateway_down
    condition: gateway_uptime < 99%
    duration: 1m
    severity: critical
    
  - name: slow_response
    condition: p95_latency > 10000ms
    duration: 10m
    severity: warning
    
  - name: tool_failing
    condition: tool_success_rate < 90%
    duration: 5m
    severity: error
```

#### B. Pattern Detection (Semantic)
Use LLM to classify conversation patterns:

| Pattern | Description | Example Signals |
|---------|-------------|-----------------|
| `user_frustration` | User is unhappy | "this is wrong", "fix this", "not working" |
| `agent_confusion` | Agent doesn't understand | Repeated clarifications, off-topic responses |
| `loop_detected` | Agent stuck in loop | Same tool called 3+ times, repeated phrases |
| `hallucination` | Agent made things up | Facts contradicted by search results |
| `context_loss` | Agent forgot context | Asking for info already provided |
| `tool_misuse` | Wrong tool selected | File tool for web search |

#### C. Anomaly Detection (Statistical)
- Compare current metrics to 7-day rolling average
- Flag deviations > 2 standard deviations
- Use simple statistical models (no ML infrastructure needed)

---

### 3. Trace Storage

**Purpose**: Store detailed execution traces for debugging

**What to Capture**:

```typescript
interface Trace {
  traceId: string;
  sessionId: string;
  timestamp: number;
  duration: number;
  
  // Request/Response
  userMessage: string;
  agentResponse: string;
  
  // Tool calls
  toolCalls: {
    tool: string;
    input: any;
    output: any;
    latency: number;
    success: boolean;
    error?: string;
  }[];
  
  // LLM interactions
  llmCalls: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    latency: number;
  }[];
  
  // Context
  skillsUsed: string[];
  filesAccessed: string[];
  memoryRefs: string[];
  
  // Issues detected
  issues: Issue[];
  userFeedback?: 'positive' | 'negative';
}
```

**Storage Strategy**:
- Keep last 24 hours in hot storage (SQLite/memory)
- Compress and archive to files after 24h
- Purge after 30 days (configurable)
- Estimated storage: ~10KB per interaction

---

### 4. Health Dashboard

**Purpose**: Visual overview of agent health

**CLI Dashboard** (`openclaw health`):

```
┌────────────────────────────────────────────────────────────┐
│              MISSION CONTROL HEALTH DASHBOARD              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  OVERALL STATUS:  🟢 HEALTHY                               │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  GATEWAY          │  Sessions    │  Errors         │  │
│  │  🟢 Online 99.9%  │  142 today   │  3 (2.1%)       │  │
│  │  Uptime: 14 days  │  Avg: 12 min │  🔴 1 critical  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ACTIVE ISSUES (last 24h)                                  │
│  ────────────────────────────────────────────────────────  │
│  🔴 High latency on browser.navigate  (3 occurrences)      │
│  🟡 2 user frustration signals detected                    │
│  🟢 1 loop detected (auto-resolved)                        │
│                                                            │
│  TOP SKILLS (by usage)          TOP ERRORS (by count)      │
│  ─────────────────────          ─────────────────────      │
│  1. web-search (45x)            1. browser.timeout (2x)    │
│  2. github (32x)                2. file.not_found (1x)     │
│  3. code-edit (28x)                                          │
│                                                            │
│  COST TODAY: $4.23 (projected: $127/mo)                    │
│  TOKEN USAGE: 45K in / 120K out                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 5. Alert Manager

**Purpose**: Send notifications when issues are detected

**Alert Channels**:

| Channel | Use Case | Priority |
|---------|----------|----------|
| **Discord DM** | Critical issues | P0 |
| **Slack** | Team notifications | P1 |
| **CLI** | Local development | All |
| **Log file** | Audit trail | All |

**Alert Format** (Discord):

```
🚨 Mission Control Alert

**Issue:** Tool timeout detected
**Severity:** Warning
**Time:** 2026-02-27 14:23:05 PST

**Details:**
- Tool: browser.navigate
- URL: https://example.com
- Timeout: 30000ms
- Session: abc123

**Suggested Action:**
Check network connectivity or increase timeout threshold.

**Trace:** [View Details](link-to-trace)
```

---

### 6. Self-Healing System

**Purpose**: Automatically recover from common failures

**Auto-Recovery Strategies**:

| Issue | Detection | Recovery Action |
|-------|-----------|-----------------|
| Loop detected | Same tool 3+ times | Break loop, ask user for clarification |
| Tool timeout | >30s no response | Retry with exponential backoff |
| Context overflow | Token limit warning | Summarize and compress context |
| Model API error | 5xx response | Fallback to backup provider |
| Memory leak | RSS > threshold | Restart gateway process gracefully |
| Rate limit | 429 response | Backoff and queue requests |

---

### 7. Diagnostic Reports

**Purpose**: Periodic health summaries

**Daily Report** (Morning Briefing):

```markdown
# Mission Control Daily Report
**Date:** 2026-02-27
**Overall Status:** 🟢 Healthy

## Summary
- Sessions: 142 (+12% vs yesterday)
- Error Rate: 2.1% (target: <5%) ✅
- Avg Response Time: 2.3s
- Cost: $4.23

## Wins 🎉
- User praised research skill accuracy
- New skill "github-pr-review" used 15 times

## Issues 🔧
- 3 browser timeouts (investigating)
- 1 user reported context loss

## Recommendations
1. Consider increasing browser timeout to 45s
2. Review context management for long sessions
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Metrics collection infrastructure
- [ ] Basic health dashboard (`openclaw health`)
- [ ] Threshold-based alerting
- [ ] Trace storage (last 24h)

### Phase 2: Intelligence (Week 3-4)
- [ ] Pattern detection for common issues
- [ ] User frustration signal detection
- [ ] Anomaly detection (statistical)
- [ ] Alert manager with Discord integration

### Phase 3: Automation (Week 5-6)
- [ ] Self-healing for loops
- [ ] Automatic retry with backoff
- [ ] Model fallback automation
- [ ] Daily diagnostic reports

### Phase 4: Polish (Week 7-8)
- [ ] Web dashboard (optional)
- [ ] Advanced trace analysis
- [ ] Cost optimization recommendations
- [ ] A/B testing framework

---

## Configuration

```yaml
# ~/.openclaw/config/diagnostics.yml

diagnostics:
  enabled: true
  
  # Storage
  trace_retention: 30d
  hot_storage_limit: 10000  # traces
  
  # Alerting
  alerts:
    discord:
      enabled: true
      webhook_url: ${DISCORD_WEBHOOK_URL}
      min_severity: warning
      
    slack:
      enabled: false
      webhook_url: ${SLACK_WEBHOOK_URL}
      
    daily_report:
      enabled: true
      channel: discord
      time: "08:00"
      timezone: "America/Los_Angeles"
  
  # Thresholds
  thresholds:
    error_rate_warning: 0.05
    error_rate_critical: 0.10
    latency_warning_ms: 10000
    latency_critical_ms: 30000
    
  # Self-healing
  self_healing:
    enabled: true
    auto_retry: true
    max_retries: 3
    break_loops: true
    
  # Pattern detection
  patterns:
    frustration_keywords: ["wrong", "fix", "no", "bad", "not working"]
    loop_threshold: 3
    context_warning_tokens: 8000
```

---

## CLI Commands

```bash
# View health dashboard
openclaw health

# View health for specific time range
openclaw health --since "24h ago"

# List recent issues
openclaw health issues

# View trace for specific session
openclaw health trace <session-id>

# Run diagnostic check
openclaw health check

# Export diagnostic report
openclaw health report --format markdown --output report.md

# Configure alerts
openclaw health config alerts
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Issue detection rate | >80% of user-reported issues | Compare auto-detected vs user reports |
| False positive rate | <10% | Manual review of alerts |
| Mean time to detect | <5 minutes | From issue occurrence to alert |
| User satisfaction | >4.0/5.0 | Post-interaction rating |
| Cost visibility | 100% | All API calls tracked |

---

## Budget-Conscious Design

To keep costs low:

1. **Local Processing**: All metrics processed locally, no cloud services
2. **Efficient Storage**: Compression, rotation, sampling for high-volume metrics
3. **Rule-Based Detection**: Pattern matching before LLM classification
4. **Sampling**: Collect 100% of errors, sample successes at 10%
5. **No External Dependencies**: Pure Node.js implementation

Estimated overhead: <5% additional compute, <$1/month storage.

---

## Conclusion

This Self-Diagnostics system brings Raindrop AI-inspired observability to Mission Control while maintaining our philosophy of local-first, privacy-respecting design. By implementing:

1. **Comprehensive metrics collection**
2. **Intelligent issue detection**
3. **Detailed execution tracing**
4. **Proactive alerting**
5. **Automatic recovery**

Mission Control will achieve production-grade reliability and user trust.

**Next Steps:**
1. Review and approve Phase 1 scope
2. Create implementation tickets
3. Begin metrics collection infrastructure

---

## References

- https://www.raindrop.ai/
- https://www.ycombinator.com/companies/raindrop
- Raindrop PR: "Raindrop Raises $15 Million to Detect Critical AI Agent Failures"
