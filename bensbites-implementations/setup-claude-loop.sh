#!/bin/bash
# Claude Code Loop Integration for Ghost Shifts
# Implements /loop skill for recurring tasks
# Source: Ben's Bites March 11, 2026 - Claude Code /loop

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOGS_DIR="$WORKSPACE/logs"
DATE=$(date +%Y-%m-%d)

mkdir -p "$LOGS_DIR"

echo "[$(date)] Setting up Claude Code /loop for ghost shifts..." >> "$LOGS_DIR/claude-loop.log"

# Create loop configuration for daily ghost shifts
cat > "$WORKSPACE/.claude/loop-config.json" << 'EOF'
{
  "loops": [
    {
      "name": "morning-check",
      "schedule": "0 9 * * *",
      "task": "Check Mission Control for urgent tasks and API budget",
      "duration": "10m"
    },
    {
      "name": "midday-check", 
      "schedule": "0 12 * * *",
      "task": "Quick 10-min check for urgent items",
      "duration": "10m"
    },
    {
      "name": "ghost-shift",
      "schedule": "0 2 * * *",
      "task": "Full ghost shift: review, implement, create PRs",
      "duration": "60m"
    }
  ],
  "maxDuration": "3d",
  "autoExtend": false
}
EOF

echo "[$(date)] Claude Code /loop config created" >> "$LOGS_DIR/claude-loop.log"
echo "To activate: claude /loop --config .claude/loop-config.json"
