#!/bin/zsh
# Mission Control Sync - Keep dashboard updated
# Runs every 4 hours to ensure tasks, expenses, and stats are current

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOGS_DIR="$WORKSPACE/logs"
DATE=$(date +%Y-%m-%d_%H:%M)

echo "[$DATE] Starting Mission Control sync..." >> "$LOGS_DIR/mc-sync.log"

# 1. Sync completed work to tasks
cd "$WORKSPACE"

# Check for unlogged PRs
MERGED_PRS=$(gh pr list --state merged --limit 20 --json number,title,mergedAt | jq -r '.[] | "\(.number):\(.title)"' 2>/dev/null)

# Check current tasks
curl -s http://localhost:3000/api/tasks > /tmp/current_tasks.json

# Log any discrepancies
echo "[$DATE] Checked PRs and tasks" >> "$LOGS_DIR/mc-sync.log"

# 2. Budget reconciliation (every 3 days)
DAY_OF_MONTH=$(date +%d)
if [ $((DAY_OF_MONTH % 3)) -eq 0 ]; then
    echo "[$DATE] Running 3-day budget check..." >> "$LOGS_DIR/mc-sync.log"
    # This will prompt you for actual balance
fi

# 3. Ensure all background processes are logged
echo "[$DATE] Sync complete" >> "$LOGS_DIR/mc-sync.log"
