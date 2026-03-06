#!/bin/zsh
# Background Agents Runner
# Runs all background agents

WORKSPACE="/Users/mohlt/.openclaw/workspace"
AGENTS_DIR="$WORKSPACE/agents"
LOG_DIR="$WORKSPACE/logs/agents"

mkdir -p "$LOG_DIR"

echo "[$(date)] Background Agents Runner starting..."

# Run each agent
for agent in "$AGENTS_DIR"/*.sh; do
  if [ -f "$agent" ]; then
    agent_name=$(basename "$agent" .sh)
    echo "Running $agent_name..."
    zsh "$agent" 2>&1 | tee -a "$LOG_DIR/runner-$(date +%Y%m%d).log"
  fi
done

echo "[$(date)] Background Agents Runner complete"
