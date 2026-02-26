#!/bin/zsh
# Nightly Work Session - Runs at 2 AM PST
# This script spawns a sub-agent to do autonomous work

cd /Users/mohlt/.openclaw/workspace

# Spawn sub-agent for nightly work
openclaw sessions_spawn --mode run --task "Read HEARTBEAT.md and execute the Nightly Work Session checklist. Review Mission Control dashboard, check for pending tasks, pick highest priority item, and do 30-60 minutes of focused work. Report progress when done." --timeout 3600
