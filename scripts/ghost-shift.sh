#!/bin/zsh
# Ghost-Shift - Autonomous Work Session (Every 12 Hours)
# Runs at 12pm and 12am PST
# Reads Mission Control, executes AI-Ready tasks, reports to Discord

cd /Users/mohlt/.openclaw/workspace

# Determine session type based on hour
HOUR=$(date +%H)
if [ "$HOUR" -eq "00" ]; then
    SESSION_TYPE="Midnight"
    EMOJI="🌙"
else
    SESSION_TYPE="Midday"
    EMOJI="☀️"
fi

# Log file with date
LOG_FILE="logs/ghost-shift-$(date +%Y-%m-%d).log"
mkdir -p logs

echo "[$EMOJI $(date)] Ghost-Shift $SESSION_TYPE session starting..." >> "$LOG_FILE"

# Read Mission Control and find pending tasks
MC_DATA="/Users/mohlt/.openclaw/workspace/mission-control/data/db.json"

if [ ! -f "$MC_DATA" ]; then
    echo "[❌ $(date)] Mission Control data not found" >> "$LOG_FILE"
    exit 1
fi

# Use node to analyze tasks and generate work report
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$MC_DATA', 'utf8'));

const pending = data.tasks.filter(t => t.status === 'pending' || t.status === 'active');
const highPriority = pending.filter(t => t.priority === 'high');

console.log('GHOST-SHIFT REPORT');
console.log('═══════════════════════════════════════');
console.log('Session: $SESSION_TYPE at $(date)');
console.log('Pending tasks:', pending.length);
console.log('High priority:', highPriority.length);
console.log('');

if (highPriority.length > 0) {
    console.log('TOP PRIORITY TASKS:');
    highPriority.slice(0, 5).forEach((t, i) => {
        console.log(\`\${i+1}. [\${t.status.toUpperCase()}] \${t.title}\`);
        console.log(\`   Category: \${t.category} | ID: \${t.id}\`);
    });
} else {
    console.log('No high-priority tasks pending.');
}
" >> "$LOG_FILE" 2>&1

echo "" >> "$LOG_FILE"
echo "[✅ $(date)] Ghost-Shift report generated" >> "$LOG_FILE"
echo "📊 Check $LOG_FILE for details" >> "$LOG_FILE"

# Future: Add Discord notification here
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Ghost-Shift '$SESSION_TYPE' complete. Check logs."}' \
#   "$DISCORD_WEBHOOK" 2>/dev/null

exit 0
