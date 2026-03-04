#!/bin/zsh
# Memory Synthesizer Agent
# Reads daily memory files and updates MEMORY.md

WORKSPACE="/Users/mohlt/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
LOG_FILE="$WORKSPACE/logs/agents/memory-synth-$(date +%Y%m%d-%H%M).log"

mkdir -p "$WORKSPACE/logs/agents"

echo "[$(date)] Memory Synthesizer Agent starting..." >> "$LOG_FILE"

# Find recent memory files (last 7 days)
RECENT_FILES=$(find "$MEMORY_DIR" -name "2026-*.md" -mtime -7 2>/dev/null | sort)

if [ -z "$RECENT_FILES" ]; then
  echo "No recent memory files found" >> "$LOG_FILE"
  exit 0
fi

echo "Processing $(echo "$RECENT_FILES" | wc -l) memory files..." >> "$LOG_FILE"

# Extract key decisions and learnings
for file in $RECENT_FILES; do
  echo "Processing: $(basename $file)" >> "$LOG_FILE"
  
  # Extract completed tasks
  grep -E "^- \[x\]" "$file" 2>/dev/null >> "$WORKSPACE/logs/agents/completed-tasks.txt"
  
  # Extract decisions (lines with "Decision:" or similar)
  grep -iE "(decision|key takeaway|lesson learned|important)" "$file" 2>/dev/null >> "$WORKSPACE/logs/agents/key-decisions.txt"
done

echo "[$(date)] Memory Synthesizer Agent complete" >> "$LOG_FILE"
echo "✅ Synthesized $(echo "$RECENT_FILES" | wc -l) daily memories" >> "$LOG_FILE"
