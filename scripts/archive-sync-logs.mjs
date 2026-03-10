#!/usr/bin/env node
/**
 * Archive Old 4-Hour Sync Logs
 * 
 * Moves 4-hour sync entries older than 7 days from mission-control.md
 * to archived files in logs/history/
 * 
 * Usage: node scripts/archive-sync-logs.mjs [days-to-keep]
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);

const DAYS_TO_KEEP = parseInt(process.argv[2] || '7', 10);
const CUTOFF_DATE = new Date();
CUTOFF_DATE.setDate(CUTOFF_DATE.getDate() - DAYS_TO_KEEP);

const MISSION_CONTROL_PATH = `${ROOT}/mission-control.md`;
const HISTORY_DIR = `${ROOT}/logs/history`;

async function ensureDir(path) {
  try {
    await access(path);
  } catch {
    await mkdir(path, { recursive: true });
  }
}

function parseSyncEntries(content) {
  const entries = [];
  const lines = content.split('\n');
  let currentEntry = null;
  let currentContent = [];
  let inEntry = false;
  
  for (const line of lines) {
    // Detect 4-hour sync entry headers
    const syncMatch = line.match(/^## ✅ (4-HOUR SYNC|GHOST SHIFT) — (.+)$/);
    
    if (syncMatch) {
      // Save previous entry if exists
      if (currentEntry) {
        currentEntry.content = currentContent.join('\n');
        entries.push(currentEntry);
      }
      
      // Start new entry
      const entryType = syncMatch[1];
      const dateStr = syncMatch[2];
      currentEntry = {
        type: entryType,
        date: dateStr,
        header: line,
        content: '',
        rawDate: parseDate(dateStr)
      };
      currentContent = [line];
      inEntry = true;
    } else if (inEntry) {
      // Check for end of entry (next major section)
      if (line.match(/^## [^#]/)) {
        if (currentEntry) {
          currentEntry.content = currentContent.join('\n');
          entries.push(currentEntry);
          currentEntry = null;
          currentContent = [];
        }
        inEntry = false;
      } else {
        currentContent.push(line);
      }
    }
  }
  
  // Don't forget last entry
  if (currentEntry) {
    currentEntry.content = currentContent.join('\n');
    entries.push(currentEntry);
  }
  
  return entries;
}

function parseDate(dateStr) {
  // Parse "Mar 10, 2026 (3:04 AM)" format
  const match = dateStr.match(/([A-Za-z]+)\s+(\d+),\s+(\d+)/);
  if (match) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames.indexOf(match[1]);
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

async function archiveEntries(entriesToArchive) {
  if (entriesToArchive.length === 0) {
    console.log('No entries to archive.');
    return;
  }
  
  await ensureDir(HISTORY_DIR);
  
  // Group entries by month
  const byMonth = {};
  for (const entry of entriesToArchive) {
    const monthKey = entry.rawDate.toISOString().slice(0, 7); // YYYY-MM
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = [];
    }
    byMonth[monthKey].push(entry);
  }
  
  // Write archive files
  for (const [month, monthEntries] of Object.entries(byMonth)) {
    const archivePath = `${HISTORY_DIR}/sync-logs-${month}.md`;
    
    let archiveContent = `# Sync Log Archive - ${month}\n\n`;
    archiveContent += `*Archived on ${new Date().toISOString().split('T')[0]}*\n\n`;
    archiveContent += `---\n\n`;
    
    for (const entry of monthEntries.sort((a, b) => b.rawDate - a.rawDate)) {
      archiveContent += entry.content + '\n\n---\n\n';
    }
    
    await writeFile(archivePath, archiveContent);
    console.log(`  → Archived ${monthEntries.length} entries to ${archivePath}`);
  }
}

async function main() {
  console.log(`📦 Archiving 4-hour sync logs older than ${DAYS_TO_KEEP} days...`);
  console.log(`   Cutoff date: ${CUTOFF_DATE.toDateString()}`);
  console.log('');
  
  const content = await readFile(MISSION_CONTROL_PATH, 'utf-8');
  const entries = parseSyncEntries(content);
  
  console.log(`Found ${entries.length} total sync entries`);
  
  const entriesToKeep = [];
  const entriesToArchive = [];
  
  for (const entry of entries) {
    if (entry.rawDate < CUTOFF_DATE) {
      entriesToArchive.push(entry);
    } else {
      entriesToKeep.push(entry);
    }
  }
  
  console.log(`  → ${entriesToKeep.length} entries to keep (newer than cutoff)`);
  console.log(`  → ${entriesToArchive.length} entries to archive`);
  console.log('');
  
  if (entriesToArchive.length > 0) {
    await archiveEntries(entriesToArchive);
    console.log('');
    console.log('✅ Archival complete');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review the archived files in logs/history/');
    console.log('  2. Manually remove archived entries from mission-control.md');
    console.log('  3. Commit the changes');
  } else {
    console.log('✅ Nothing to archive');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
