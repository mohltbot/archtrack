#!/bin/bash
# Backup all Mission Control data
# Usage: ./backup-mission-control.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/Users/mohlt/.openclaw/backups/$DATE"

echo "💾 Backing up Mission Control..."
mkdir -p "$BACKUP_DIR"

# Backup data
cp -r /Users/mohlt/.openclaw/workspace/mission-control/data "$BACKUP_DIR/" 2>/dev/null

# Backup configs
cp -r /Users/mohlt/.openclaw/workspace/config "$BACKUP_DIR/" 2>/dev/null

# Backup workflows
cp -r /Users/mohlt/.openclaw/workspace/vc-portfolio "$BACKUP_DIR/" 2>/dev/null

# Backup scripts
cp -r /Users/mohlt/.openclaw/workspace/scripts "$BACKUP_DIR/" 2>/dev/null

# Create manifest
cat > "$BACKUP_DIR/manifest.txt" << EOF
Mission Control Backup
Date: $(date)
Backup ID: $DATE

Contents:
- data/ : Mission Control database
- config/ : Configuration files
- vc-portfolio/ : All workflow templates
- scripts/ : Automation scripts

Restore: cp -r $BACKUP_DIR/* /Users/mohlt/.openclaw/workspace/
EOF

echo "✅ Backup complete: $BACKUP_DIR"
echo "Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
