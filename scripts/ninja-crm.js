#!/usr/bin/env node
/**
 * Relationship Ninja CRM - v5 (Using csv-parse library)
 * Analyzes Google Sheet contacts, identifies The Siegfried 12
 */

const https = require('https');
const { parse } = require('csv-parse/sync');

// Configuration
const DISCORD_WEBHOOK = process.env.DISCORD_NINJA_CRM_WEBHOOK || '';
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1BgOdW3dBF1e7yYRz0wGC9TN75QcHRgsl/export?format=csv';

// Target profile criteria
const TARGET_PROFILE = {
  big4Firms: ['deloitte', 'pwc', 'ey ', 'ey/', 'ernst', 'kpmg', 'klynveld'],
  cpaTrack: ['working toward', 'in progress', 'cpa candidate', 'studying', 'cpa track', 'cpa eligible'],
  priorityFlags: ['d beaker', 'dbeaker', 'opt-in', 'opt in', 'interested', 'recruit', 'prospect'],
  exclude: ['current siegfried', 'siegfried employee', 'do not contact', 'dnc']
};

function parseCSV(csvText) {
  // Parse with proper CSV handling
  const records = parse(csvText, {
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    bom: true
  });
  
  const contacts = [];
  
  // Find header row (contains "First Name")
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(25, records.length); i++) {
    if (records[i][1] === 'First Name' || records[i][0] === 'First Name') {
      headerRowIdx = i;
      break;
    }
  }
  
  if (headerRowIdx === -1) {
    console.log('⚠️  Could not find header row');
    return [];
  }
  
  // Data starts after header row
  for (let i = headerRowIdx + 1; i < records.length; i++) {
    const row = records[i];
    
    // Skip rows without a row number or name
    const rowNum = row[0];
    const firstName = row[1];
    const lastName = row[2];
    
    if (!rowNum || isNaN(parseInt(rowNum))) continue;
    if (!firstName || firstName === 'First Name') continue;
    
    contacts.push({
      row: parseInt(rowNum),
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      location: row[3] ? row[3].trim() : '',
      employer: row[4] ? row[4].trim() : '',
      title: row[5] ? row[5].trim() : '',
      relationshipType: row[6] ? row[6].trim() : '',
      beakerB: row[7] ? row[7].trim() : '',
      beakerC: row[8] ? row[8].trim() : '',
      beakerD: row[9] ? row[9].trim() : '',
      dTiming: row[10] ? row[10].trim() : '',
      dBeakerOptIn: row[11] ? row[11].trim() : '',
      priorityLevel: row[12] ? row[12].trim() : '',
      notes: row[42] ? row[42].trim() : '' // Notes column
    });
  }
  
  return contacts;
}

function scoreContact(contact) {
  const name = `${contact.firstName} ${contact.lastName}`.trim();
  const employer = contact.employer.toLowerCase();
  const title = contact.title.toLowerCase();
  const priority = contact.priorityLevel.toLowerCase();
  const notes = contact.notes.toLowerCase();
  const dBeaker = contact.dBeakerOptIn.toLowerCase();
  
  let score = 0;
  let reasons = [];
  
  // Big 4 current employer
  if (TARGET_PROFILE.big4Firms.some(firm => employer.includes(firm))) {
    score += 5;
    reasons.push('🎯 Currently at Big 4');
    
    // Senior/Manager level bonus
    if (title.includes('senior') || title.includes('manager') || title.includes('experienced')) {
      score += 2;
      reasons.push('Senior/Mgr level');
    }
  }
  
  // D Beaker column
  if (contact.beakerD === 'D' || contact.beakerD === 'BD') {
    score += 3;
    reasons.push('D Beaker flagged');
  }
  
  // D Beaker Opt-in (CRITICAL)
  if (dBeaker.includes('yes') || dBeaker.includes('opt')) {
    score += 6;
    reasons.push('✅ D BEAKER OPT-IN');
  }
  
  // D Timing (Prospects)
  if (contact.dTiming && contact.dTiming !== '' && contact.dTiming !== 'BD') {
    score += 3;
    reasons.push(`⏰ Timing: ${contact.dTiming}`);
  }
  
  // Priority Level
  if (priority.includes('priority') || contact.priorityLevel === 'Priority Relationship') {
    score += 3;
    reasons.push('Priority Relationship');
  }
  
  // Notes analysis
  if (TARGET_PROFILE.priorityFlags.some(flag => notes.includes(flag))) {
    score += 2;
    reasons.push('Interest in notes');
  }
  
  if (TARGET_PROFILE.cpaTrack.some(term => notes.includes(term) || title.includes(term))) {
    score += 2;
    reasons.push('CPA track');
  }
  
  // Exclude current Siegfried employees
  if (employer.includes('siegfried')) {
    return { score: -1, reasons: ['❌ Current Siegfried employee'], name, contact, excluded: true };
  }
  
  return { score, reasons, name, contact, excluded: false };
}

async function downloadCSV() {
  return new Promise((resolve, reject) => {
    console.log('📥 Downloading Beaker Tracker data...\n');
    
    const url = new URL(SHEET_CSV_URL);
    
    https.get({
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    }, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
          let data = '';
          res2.on('data', chunk => data += chunk);
          res2.on('end', () => resolve(data));
        }).on('error', reject);
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

async function postToDiscord(contacts, siegfriedCount, totalScanned) {
  const topContacts = contacts.filter(c => !c.excluded).slice(0, 12);
  
  console.log('\n🏆 THE SIEGFRIED 12 - TOP PROSPECTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (topContacts.length === 0) {
    console.log('No high-scoring prospects found.');
  } else {
    topContacts.forEach((c, i) => {
      const num = String(i + 1).padStart(2);
      const name = c.name.padEnd(20);
      const emp = c.contact.employer.substring(0, 18).padEnd(18);
      const score = String(c.score).padStart(2);
      console.log(`${num}. ${name} | ${emp} | Score: ${score}/20`);
      console.log(`    ${c.reasons.join(' • ')}`);
    });
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Summary: ${topContacts.length} prospects | ${siegfriedCount} Siegfried employees | ${totalScanned} total`);
  
  if (!DISCORD_WEBHOOK) return;
  
  // Discord webhook
  const url = new URL(DISCORD_WEBHOOK);
  const fields = topContacts.slice(0, 12).map((c, i) => ({
    name: `#${i + 1} ${c.name.substring(0, 25)}`,
    value: `🏢 ${c.contact.employer.substring(0, 20)}\n⭐ Score: ${c.score}/20\n${c.reasons.slice(0, 3).join('\n')}`,
    inline: i < 6
  }));
  
  const content = {
    username: "Relationship Ninja 🥷",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    embeds: [{
      title: `🎯 Siegfried 12 Analysis`,
      color: 0xff6600,
      description: `**${topContacts.length}** prospects | **${siegfriedCount}** Siegfried | **${totalScanned}** total`,
      fields: fields.length > 0 ? fields : [{ name: 'No prospects found', value: 'Adjust scoring criteria', inline: false }],
      footer: { text: "Goal: Identify 12 → Cultivate → Recruit 3" },
      timestamp: new Date().toISOString()
    }]
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      if (res.statusCode === 204) {
        console.log('✅ Posted to Discord #ninja-crm');
        resolve();
      } else {
        reject(new Error(`Discord returned ${res.statusCode}`));
      }
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(content));
    req.end();
  });
}

async function runNinjaCRM() {
  console.log('🥷 Relationship Ninja CRM Starting...\n');
  console.log('📎 MY Relationships Beaker Tracker');
  console.log('🔗 https://docs.google.com/spreadsheets/d/1BgOdW3dBF1e7yYRz0wGC9TN75QcHRgsl\n');
  
  try {
    const csvData = await downloadCSV();
    const contacts = parseCSV(csvData);
    
    console.log(`📊 Loaded ${contacts.length} contacts\n`);
    
    const scored = [];
    let siegfriedCount = 0;
    
    for (const contact of contacts) {
      const result = scoreContact(contact);
      if (result.excluded) {
        siegfriedCount++;
      } else if (result.score >= 5) {
        scored.push(result);
      }
    }
    
    scored.sort((a, b) => b.score - a.score);
    
    console.log(`📊 ANALYSIS COMPLETE`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎯 Prospects: ${scored.filter(c => !c.excluded).length}`);
    console.log(`🏢 Siegfried: ${siegfriedCount}`);
    console.log(`📈 Max Score: ${scored.length > 0 ? scored[0].score : 0}/20\n`);
    
    await postToDiscord(scored, siegfriedCount, contacts.length);
    
    console.log('\n✨ Ninja CRM complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  runNinjaCRM();
}

module.exports = { runNinjaCRM, scoreContact, parseCSV, downloadCSV };
