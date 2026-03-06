# Agent Self-Diagnostics Module

> From Ben's Bites (Feb 26, 2026): https://www.raindrop.ai/blog/agent-self-diagnostics

Raindrop AI introduced "self-diagnostics" - a feature that lets agents proactively self-report issues they encounter. This module brings that capability to Mission Control.

## Overview

The self-diagnostics system allows agents to:
- Detect and report their own errors/failures
- Report performance degradation
- Alert on budget threshold breaches
- Communicate blockers proactively

## How It Works

```
Agent Task Execution
        ↓
   [Hook] Capture outcome
        ↓
  Analyze against rules
        ↓
  Report if anomaly detected
        ↓
  Dashboard + Discord alert
```

## Components

### 1. Diagnostics Hook (`lib/diagnostics/hook.ts`)
Wraps agent execution to capture outcomes

### 2. Rule Engine (`lib/diagnostics/rules.ts`)
Defines what constitutes an issue worth reporting

### 3. Reporter (`lib/diagnostics/reporter.ts`)
Sends diagnostics to dashboard and Discord

### 4. Dashboard Widget (`components/diagnostics-widget.tsx`)
Real-time display of agent health

## Usage

```typescript
import { withDiagnostics } from '@/lib/diagnostics';

const result = await withDiagnostics(
  'nightly-worker',
  async () => {
    // Agent work here
    return await performNightlyTasks();
  },
  { budgetLimit: 200, timeoutMs: 3600000 }
);
```

## Diagnostic Types

| Type | Description | Example |
|------|-------------|---------|
| `error` | Unhandled exception | API timeout |
| `warning` | Degraded performance | Slow response |
| `budget_alert` | Approaching spend limit | 80% of $200 used |
| `blocked` | Cannot proceed | Missing credentials |
| `completed` | Successful execution | Task finished |

## Configuration

```typescript
// lib/diagnostics/config.ts
export const diagnosticsConfig = {
  enabled: true,
  reportToDiscord: true,
  budgetThresholds: {
    warning: 0.7,  // 70% = $140
    critical: 0.9, // 90% = $180
  },
  performanceThresholds: {
    slowExecution: 300000, // 5 minutes
  }
};
```
