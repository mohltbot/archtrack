#!/bin/zsh
# PR Review Agent
# Auto-reviews GitHub PRs for common issues

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/agents/pr-review-$(date +%Y%m%d-%H%M).log"

mkdir -p "$WORKSPACE/logs/agents"

echo "[$(date)] PR Review Agent starting..." >> "$LOG_FILE"

# Check for open PRs
REPO="mohltbot/mission-control"
PRS=$(gh pr list --repo "$REPO" --state open --json number,title,headRefName 2>/dev/null | jq -r '.[] | "\(.number): \(.title)"' 2>/dev/null)

if [ -z "$PRS" ]; then
  echo "No open PRs to review" >> "$LOG_FILE"
  exit 0
fi

echo "Found $(echo "$PRS" | wc -l) open PRs" >> "$LOG_FILE"

# Review each PR
for pr_info in $PRS; do
  PR_NUM=$(echo "$pr_info" | cut -d: -f1)
  echo "Reviewing PR #$PR_NUM..." >> "$LOG_FILE"
  
  # Check for secrets in diff
  DIFF=$(gh pr diff "$PR_NUM" --repo "$REPO" 2>/dev/null)
  
  if echo "$DIFF" | grep -qE "(api[_-]?key|secret|password|token)"; then
    echo "⚠️  PR #$PR_NUM: May contain secrets - manual review required" >> "$LOG_FILE"
  fi
  
  # Check for JSON/YAML syntax
  if echo "$DIFF" | grep -qE "\.json|\.yaml|\.yml"; then
    echo "✅ PR #$PR_NUM: Contains config files - validate syntax" >> "$LOG_FILE"
  fi
done

echo "[$(date)] PR Review Agent complete" >> "$LOG_FILE"
