# Log Rotation System

Automated log management for Mission Control to prevent disk space issues and maintain system hygiene.

## Overview

- **Archives** logs older than 30 days (compresses with gzip)
- **Deletes** archived logs older than 90 days
- **Runs** daily at 2:00 AM via launchd
- **Tracks** all rotations in `logs/rotation-history.log`

## Files

| File | Purpose |
|------|---------|
| `scripts/log-rotate.sh` | Main rotation script |
| `scripts/log-rotate.plist` | macOS launchd config |
| `logs/archive/` | Compressed log archives |
| `logs/rotation-history.log` | Rotation audit trail |

## Installation

```bash
# Load the launchd job
launchctl load /Users/mohlt/.openclaw/workspace/scripts/log-rotate.plist

# Verify it's loaded
launchctl list | grep com.mohltbot.logrotate

# Run manually (for testing)
bash /Users/mohlt/.openclaw/workspace/scripts/log-rotate.sh
```

## Manual Run

```bash
bash /Users/mohlt/.openclaw/workspace/scripts/log-rotate.sh
```

## Configuration

Edit `scripts/log-rotate.sh` to adjust:

- `DAYS_TO_ARCHIVE=30` — How long to keep uncompressed logs
- `DAYS_TO_DELETE=90` — How long to keep archived logs

## Output Example

```
🔄 Log Rotation Started: Fri Mar  6 14:30:00 PST 2026
================================
Found 15 log files in /Users/mohlt/.openclaw/workspace/logs
Archived: ghost-shift-2026-02-01.log → logs/archive/ghost-shift-2026-02-01_20260306_143000.gz
✓ Archived 1 log file(s)
No old archives to delete (none older than 90 days)

📊 Rotation Summary
===================
Files archived: 1
Files deleted: 0
Current log dir size: 2.4M
Archive dir size: 156M

✅ Log rotation completed: Fri Mar  6 14:30:05 PST 2026
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission denied | Ensure script is executable: `chmod +x scripts/log-rotate.sh` |
| Not running automatically | Check launchd: `launchctl list \| grep logrotate` |
| Disk still full | Reduce `DAYS_TO_ARCHIVE` to archive more aggressively |

## Added

- Created: March 6, 2026 (Ghost Shift)
- Status: ✅ Ready for installation
