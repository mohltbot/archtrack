#!/bin/zsh
# Task Monitor Agent
# Checks for stale tasks and alerts on blocked items

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/agents/task-monitor-$(date +%Y%m%d-%H%M).log"
ALERT_FILE="$WORKSPACE/logs/agents/alerts.txt"

mkdir -p "$WORKSPACE/logs/agents"

echo "[$(date)] Task Monitor Agent starting..." >> "$LOG_FILE"

# Check Mission Control API for stale tasks
STALE_TASKS=$(curl -s http://localhost:3000/api/tasks 2>/dev/null | jq -r '.tasks[] | select(.status == "pending") | select(.created_at | fromdateiso8601 < (now - 172800)) | "\(.id): \(.title)"' 2>/dev/null)

if [ -n "$STALE_TASKS" ]; then
  echo "⚠️ Found stale tasks (>48h old):" >> "$LOG_FILE"
  echo "$STALE_TASKS" >> "$LOG_FILE"
  
  # Alert
  echo "🚨 TASK ALERT: $(echo "$STALE_TASKS" | wc -l) stale tasks found" >> "$ALERT_FILE"
  echo "$STALE_TASKS" >> "$ALERT_FILE"
  echo "" >> "$ALERT_FILE"
else
  echo "✅ No stale tasks found" >> "$LOG_FILE"
fi

echo "[$(date)] Task Monitor Agent complete" >> "$LOG_FILE"
