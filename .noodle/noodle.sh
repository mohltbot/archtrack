#!/bin/zsh
# noodle - Self-healing task scheduler
# Replaces launchd for OpenClaw task scheduling

NOODLE_DIR="/Users/mohlt/.openclaw/workspace/.noodle"
LOG_DIR="$NOODLE_DIR/logs"
mkdir -p "$LOG_DIR"

# Task definitions
# Format: name|schedule|command|last_run|status
declare -A TASKS=(
  ["bensbites-wed"]="0 6 * * 4|$WORKSPACE/scripts/bensbites-scanner.sh|never|pending"
  ["bensbites-fri"]="0 6 * * 6|$WORKSPACE/scripts/bensbites-scanner.sh|never|pending"
  ["moonshot-sync"]="0 */6 * * *|$WORKSPACE/scripts/moonshot-sync.sh|never|pending"
  ["ghost-shift"]="0 2 * * *|$WORKSPACE/scripts/ghost-shift.sh|never|pending"
)

# Self-healing: Check if tasks ran
self_heal() {
  local task_name=$1
  local last_run_file="$NOODLE_DIR/.last_run_$task_name"
  
  if [ -f "$last_run_file" ]; then
    local last_run=$(cat "$last_run_file")
    local now=$(date +%s)
    local diff=$((now - last_run))
    
    # If task hasn't run in 2x expected interval, mark as failed
    if [ $diff -gt 7200 ]; then # 2 hours
      echo "⚠️  Task $task_name hasn't run recently (last: $last_run)"
      return 1
    fi
  fi
  
  return 0
}

# Run task with error handling
run_task() {
  local name=$1
  local command=$2
  local log_file="$LOG_DIR/${name}-$(date +%Y%m%d).log"
  
  echo "[$(date)] Running $name..." >> "$log_file"
  
  if eval "$command" >> "$log_file" 2>&1; then
    echo "[$(date)] ✅ $name completed" >> "$log_file"
    date +%s > "$NOODLE_DIR/.last_run_$name"
    return 0
  else
    echo "[$(date)] ❌ $name failed" >> "$log_file"
    return 1
  fi
}

# Backlog sync: Queue missed tasks
backlog_sync() {
  local backlog_file="$NOODLE_DIR/backlog.txt"
  
  for task_name in ${(k)TASKS}; do
    IFS='|' read -r schedule command last_run task_status <<< "${TASKS[$task_name]}"
    
    if ! self_heal "$task_name"; then
      echo "$(date +%s)|$task_name|$command" >> "$backlog_file"
      echo "📝 Added $task_name to backlog"
    fi
  done
  
  # Process backlog
  if [ -f "$backlog_file" ]; then
    while IFS='|' read -r timestamp task_name command; do
      echo "🔄 Processing backlog: $task_name"
      run_task "$task_name" "$command"
    done < "$backlog_file"
    
    # Clear processed backlog
    > "$backlog_file"
  fi
}

# Main scheduler loop
run_scheduler() {
  echo "🍜 noodle scheduler started at $(date)"
  
  while true; do
    backlog_sync
    
    # Check each task
    for task_name in ${(k)TASKS}; do
      IFS='|' read -r schedule command last_run task_status <<< "${TASKS[$task_name]}"
      
      # Simple cron-like matching (simplified)
      current_min=$(date +%M)
      current_hour=$(date +%H)
      current_dow=$(date +%u) # 1-7, Monday=1
      
      if should_run "$schedule" "$current_min" "$current_hour" "$current_dow"; then
        run_task "$task_name" "$command" &
      fi
    done
    
    # Sleep for 1 minute
    sleep 60
  done
}

# Check if task should run now
should_run() {
  local schedule=$1
  local min=$2
  local hour=$3
  local dow=$4
  
  IFS=' ' read -r s_min s_hour s_dom s_month s_dow <<< "$schedule"
  
  # Simplified: only check hour and minute match
  if [ "$s_min" = "$min" ] && [ "$s_hour" = "$hour" ]; then
    return 0
  fi
  
  return 1
}

# CLI commands
case "${1:-run}" in
  run)
    run_scheduler
    ;;
  status)
    echo "🍜 noodle task status:"
    for task_name in ${(k)TASKS}; do
      IFS='|' read -r schedule command last_run task_status <<< "${TASKS[$task_name]}"
      last_run_time=$(cat "$NOODLE_DIR/.last_run_$task_name" 2>/dev/null || echo "never")
      echo "  $task_name: last_run=$last_run_time, schedule=$schedule"
    done
    ;;
  heal)
    echo "🩹 Running self-heal check..."
    backlog_sync
    ;;
  *)
    echo "Usage: noodle [run|status|heal]"
    exit 1
    ;;
esac
