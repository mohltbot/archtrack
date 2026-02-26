#!/bin/zsh
# Nightly Work Session - Runs at 2 AM PST
# This script spawns a sub-agent to do autonomous work

cd /Users/mohlt/.openclaw/workspace

# Use full path to openclaw or npx
OPENCLAW_CMD="/opt/homebrew/bin/openclaw"
if [ ! -f "$OPENCLAW_CMD" ]; then
    OPENCLAW_CMD="/usr/local/bin/openclaw"
fi
if [ ! -f "$OPENCLAW_CMD" ]; then
    OPENCLAW_CMD="npx openclaw"
fi

# Log to nightly.log
echo "[$(date)] Starting nightly work session..." >> logs/nightly.log

# Spawn sub-agent for nightly work
$OPENCLAW_CMD sessions_spawn --mode run --task "Read HEARTBEAT.md and execute the Nightly Work Session checklist. Review Mission Control dashboard, check for pending tasks, pick highest priority item, and do 30-60 minutes of focused work. Report progress when done." --timeout 3600 2>> logs/nightly-error.log
