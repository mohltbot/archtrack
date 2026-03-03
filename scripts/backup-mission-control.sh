#!/bin/bash
#
# Mission Control Backup Automation
# Creates daily backups of critical data to prevent loss
# 
# Usage: ./scripts/backup-mission-control.sh
# Cron: 0 3 * * * (daily at 3 AM)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "💾 Mission Control Backup"
echo "========================="
echo "Date: $DATE"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup file name
BACKUP_NAME="mission-control_backup_${TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo "📦 Creating backup archive..."

# Create tarball with critical files
tar -czf "${BACKUP_PATH}.tar.gz" \
  -C "$PROJECT_DIR" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='backups' \
  --exclude='*.log' \
  --exclude='.git' \
  mission-control/data \
  mission-control/docs \
  memory \
  relationships \
  workflows \
  vc-portfolio \
  scripts \
  logs/*.json 2>/dev/null || true

echo "✅ Backup created: ${BACKUP_NAME}.tar.gz"
echo "   Size: $(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)"

# Create manifest
cat > "${BACKUP_PATH}.manifest" <<EOF
Backup: $BACKUP_NAME
Created: $(date -Iseconds)
Size: $(du -b "${BACKUP_PATH}.tar.gz" | cut -f1) bytes
Source: $PROJECT_DIR
Files:
  - mission-control/data/*
  - mission-control/docs/*
  - memory/*
  - relationships/*
  - workflows/*
  - vc-portfolio/*
  - scripts/*
  - logs/*.json
EOF

echo "📝 Manifest created"

# Clean old backups (keep last 30 days)
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "mission-control_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "mission-control_backup_*.manifest" -mtime +$RETENTION_DAYS -delete
REMAINING=$(find "$BACKUP_DIR" -name "mission-control_backup_*.tar.gz" | wc -l)
echo "   $REMAINING backups retained (30-day retention)"

# Optional: Sync to cloud storage if rclone is configured
if command -v rclone &> /dev/null && [ -f "$HOME/.config/rclone/rclone.conf" ]; then
  echo "☁️  Syncing to cloud storage..."
  rclone copy "${BACKUP_PATH}.tar.gz" remote:mission-control-backups/ 2>/dev/null && \
    echo "   ✅ Cloud sync complete" || \
    echo "   ⚠️  Cloud sync skipped (configure rclone to enable)"
fi

echo ""
echo "✅ Backup complete!"
echo "   Location: $BACKUP_DIR"
echo "   Latest: ${BACKUP_NAME}.tar.gz"

# Health check: verify backup is readable
if tar -tzf "${BACKUP_PATH}.tar.gz" > /dev/null 2>&1; then
  echo "   Integrity: ✅ Verified"
else
  echo "   Integrity: ❌ Corrupted!"
  exit 1
fi
