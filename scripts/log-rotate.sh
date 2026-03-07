#!/bin/bash
# Log Rotation Script for Mission Control
# Archives old logs, compresses them, and cleans up ancient ones
# Run via cron: 0 2 * * * /bin/bash /Users/mohlt/.openclaw/workspace/scripts/log-rotate.sh

set -euo pipefail

# Configuration
LOG_DIR="/Users/mohlt/.openclaw/workspace/logs"
ARCHIVE_DIR="/Users/mohlt/.openclaw/workspace/logs/archive"
DAYS_TO_ARCHIVE=30
DAYS_TO_DELETE=90
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔄 Log Rotation Started: $(date)"
echo "================================"

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Count current log files
LOG_COUNT=$(find "$LOG_DIR" -maxdepth 1 -name "*.log" -type f 2>/dev/null | wc -l)
echo -e "${GREEN}Found $LOG_COUNT log files in $LOG_DIR${NC}"

# Step 1: Archive logs older than DAYS_TO_ARCHIVE
ARCHIVED=0
while IFS= read -r file; do
    if [ -n "$file" ]; then
        BASENAME=$(basename "$file")
        ARCHIVE_NAME="${ARCHIVE_DIR}/${BASENAME%.log}_${DATE}.gz"
        
        # Compress and move to archive
        gzip -c "$file" > "$ARCHIVE_NAME"
        rm "$file"
        
        echo -e "${YELLOW}Archived:${NC} $BASENAME → $ARCHIVE_NAME"
        ((ARCHIVED++)) || true
    fi
done < <(find "$LOG_DIR" -maxdepth 1 -name "*.log" -type f -mtime +$DAYS_TO_ARCHIVE 2>/dev/null)

if [ $ARCHIVED -eq 0 ]; then
    echo -e "${GREEN}No logs to archive (none older than $DAYS_TO_ARCHIVE days)${NC}"
else
    echo -e "${GREEN}✓ Archived $ARCHIVED log file(s)${NC}"
fi

# Step 2: Clean up ancient archives older than DAYS_TO_DELETE
DELETED=0
while IFS= read -r file; do
    if [ -n "$file" ]; then
        rm "$file"
        echo -e "${RED}Deleted:${NC} $(basename "$file") (older than $DAYS_TO_DELETE days)"
        ((DELETED++)) || true
    fi
done < <(find "$ARCHIVE_DIR" -name "*.gz" -type f -mtime +$DAYS_TO_DELETE 2>/dev/null)

if [ $DELETED -eq 0 ]; then
    echo -e "${GREEN}No old archives to delete (none older than $DAYS_TO_DELETE days)${NC}"
else
    echo -e "${GREEN}✓ Deleted $DELETED old archive(s)${NC}"
fi

# Step 3: Generate summary report
ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)
CURRENT_SIZE=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)

echo ""
echo "📊 Rotation Summary"
echo "==================="
echo -e "Files archived: $ARCHIVED"
echo -e "Files deleted: $DELETED"
echo -e "Current log dir size: $CURRENT_SIZE"
echo -e "Archive dir size: $ARCHIVE_SIZE"
echo ""
echo "✅ Log rotation completed: $(date)"

# Log to rotation log
ROTATION_LOG="$LOG_DIR/rotation-history.log"
echo "[$DATE] Archived: $ARCHIVED, Deleted: $DELETED, ArchiveSize: $ARCHIVE_SIZE" >> "$ROTATION_LOG"
