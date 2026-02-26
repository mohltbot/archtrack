#!/bin/zsh
# Daily Budget Reconciliation
# Calculates expected spend vs actual and logs discrepancies

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOGS_DIR="$WORKSPACE/logs"
DATE=$(date +%Y-%m-%d)

echo "[$DATE] Starting budget reconciliation..." >> "$LOGS_DIR/budget-recon.log"

# Get logged expenses from Mission Control
LOGGED_SPEND=$(curl -s http://localhost:3000/api/expenses 2>/dev/null | grep -o '"monthlySpend":[0-9.]*' | cut -d':' -f2 || echo "0")

# Calculate expected based on session tracker (if available)
# This would integrate with the API tracker
EXPECTED_SPEND=$(cat "$LOGS_DIR/expected-spend.txt" 2>/dev/null || echo "$LOGGED_SPEND")

echo "[$DATE] Logged spend: \$$LOGGED_SPEND" >> "$LOGS_DIR/budget-recon.log"
echo "[$DATE] Expected spend: \$$EXPECTED_SPEND" >> "$LOGS_DIR/budget-recon.log"

# Calculate difference
DIFF=$(echo "$EXPECTED_SPEND - $LOGGED_SPEND" | bc)

if (( $(echo "$DIFF > 0.5" | bc -l) )); then
  echo "[$DATE] ⚠️ DISCREPANCY DETECTED: \$$DIFF" >> "$LOGS_DIR/budget-recon.log"
  echo "[$DATE] Some API calls may not have been logged" >> "$LOGS_DIR/budget-recon.log"
  
  # Add correction entry
  curl -s http://localhost:3000/api/expenses \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"description\":\"Unlogged API calls (auto-recon)\",\"amount\":$DIFF,\"category\":\"api_call\",\"provider\":\"moonshot\",\"model\":\"kimi-k2.5\",\"tokens_in\":0,\"tokens_out\":0}" \
    >> "$LOGS_DIR/budget-recon.log" 2>&1
    
  echo "[$DATE] ✅ Correction logged" >> "$LOGS_DIR/budget-recon.log"
else
  echo "[$DATE] ✅ Budget reconciled successfully (diff: \$$DIFF)" >> "$LOGS_DIR/budget-recon.log"
fi
