# Background Agents Setup
# Ben's Bites Implementation: March 4, 2026
# Source: https://background-agents.com/

## Overview
Set up autonomous background agents for Mission Control that work without user intervention.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Background Agents                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Task Monitor │  │ Budget Watch │  │ Memory       │      │
│  │ Agent        │  │ Agent        │  │ Synthesizer  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────┴───────┐                        │
│                    │  Coordinator  │                        │
│                    └───────┬───────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Slack Alerts │  │ GitHub PRs   │  │ Discord      │      │
│  │              │  │              │  │ Reports      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Agent Definitions

### 1. Task Monitor Agent
**Trigger:** Every 15 minutes
**Actions:**
- Check for stale tasks (>48 hours old)
- Auto-prioritize based on due dates
- Alert on blocked tasks
- Create follow-up tasks for overdue items

### 2. Budget Watch Agent
**Trigger:** Every hour + on API calls
**Actions:**
- Track API spend in real-time
- Alert at 75% ($150), 90% ($180), 95% ($195) of $200 budget
- Auto-switch to local MLX when approaching limit
- Generate daily spend reports

### 3. Memory Synthesizer Agent
**Trigger:** Daily at 11 PM
**Actions:**
- Read daily memory files
- Extract key decisions, learnings, todos
- Update MEMORY.md with synthesized insights
- Archive old daily logs

### 4. PR Review Agent
**Trigger:** On new GitHub PR
**Actions:**
- Auto-review for common issues
- Check for secrets/tokens
- Validate JSON/YAML syntax
- Summarize changes for quick review

## Implementation

### Agent Runner Script
```bash
#!/bin/bash
# background-agents.sh - Run all background agents

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOG_DIR="$WORKSPACE/logs/background-agents"
mkdir -p "$LOG_DIR"

run_agent() {
  local agent_name=$1
  local agent_script=$2
  local log_file="$LOG_DIR/${agent_name}-$(date +%Y%m%d-%H%M).log"
  
  echo "[$(date)] Starting $agent_name..." >> "$log_file"
  
  # Run agent with timeout
  timeout 300 bash "$agent_script" >> "$log_file" 2>&1
  
  if [ $? -eq 0 ]; then
    echo "[$(date)] ✅ $agent_name completed" >> "$log_file"
  else
    echo "[$(date)] ❌ $agent_name failed" >> "$log_file"
    # Alert on failure
    echo "Background agent $agent_name failed" | \
      openclaw message --to discord --channel alerts
  fi
}

# Run all agents
run_agent "task-monitor" "$WORKSPACE/agents/task-monitor.sh"
run_agent "budget-watch" "$WORKSPACE/agents/budget-watch.sh"
run_agent "memory-synth" "$WORKSPACE/agents/memory-synthesizer.sh"
```

### Agent Definitions

Create files in `$WORKSPACE/agents/`:

**task-monitor.sh:**
```bash
#!/bin/bash
# Monitor tasks and alert on stale items

curl -s http://localhost:3000/api/tasks | jq -r '.tasks[] | select(.status == "pending") | "\(.id): \(.title)"' | while read task; do
  echo "Checking: $task"
  # Add age check logic here
done
```

**budget-watch.sh:**
```bash
#!/bin/bash
# Monitor API spend and alert on thresholds

SPENT=$(cat /Users/mohlt/.openclaw/workspace/mission-control/data/db.json | grep -o '"spent":[0-9.]*' | cut -d: -f2)
LIMIT=200

PERCENT=$(echo "scale=2; ($SPENT / $LIMIT) * 100" | bc)

if (( $(echo "$PERCENT > 75" | bc -l) )); then
  echo "⚠️ Budget alert: $PERCENT% used ($$SPENT / $$LIMIT)"
  # Send alert
fi
```

## Deployment

1. Create agents directory
2. Install agent scripts
3. Set up launchd plist for background-agents.sh
4. Configure agent schedules

## Monitoring

All agents log to:
- `$WORKSPACE/logs/background-agents/`
- Discord #agent-alerts channel
- Daily summary reports

## Future Enhancements

- [ ] ML-based task prioritization
- [ ] Predictive budget forecasting
- [ ] Automatic PR merging for approved changes
- [ ] Self-improving agent logic based on outcomes
