#!/bin/zsh
# Record Memory - Save important context to memory system

MEMORY_DIR="/Users/mohlt/.openclaw/workspace/memory"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Ensure memory directory exists
mkdir -p "$MEMORY_DIR"

# Create daily memory file if it doesn't exist
if [ ! -f "$MEMORY_DIR/$DATE.md" ]; then
  cat > "$MEMORY_DIR/$DATE.md" << EOF
# Memory Log - $DATE

**Date:** $(date "+%B %d, %Y (%A)")  
**Time:** Started at $(date "+%I:%M %p %Z")

---

## Today's Events

EOF
fi

# Function to append to today's memory
record_memory() {
  local content="$1"
  echo "$content" >> "$MEMORY_DIR/$DATE.md"
}

# Function to record a decision
record_decision() {
  local decision="$1"
  local reason="$2"
  
  cat >> "$MEMORY_DIR/$DATE.md" << EOF

### Decision: $decision
**Time:** $(date "+%I:%M %p")
**Reason:** $reason

EOF
}

# Function to record a task completion
record_task() {
  local task="$1"
  local status="$2"
  
  cat >> "$MEMORY_DIR/$DATE.md" << EOF

### Task: $task
**Status:** $status
**Time:** $(date "+%I:%M %p")

EOF
}

# Function to record an insight/lesson
record_insight() {
  local insight="$1"
  
  cat >> "$MEMORY_DIR/$DATE.md" << EOF

### 💡 Insight
$insight

**Time:** $(date "+%I:%M %p")

EOF
}

# If called with arguments, record them
if [ $# -gt 0 ]; then
  TYPE="$1"
  shift
  
  case "$TYPE" in
    event)
      record_memory "$@"
      ;;
    decision)
      record_decision "$1" "$2"
      ;;
    task)
      record_task "$1" "$2"
      ;;
    insight)
      record_insight "$@"
      ;;
    *)
      echo "Usage: $0 {event|decision|task|insight} [args...]"
      exit 1
      ;;
  esac
fi

# Git commit memory files
cd /Users/mohlt/.openclaw/workspace
if git diff --quiet HEAD -- memory/ MEMORY.md 2>/dev/null; then
  # No changes
  exit 0
fi

git add memory/ MEMORY.md
git commit -m "Update memories: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true
