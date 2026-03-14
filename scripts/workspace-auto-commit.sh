#!/bin/bash
# Workspace Auto-Commit Script
# Automatically commits workspace configuration files to prevent untracked file accumulation
# Run this daily or add to cron

set -e

REPO_DIR="/Users/mohlt/.openclaw/workspace"
LOG_FILE="$REPO_DIR/logs/workspace-auto-commit.log"

# Create log directory if needed
mkdir -p "$REPO_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cd "$REPO_DIR"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    log "ERROR: Not a git repository"
    exit 1
fi

# Get current status
UNTRACKED=$(git status --short | grep "^??" | wc -l)
MODIFIED=$(git status --short | grep "^ M" | wc -l)

log "Starting workspace auto-commit..."
log "Untracked files: $UNTRACKED, Modified files: $MODIFIED"

# Files to auto-commit (safe, non-sensitive configs)
SAFE_PATTERNS=(
    "AGENTS.md"
    "SOUL.md"
    "TOOLS.md"
    "USER.md"
    "IDENTITY.md"
    "HEARTBEAT.md"
    "STATUS.md"
    "memory/*.md"
    "business/**/*.md"
    "arch-firm-dashboard/*.md"
    "arch-firm-dashboard/admin/**"
    "docs/**/*.md"
)

# Add safe files
ADDED_COUNT=0
for pattern in "${SAFE_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] || [ -d "$file" ]; then
            if git status --short "$file" | grep -q "^??\|^ M"; then
                git add "$file" 2>/dev/null && ((ADDED_COUNT++)) || true
            fi
        fi
    done
done

# Check if there are staged changes
if git diff --cached --quiet; then
    log "No changes to commit"
    exit 0
fi

# Commit with timestamp
COMMIT_MSG="chore(workspace): auto-commit configs [$(date '+%Y-%m-%d %H:%M')]"
git commit -m "$COMMIT_MSG" -m "Auto-committed workspace configuration files" -m "Files: $ADDED_COUNT" || {
    log "ERROR: Commit failed"
    exit 1
}

log "SUCCESS: Committed $ADDED_COUNT files"
log "Commit: $(git rev-parse --short HEAD)"

# Push if remote is configured
if git remote get-url origin >/dev/null 2>&1; then
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || {
        log "WARNING: Push failed (may need manual push)"
    }
    log "Changes pushed to remote"
else
    log "No remote configured, commit is local only"
fi

exit 0
