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

# NOTE: This script is called by launchd but actual spawning is done via OpenClaw Gateway API
# The openclaw CLI doesn't support sessions spawn directly
# For manual runs, use: openclaw agent --message "..."
echo "[$TIMESTAMP] Shift $SHIFT_NUM triggered via launchd" >> "$LOG_DIR/debugger-cron.log"
echo "[$TIMESTAMP] Use Control UI or 'openclaw agent' command to execute shift tasks" >> "$LOG_DIR/debugger-cron.log"

echo "[$TIMESTAMP] Completed Shift $SHIFT_NUM" >> "$LOG_DIR/debugger-cron.log"
