#!/bin/bash
# OpenClaw Debugger - Proactive Work Sessions
# Runs 4x daily: 8 AM, 12 PM, 4 PM, 8 PM PST

export PATH="/usr/local/bin:$PATH"
export HOME="/Users/mohlt"

LOG_DIR="/Users/mohlt/.openclaw/workspace/logs"
mkdir -p "$LOG_DIR"

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
SHIFT_NUM=$1

echo "[$TIMESTAMP] Starting OpenClaw Debugger Shift $SHIFT_NUM" >> "$LOG_DIR/debugger-cron.log"

# Spawn sub-agent for this shift
openclaw sessions spawn \
  --runtime subagent \
  --mode run \
  --label "debugger-shift-$SHIFT_NUM" \
  --task "Read /Users/mohlt/.openclaw/workspace/business/openclaw-debugger/AGENT-PROMPT.md and execute Shift $SHIFT_NUM tasks. Work on the OpenClaw debugger business: outreach, content, follow-ups, or planning as specified in the prompt. Log all activity to memory/YYYY-MM-DD.md and update LEADS.md and CONTENT-QUEUE.md. Be proactive and autonomous." \
  >> "$LOG_DIR/debugger-cron.log" 2>&1

echo "[$TIMESTAMP] Completed Shift $SHIFT_NUM" >> "$LOG_DIR/debugger-cron.log"
