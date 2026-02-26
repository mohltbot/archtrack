#!/bin/zsh
# Mid-Day Check - Runs at 12 PM PST
# Quick status check

cd /Users/mohlt/.openclaw/workspace

# Spawn sub-agent for quick check
openclaw sessions_spawn --mode run --task "Quick mid-day check: Review Mission Control, check API spend vs budget, look for any urgent tasks. Report if anything needs attention." --timeout 600
