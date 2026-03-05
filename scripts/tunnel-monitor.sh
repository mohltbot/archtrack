#!/bin/bash
# Cloudflare Tunnel Health Monitor
# Monitors tunnel status, alerts on failures, attempts auto-recovery
# Usage: ./scripts/tunnel-monitor.sh [--alert-discord] [--auto-restart]

set -e

TUNNEL_URL_FILE="./current-tunnel-url.txt"
LOG_FILE="./logs/tunnel-health.log"
HEALTH_STATE_FILE="./logs/tunnel-state.json"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
AUTO_RESTART=false
ALERT_DISCORD=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --alert-discord) ALERT_DISCORD=true; shift ;;
    --auto-restart) AUTO_RESTART=true; shift ;;
    --help)
      echo "Usage: $0 [--alert-discord] [--auto-restart]"
      echo ""
      echo "Options:"
      echo "  --alert-discord  Send alerts to Discord webhook"
      echo "  --auto-restart   Attempt to restart tunnel on failure"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Create logs directory
mkdir -p ./logs

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Cloudflare Tunnel Health Monitor"
echo "===================================="
echo "Time: $(date)"
echo ""

# Check if tunnel URL file exists
if [ ! -f "$TUNNEL_URL_FILE" ]; then
  echo "${RED}❌ Tunnel URL file not found: $TUNNEL_URL_FILE${NC}"
  exit 1
fi

TUNNEL_URL=$(cat "$TUNNEL_URL_FILE" | tr -d '[:space:]')

if [ -z "$TUNNEL_URL" ]; then
  echo "${RED}❌ Tunnel URL is empty${NC}"
  exit 1
fi

echo "Tunnel URL: $TUNNEL_URL"
echo ""

# Function to send Discord alert
send_discord_alert() {
  local status="$1"
  local message="$2"
  
  if [ -z "$DISCORD_WEBHOOK" ]; then
    return
  fi
  
  local color="3447003" # Blue
  if [ "$status" = "DOWN" ]; then
    color="15158332" # Red
  elif [ "$status" = "RECOVERED" ]; then
    color="3066993" # Green
  fi
  
  curl -s -X POST "$DISCORD_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{
      \"embeds\": [{
        \"title\": \"🚨 Tunnel Alert: $status\",
        \"description\": \"$message\",
        \"color\": $color,
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"fields\": [
          {\"name\": \"Tunnel URL\", \"value\": \"$TUNNEL_URL\", \"inline\": true},
          {\"name\": \"Host\", \"value\": \"$(hostname)\", \"inline\": true}
        ]
      }]
    }" > /dev/null 2>&1 || true
}

# Health check function
check_health() {
  local url="$1"
  local max_retries=3
  local retry_count=0
  local success=false
  
  while [ $retry_count -lt $max_retries ]; do
    if curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302\|401"; then
      success=true
      break
    fi
    ((retry_count++))
    sleep 2
  done
  
  if $success; then
    return 0
  else
    return 1
  fi
}

# Load previous state
PREV_STATUS="UNKNOWN"
if [ -f "$HEALTH_STATE_FILE" ]; then
  PREV_STATUS=$(jq -r '.status // "UNKNOWN"' "$HEALTH_STATE_FILE" 2>/dev/null || echo "UNKNOWN")
fi

echo "Previous Status: $PREV_STATUS"
echo ""

# Perform health check
echo "Performing health check..."
if check_health "$TUNNEL_URL"; then
  CURRENT_STATUS="UP"
  echo "${GREEN}✅ Tunnel is healthy${NC}"
  
  # Check response time
  RESPONSE_TIME=$(curl -s --max-time 10 -o /dev/null -w "%{time_total}" "$TUNNEL_URL" 2>/dev/null || echo "0")
  echo "Response Time: ${RESPONSE_TIME}s"
  
  # Alert on recovery
  if [ "$PREV_STATUS" = "DOWN" ] && $ALERT_DISCORD; then
    send_discord_alert "RECOVERED" "Tunnel has recovered and is now responding normally."
  fi
else
  CURRENT_STATUS="DOWN"
  echo "${RED}❌ Tunnel is not responding${NC}"
  
  # Try localhost as fallback check
  echo "Checking localhost:3000..."
  if curl -s --max-time 5 -o /dev/null http://localhost:3000; then
    echo "${YELLOW}⚠️  Local service is running but tunnel is down${NC}"
    ISSUE="tunnel_only"
  else
    echo "${RED}❌ Local service is also down${NC}"
    ISSUE="both_down"
  fi
  
  # Alert on failure
  if $ALERT_DISCORD; then
    send_discord_alert "DOWN" "Tunnel health check failed. Issue type: $ISSUE"
  fi
  
  # Attempt restart if configured
  if $AUTO_RESTART; then
    echo ""
    echo "Attempting auto-restart..."
    
    # Kill existing cloudflared processes
    pkill -f "cloudflared tunnel" 2>/dev/null || true
    sleep 2
    
    # Start new tunnel
    if [ -f "./scripts/start-tunnel.sh" ]; then
      nohup ./scripts/start-tunnel.sh > ./logs/tunnel-restart.log 2>&1 &
      echo "${GREEN}✅ Restart initiated${NC}"
      sleep 5
      
      # Verify restart
      if check_health "$TUNNEL_URL"; then
        echo "${GREEN}✅ Tunnel recovered after restart${NC}"
        CURRENT_STATUS="UP"
        if $ALERT_DISCORD; then
          send_discord_alert "RECOVERED" "Tunnel recovered after automatic restart."
        fi
      else
        echo "${RED}❌ Restart failed${NC}"
      fi
    else
      echo "${YELLOW}⚠️  No start-tunnel.sh script found${NC}"
    fi
  fi
fi

# Save state
cat > "$HEALTH_STATE_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "$CURRENT_STATUS",
  "url": "$TUNNEL_URL",
  "response_time": ${RESPONSE_TIME:-0},
  "checks_performed": 3
}
EOF

# Log to file
echo "$(date '+%Y-%m-%d %H:%M:%S') | $CURRENT_STATUS | ${RESPONSE_TIME:-N/A}s | $TUNNEL_URL" >> "$LOG_FILE"

echo ""
echo "═══════════════════════════════════════════════════"
echo "Status: $CURRENT_STATUS"
echo "State saved to: $HEALTH_STATE_FILE"
echo "Log written to: $LOG_FILE"
echo "═══════════════════════════════════════════════════"

if [ "$CURRENT_STATUS" = "UP" ]; then
  exit 0
else
  exit 1
fi
