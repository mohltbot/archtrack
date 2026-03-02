#!/bin/bash
# Ghost Shift Expense Logger
# Automatically logs API expenses from the Ghost Shift session
# 
# Usage: ./scripts/ghost-shift-log.sh <tokens-in> <tokens-out> <description>
# Example: ./scripts/ghost-shift-log.sh 63500 7500 "Ghost shift - diagnostics API + expense automation"

TOKENS_IN=${1:-0}
TOKENS_OUT=${2:-0}
DESCRIPTION=${3:-"Ghost Shift session"}

# Default to Moonshot/Kimi for Ghost Shift
node scripts/log-expense.mjs \
  --provider=moonshot \
  --model=kimi-k2.5 \
  --tokens-in=$TOKENS_IN \
  --tokens-out=$TOKENS_OUT \
  --description="$DESCRIPTION"
