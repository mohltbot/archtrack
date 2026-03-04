#!/bin/zsh
# Budget Watch Agent
# Tracks API spend and alerts on thresholds

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/agents/budget-watch-$(date +%Y%m%d-%H%M).log"
ALERT_FILE="$WORKSPACE/logs/agents/alerts.txt"
DATA_FILE="$WORKSPACE/mission-control/data/db.json"

mkdir -p "$WORKSPACE/logs/agents"

echo "[$(date)] Budget Watch Agent starting..." >> "$LOG_FILE"

# Get current spend
SPENT=$(cat "$DATA_FILE" 2>/dev/null | grep -o '"spent":[0-9.]*' | cut -d: -f2 | head -1)
LIMIT=200

if [ -z "$SPENT" ]; then
  SPENT="13.76"  # Default fallback
fi

PERCENT=$(echo "scale=2; ($SPENT / $LIMIT) * 100" | bc)

echo "Current spend: $$SPENT / $$LIMIT ($PERCENT%)" >> "$LOG_FILE"

# Check thresholds
if (( $(echo "$PERCENT > 95" | bc -l) )); then
  echo "🚨 BUDGET CRITICAL: $PERCENT% ($$SPENT / $$LIMIT)" >> "$ALERT_FILE"
  echo "STOP all API calls immediately!" >> "$ALERT_FILE"
elif (( $(echo "$PERCENT > 90" | bc -l) )); then
  echo "⚠️ BUDGET WARNING: $PERCENT% ($$SPENT / $$LIMIT)" >> "$ALERT_FILE"
  echo "Switch to local MLX inference!" >> "$ALERT_FILE"
elif (( $(echo "$PERCENT > 75" | bc -l) )); then
  echo "📊 Budget Notice: $PERCENT% ($$SPENT / $$LIMIT)" >> "$ALERT_FILE"
fi

echo "[$(date)] Budget Watch Agent complete" >> "$LOG_FILE"
