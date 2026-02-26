#!/bin/zsh
# Sync Moonshot API balance to Mission Control
# Run this hourly to keep budget tracking accurate

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOGS_DIR="$WORKSPACE/logs"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

mkdir -p "$LOGS_DIR"

echo "[$TIMESTAMP] Checking Moonshot API balance..." >> "$LOGS_DIR/moonshot-sync.log"

# Note: Moonshot API doesn't have a public billing endpoint yet
# For now, we'll track expenses manually via the API calls we make
# TODO: Implement automatic expense tracking via Moonshot webhook or API

# Current known state (update this when you check your dashboard):
STARTING_BALANCE=25.00
CURRENT_BALANCE=21.51366  # Update this manually when you check
ACTUAL_SPENT=$(echo "$STARTING_BALANCE - $CURRENT_BALANCE" | bc)

# Get current tracked amount from Mission Control
TRACKED_SPENT=$(curl -s http://localhost:3000/api/expenses | grep -o '"monthlySpend":[0-9.]*' | cut -d':' -f2)

echo "[$TIMESTAMP] Actual spent: \$$ACTUAL_SPENT | Tracked: \$$TRACKED_SPENT" >> "$LOGS_DIR/moonshot-sync.log"

# If there's a discrepancy > $0.01, log a correction
DIFFERENCE=$(echo "$ACTUAL_SPENT - $TRACKED_SPENT" | bc)
if (( $(echo "$DIFFERENCE > 0.01" | bc -l) )); then
  echo "[$TIMESTAMP] Discrepancy found: \$$DIFFERENCE" >> "$LOGS_DIR/moonshot-sync.log"
  
  # Add correction expense
  curl -s http://localhost:3000/api/expenses \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"description\":\"Moonshot API usage (auto-sync)\",\"amount\":$DIFFERENCE,\"category\":\"api_call\",\"provider\":\"moonshot\",\"model\":\"kimi-k2.5\",\"tokens_in\":0,\"tokens_out\":0}" \
    >> "$LOGS_DIR/moonshot-sync.log" 2>&1
    
  echo "[$TIMESTAMP] Correction logged: \$$DIFFERENCE" >> "$LOGS_DIR/moonshot-sync.log"
fi

echo "[$TIMESTAMP] Sync complete." >> "$LOGS_DIR/moonshot-sync.log"
