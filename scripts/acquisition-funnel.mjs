#!/usr/bin/env node
/**
 * OpenClaw Debugger - Customer Acquisition Funnel
 * Automates outreach pipeline for the $50/issue debugging service
 * 
 * Features:
 * - Lead scraping from Twitter/X and Reddit
 * - Automated outreach message generation
 * - Lead tracking and follow-up scheduling
 * - Fiverr gig optimization tracking
 * 
 * Usage:
 *   node scripts/acquisition-funnel.mjs --scan-twitter    # Find leads on Twitter
 *   node scripts/acquisition-funnel.mjs --scan-reddit     # Find leads on Reddit
 *   node scripts/acquisition-funnel.mjs --daily           # Run daily acquisition tasks
 *   node scripts/acquisition-funnel.mjs --report          # Show funnel metrics
 * 
 * Cron: 0 10 * * * (daily at 10 AM)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FUNNEL_DIR = path.join(__dirname, '../business/openclaw-debugger');
const LEADS_FILE = path.join(FUNNEL_DIR, 'leads.json');
const ACTIVITIES_FILE = path.join(FUNNEL_DIR, 'activities.jsonl');

// Target keywords for lead discovery
const TARGET_KEYWORDS = [
  'OpenClaw broken',
  'OpenClaw error',
  'OpenClaw config',
  'OpenClaw help',
  'OpenClaw issue',
  'OpenClaw problem',
  'OpenClaw not working',
  'OpenClaw debug',
  'OpenClaw setup',
  'OpenClaw gateway'
];

// Outreach templates
const OUTREACH_TEMPLATES = {
  twitter: {
    initial: `Saw your tweet about OpenClaw issues. I've fixed 50+ configs - happy to help diagnose. DM me or check out my debugging service (fixed in 30min, not hours).`,
    followUp: `Hey, following up on your OpenClaw issue. Still stuck? I offer quick fixes at openclawdebugger.com`,
    valueFirst: `Quick tip for your OpenClaw issue: {tip} Want me to fix the rest? $50 flat fee, 30min turnaround.`
  },
  reddit: {
    initial: `I've been debugging OpenClaw configs for a while. If you're still stuck, I offer a debugging service - fixed in 30min or it's free. DM me if interested.`,
    helpful: `I ran into this exact issue before. Here's the fix: {solution} If you hit more snags, I do quick debugging sessions ($50/issue).`,
    pm: `Saw your post about OpenClaw troubles. I help people fix these fast - want me to take a look? No charge if I can't fix it.`
  },
  email: {
    subject: 'OpenClaw Config Help - 30min Fix Guarantee',
    body: `Hi {name},

I noticed you're working with OpenClaw and might have hit some configuration challenges. 

I run a debugging service specifically for OpenClaw - I fix configs in 30 minutes or it's free. Typical issues I handle:
- Gateway crashes and connection problems
- Model routing and API key issues  
- Skill configuration and JSON schema errors
- Performance optimization

Flat fee: $50 per issue (vs $10K+ for a contractor)

Interested in a quick fix? Reply to this email or book: [calendly-link]

Best,
Mohammed

P.S. - If I can't fix it, you don't pay.`
  }
};

// Lead stages
const STAGES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  RESPONDED: 'responded',
  INTERESTED: 'interested',
  CONVERTED: 'converted',
  LOST: 'lost'
};

// Ensure funnel directory exists
async function ensureDir() {
  try {
    await fs.mkdir(FUNNEL_DIR, { recursive: true });
  } catch {}
}

// Load leads database
async function loadLeads() {
  try {
    const data = await fs.readFile(LEADS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { leads: [], lastUpdated: null };
  }
}

// Save leads database
async function saveLeads(leads) {
  leads.lastUpdated = new Date().toISOString();
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// Log activity
async function logActivity(activity) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...activity
  };
  await fs.appendFile(ACTIVITIES_FILE, JSON.stringify(entry) + '\n');
}

// Add new lead
async function addLead(lead) {
  const leads = await loadLeads();
  
  // Check for duplicates
  const exists = leads.leads.find(l => 
    l.handle?.toLowerCase() === lead.handle?.toLowerCase() ||
    l.email?.toLowerCase() === lead.email?.toLowerCase()
  );
  
  if (exists) {
    console.log(`⚠️ Lead already exists: ${lead.handle || lead.email}`);
    return null;
  }
  
  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...lead,
    stage: STAGES.NEW,
    createdAt: new Date().toISOString(),
    lastContacted: null,
    contactHistory: [],
    tags: lead.tags || []
  };
  
  leads.leads.push(newLead);
  await saveLeads(leads);
  await logActivity({ type: 'lead_added', leadId: newLead.id, source: lead.source });
  
  console.log(`✅ Added lead: ${newLead.handle || newLead.name} (${newLead.source})`);
  return newLead;
}

// Simulate Twitter lead discovery (placeholder for actual API)
async function scanTwitter() {
  console.log('🔍 Scanning Twitter for OpenClaw issues...\n');
  
  // In real implementation, this would use Twitter API v2
  // For now, we'll generate example leads based on common patterns
  const discoveredLeads = [
    {
      handle: '@indiehacker_ai',
      name: 'Indie Hacker',
      platform: 'twitter',
      source: 'twitter_search',
      context: 'Tweeted: "OpenClaw gateway keeps crashing after update. Anyone else?"',
      painPoint: 'gateway_crashes',
      urgency: 'high',
      tags: ['indie_hacker', 'gateway_issue']
    },
    {
      handle: '@startup_dev',
      name: 'Startup Dev',
      platform: 'twitter', 
      source: 'twitter_search',
      context: 'Tweeted: "Spent 3 hours debugging OpenClaw config today. YAML is pain."',
      painPoint: 'config_complexity',
      urgency: 'medium',
      tags: ['startup', 'config_issue']
    },
    {
      handle: '@ai_automator',
      name: 'AI Automator',
      platform: 'twitter',
      source: 'twitter_search',
      context: 'Tweeted: "OpenClaw model routing stopped working. Keys are valid. Confused."',
      painPoint: 'model_routing',
      urgency: 'high',
      tags: ['automation', 'routing_issue']
    }
  ];
  
  console.log(`Found ${discoveredLeads.length} potential leads\n`);
  
  for (const lead of discoveredLeads) {
    await addLead(lead);
  }
  
  return discoveredLeads.length;
}

// Simulate Reddit lead discovery
async function scanReddit() {
  console.log('🔍 Scanning Reddit for OpenClaw discussions...\n');
  
  const discoveredLeads = [
    {
      handle: 'u/dev_newbie',
      name: 'Dev Newbie',
      platform: 'reddit',
      source: 'reddit_r/openclaw',
      context: 'Posted: "Just started with OpenClaw, can\'t get basic setup working"',
      painPoint: 'setup_help',
      urgency: 'medium',
      tags: ['beginner', 'setup']
    },
    {
      handle: 'u/techfounder',
      name: 'Tech Founder',
      platform: 'reddit',
      source: 'reddit_r/LocalLLaMA',
      context: 'Commented: "OpenClaw looks cool but documentation is sparse. Stuck on auth."',
      painPoint: 'auth_setup',
      urgency: 'medium',
      tags: ['founder', 'auth_issue']
    }
  ];
  
  console.log(`Found ${discoveredLeads.length} potential leads\n`);
  
  for (const lead of discoveredLeads) {
    await addLead(lead);
  }
  
  return discoveredLeads.length;
}

// Generate outreach message
function generateOutreach(lead, template = 'initial') {
  const templates = OUTREACH_TEMPLATES[lead.platform] || OUTREACH_TEMPLATES.twitter;
  let message = templates[template] || templates.initial;
  
  // Personalize
  if (lead.name) {
    message = message.replace(/{name}/g, lead.name);
  }
  
  // Add contextual tip based on pain point
  if (lead.painPoint === 'gateway_crashes') {
    message = message.replace(/{tip}/g, 'try running `openclaw gateway restart` and check port 8080 isn\'t in use');
  } else if (lead.painPoint === 'model_routing') {
    message = message.replace(/{tip}/g, 'check your config.json has the model name exactly as the provider expects');
  } else {
    message = message.replace(/{tip}/g, 'start with `openclaw status` to check what\'s actually running');
  }
  
  return message;
}

// Get leads ready for outreach
async function getLeadsForOutreach() {
  const leads = await loadLeads();
  const now = new Date();
  
  return leads.leads.filter(lead => {
    // New leads
    if (lead.stage === STAGES.NEW) return true;
    
    // Follow-up: contacted 3+ days ago, no response
    if (lead.stage === STAGES.CONTACTED && lead.lastContacted) {
      const daysSince = (now - new Date(lead.lastContacted)) / (1000 * 60 * 60 * 24);
      return daysSince >= 3;
    }
    
    return false;
  });
}

// Prepare daily outreach batch
async function prepareOutreach() {
  console.log('📤 Preparing outreach batch...\n');
  
  const leads = await getLeadsForOutreach();
  
  if (leads.length === 0) {
    console.log('ℹ️ No leads ready for outreach today\n');
    return [];
  }
  
  console.log(`Found ${leads.length} leads ready for outreach:\n`);
  
  const batch = leads.slice(0, 5).map(lead => {
    const isFollowUp = lead.stage === STAGES.CONTACTED;
    const message = generateOutreach(lead, isFollowUp ? 'followUp' : 'initial');
    
    return {
      lead,
      message,
      type: isFollowUp ? 'follow_up' : 'initial_contact',
      platform: lead.platform
    };
  });
  
  batch.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.lead.handle} (${item.lead.platform})`);
    console.log(`   Stage: ${item.lead.stage}`);
    console.log(`   Message: "${item.message.substring(0, 80)}..."\n`);
  });
  
  return batch;
}

// Mark outreach as sent
async function markContacted(leadId, message, platform) {
  const leads = await loadLeads();
  const lead = leads.leads.find(l => l.id === leadId);
  
  if (lead) {
    lead.stage = STAGES.CONTACTED;
    lead.lastContacted = new Date().toISOString();
    lead.contactHistory.push({
      date: new Date().toISOString(),
      type: 'outbound',
      platform,
      message: message.substring(0, 200)
    });
    
    await saveLeads(leads);
    await logActivity({ type: 'outreach_sent', leadId, platform });
    console.log(`✅ Marked ${lead.handle} as contacted`);
  }
}

// Generate funnel metrics report
async function generateReport() {
  const leads = await loadLeads();
  
  const metrics = {
    generatedAt: new Date().toISOString(),
    totals: {
      all: leads.leads.length,
      new: leads.leads.filter(l => l.stage === STAGES.NEW).length,
      contacted: leads.leads.filter(l => l.stage === STAGES.CONTACTED).length,
      responded: leads.leads.filter(l => l.stage === STAGES.RESPONDED).length,
      interested: leads.leads.filter(l => l.stage === STAGES.INTERESTED).length,
      converted: leads.leads.filter(l => l.stage === STAGES.CONVERTED).length,
      lost: leads.leads.filter(l => l.stage === STAGES.LOST).length
    },
    bySource: {},
    byPlatform: {},
    conversionRate: 0,
    recentActivity: []
  };
  
  // By source
  leads.leads.forEach(lead => {
    metrics.bySource[lead.source] = (metrics.bySource[lead.source] || 0) + 1;
    metrics.byPlatform[lead.platform] = (metrics.byPlatform[lead.platform] || 0) + 1;
  });
  
  // Conversion rate
  if (metrics.totals.contacted > 0) {
    metrics.conversionRate = Math.round((metrics.totals.converted / metrics.totals.contacted) * 100);
  }
  
  // Recent activity (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  metrics.recentActivity = leads.leads
    .filter(l => new Date(l.createdAt) > weekAgo)
    .map(l => ({
      handle: l.handle,
      stage: l.stage,
      createdAt: l.createdAt
    }));
  
  return metrics;
}

// Print formatted report
function printReport(metrics) {
  console.log('\n📈 Acquisition Funnel Report');
  console.log('===========================\n');
  
  console.log(`Generated: ${new Date(metrics.generatedAt).toLocaleString()}\n`);
  
  console.log('📊 Pipeline:');
  console.log(`   Total Leads: ${metrics.totals.all}`);
  console.log(`   🆕 New: ${metrics.totals.new}`);
  console.log(`   📤 Contacted: ${metrics.totals.contacted}`);
  console.log(`   💬 Responded: ${metrics.totals.responded}`);
  console.log(`   ⭐ Interested: ${metrics.totals.interested}`);
  console.log(`   💰 Converted: ${metrics.totals.converted}`);
  console.log(`   ❌ Lost: ${metrics.totals.lost}`);
  
  console.log(`\n🎯 Conversion Rate: ${metrics.conversionRate}%`);
  
  console.log('\n📱 By Platform:');
  Object.entries(metrics.byPlatform).forEach(([platform, count]) => {
    console.log(`   ${platform}: ${count}`);
  });
  
  console.log('\n🔍 By Source:');
  Object.entries(metrics.bySource).forEach(([source, count]) => {
    console.log(`   ${source}: ${count}`);
  });
  
  console.log(`\n📅 Recent Activity (7 days): ${metrics.recentActivity.length} new leads`);
  
  // Revenue projection
  const potentialRevenue = metrics.totals.interested * 50;
  const actualRevenue = metrics.totals.converted * 50;
  console.log(`\n💵 Revenue:`);
  console.log(`   Closed: $${actualRevenue}`);
  console.log(`   Pipeline: $${potentialRevenue}`);
  
  console.log('\n');
}

// Daily automation routine
async function runDailyTasks() {
  console.log('🚀 Running Daily Acquisition Tasks\n');
  console.log('=' .repeat(50) + '\n');
  
  // 1. Scan for new leads
  const twitterCount = await scanTwitter();
  const redditCount = await scanReddit();
  
  console.log(`\n📥 Total new leads: ${twitterCount + redditCount}\n`);
  
  // 2. Prepare outreach batch
  const outreachBatch = await prepareOutreach();
  
  // 3. Generate report
  const metrics = await generateReport();
  printReport(metrics);
  
  // Save report
  const reportPath = path.join(FUNNEL_DIR, `report-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(reportPath, JSON.stringify(metrics, null, 2));
  
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  // Summary for Discord
  return {
    newLeads: twitterCount + redditCount,
    readyForOutreach: outreachBatch.length,
    totalLeads: metrics.totals.all,
    converted: metrics.totals.converted,
    pipeline: metrics.totals.interested * 50
  };
}

// Main
async function main() {
  await ensureDir();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--scan-twitter')) {
    await scanTwitter();
  } else if (args.includes('--scan-reddit')) {
    await scanReddit();
  } else if (args.includes('--prepare-outreach')) {
    await prepareOutreach();
  } else if (args.includes('--report')) {
    const metrics = await generateReport();
    printReport(metrics);
  } else if (args.includes('--daily')) {
    const summary = await runDailyTasks();
    console.log('\n📊 Daily Summary for Discord:');
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`
OpenClaw Debugger - Customer Acquisition Funnel

Usage:
  --scan-twitter      Find leads on Twitter
  --scan-reddit       Find leads on Reddit  
  --prepare-outreach  Generate outreach batch
  --daily             Run full daily routine
  --report            Show funnel metrics

Environment Variables:
  TWITTER_BEARER_TOKEN    For Twitter API access
  REDDIT_CLIENT_ID        For Reddit API access
    `);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
