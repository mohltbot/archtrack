#!/bin/bash
# Monitor Mission Control health
# Run this in cron every 5 minutes

LOG_FILE="/Users/mohlt/.openclaw/workspace/logs/health-check.log"
ALERT_WEBHOOK="${DISCORD_WEBHOOK:-}"

check_service() {
  local name=$1
  local url=$2
  
  if curl -s "$url" > /dev/null 2>&1; then
    echo "✅ $name: UP"
    return 0
  else
    echo "❌ $name: DOWN"
    return 1
  fi
}

echo "[$(date)] Health Check Starting" >> "$LOG_FILE"

# Check services
MISSION_CONTROL=$(check_service "Mission Control" "http://localhost:3000/api/health")
MLX_SERVER=$(check_service "MLX Server" "http://localhost:8787/health")
OLLAMA=$(pgrep -x "ollama" > /dev/null && echo "✅ Ollama: UP" || echo "❌ Ollama: DOWN")

echo "$MISSION_CONTROL" >> "$LOG_FILE"
echo "$MLX_SERVER" >> "$LOG_FILE"
echo "$OLLAMA" >> "$LOG_FILE"

# Check disk space
DISK_USAGE=$(df -h /Users/mohlt | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
  echo "🚨 DISK WARNING: ${DISK_USAGE}% full" >> "$LOG_FILE"
  ALERT="Disk space critical: ${DISK_USAGE}%"
fi

# Check budget
BUDGET=$(curl -s http://localhost:3000/api/expenses 2>/dev/null | jq 'map(.amount) | add' 2>/dev/null || echo "0")
if (( $(echo "$BUDGET > 160" | bc -l) )); then
  echo "💰 BUDGET ALERT: \$$BUDGET / $200" >> "$LOG_FILE"
  ALERT="Budget at 80%: \$$BUDGET"
fi

# Send alert if needed
if [ -n "$ALERT" ] && [ -n "$ALERT_WEBHOOK" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 Mission Control Alert: $ALERT\"}" \
    "$ALERT_WEBHOOK" 2>/dev/null
fi

echo "[$(date)] Health Check Complete" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
