#!/usr/bin/env node
/**
 * Event Scout - AI/SaaS Event Finder with Puppeteer
 * Scrapes Lu.ma for relevant events 5-9pm PST
 * Auto-adds events to Google Calendar and reports to Discord
 */

const { google } = require('googleapis');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const path = require('path');

// Configuration
// Use service account's primary calendar - events will sync to shared calendars
const CALENDAR_ID = 'primary';
const KEYFILEPATH = path.join(process.env.HOME, '.openclaw/workspace/config/google-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const DISCORD_WEBHOOK = process.env.DISCORD_LUMA_SCOUT_WEBHOOK || '';

// Keywords for AI/SaaS events
const KEYWORDS = [
  'AI', 'artificial intelligence', 'machine learning', 'ML',
  'SaaS', 'startup', 'tech', 'technology', 'software',
  'founder', 'entrepreneur', 'VC', 'venture capital',
  'networking', 'demo day', 'pitch', 'hackathon', 'LLM',
  'generative AI', 'OpenAI', 'anthropic', 'claude'
];

// Events to exclude (already registered or aware of)
const EXCLUDED_EVENTS = [
  'Building AI Agents',  // User already registered for March 12
  'OpenClaw Silicon Valley'  // User already aware of this group
];

// Check if event conflicts with user's calendar
async function checkCalendarConflict(calendar, eventDate) {
  try {
    const timeMin = new Date(eventDate);
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(eventDate);
    timeMax.setHours(23, 59, 59, 999);
    
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
    });
    
    return response.data.items && response.data.items.length > 0;
  } catch (error) {
    console.error('Calendar check error:', error);
    return false;
  }
}

async function getCalendarAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  return google.calendar({ version: 'v3', auth });
}

async function scrapeLumaEvents() {
  console.log('🔍 Scraping Lu.ma for AI/SaaS events...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const events = [];
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Search for San Francisco tech/AI events
    const searchUrl = 'https://lu.ma/search?q=AI+startup+tech+San+Francisco';
    console.log(`Navigating: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000); // Let content load
    
    // Extract events
    const pageEvents = await page.evaluate(() => {
      const eventCards = document.querySelectorAll('[data-testid="event-card"], .event-card, [class*="EventCard"]');
      const extracted = [];
      
      eventCards.forEach(card => {
        const titleEl = card.querySelector('h3, h4, [class*="title"], a[class*="name"]');
        const dateEl = card.querySelector('[class*="date"], time');
        const timeEl = card.querySelector('[class*="time"]');
        const locEl = card.querySelector('[class*="location"], [class*="venue"]');
        const linkEl = card.querySelector('a[href*="/event/"]');
        
        if (titleEl) {
          extracted.push({
            title: titleEl.textContent.trim(),
            date: dateEl ? dateEl.textContent.trim() : '',
            time: timeEl ? timeEl.textContent.trim() : '',
            location: locEl ? locEl.textContent.trim() : 'San Francisco',
            url: linkEl ? 'https://lu.ma' + linkEl.getAttribute('href') : '',
            source: 'Lu.ma'
          });
        }
      });
      
      return extracted;
    });
    
    events.push(...pageEvents);
    console.log(`✅ Found ${pageEvents.length} events on Lu.ma\n`);
    
    // Also try specific event pages
    const exploreUrls = [
      'https://lu.ma/sf',
      'https://lu.ma/ai',
      'https://lu.ma/tech'
    ];
    
    for (const url of exploreUrls) {
      try {
        console.log(`Checking: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const moreEvents = await page.evaluate(() => {
          const cards = document.querySelectorAll('a[href*="/event/"]');
          const extracted = [];
          
          cards.forEach(card => {
            const parent = card.closest('[class*="card"], [class*="event"], article') || card.parentElement;
            const title = card.textContent.trim() || parent.querySelector('h3, h4')?.textContent?.trim();
            
            if (title && title.length > 5) {
              extracted.push({
                title: title,
                date: parent.querySelector('[class*="date"]')?.textContent?.trim() || '',
                time: parent.querySelector('[class*="time"]')?.textContent?.trim() || '',
                location: 'San Francisco',
                url: card.href.startsWith('http') ? card.href : 'https://lu.ma' + card.getAttribute('href'),
                source: 'Lu.ma'
              });
            }
          });
          
          return extracted;
        });
        
        events.push(...moreEvents);
        console.log(`  Found ${moreEvents.length} events`);
      } catch (e) {
        console.log(`  ⚠️  Skipped: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lu.ma scraping error:', error.message);
  } finally {
    await browser.close();
  }
  
  // Deduplicate by URL
  const seen = new Set();
  const uniqueEvents = events.filter(e => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
  
  // Filter out excluded events (already registered/aware of)
  return uniqueEvents.filter(e => {
    for (const excluded of EXCLUDED_EVENTS) {
      if (e.title.toLowerCase().includes(excluded.toLowerCase())) {
        console.log(`🚫 Excluding "${e.title}" - already registered/aware`);
        return false;
      }
    }
    return true;
  });
}

function parseEventDate(event) {
  // Try to parse date/time from various formats
  const now = new Date();
  let eventDate = null;
  let eventTime = null;
  
  // Look for date patterns in title and date string
  const dateStr = `${event.date} ${event.time}`;
  
  // Try to find time (5pm-9pm window)
  const timeMatch = dateStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3].toLowerCase();
    
    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    
    eventTime = { hour, minute };
  }
  
  return { date: eventDate, time: eventTime };
}

function scoreEvent(event) {
  let score = 0;
  const text = `${event.title} ${event.date} ${event.time} ${event.location || ''}`.toLowerCase();
  
  // Keyword matching
  for (const keyword of KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      score += keyword.length > 5 ? 2 : 1; // Boost longer/more specific keywords
    }
  }
  
  // Boost for San Francisco / Bay Area
  if (text.includes('san francisco') || text.includes('sf') || text.includes('bay area')) {
    score += 3;
  }
  
  // Boost for evening events (5-9pm)
  const parsed = parseEventDate(event);
  if (parsed.time) {
    const { hour } = parsed.time;
    if (hour >= 17 && hour <= 21) {
      score += 4; // Prime networking time
    } else if (hour >= 18 && hour <= 20) {
      score += 2; // Still good
    }
  }
  
  // Boost for this week
  if (event.date && (event.date.includes('Today') || event.date.includes('Tomorrow') || event.date.includes('this week'))) {
    score += 2;
  }
  
  return score;
}

async function addEventToCalendar(calendar, event) {
  try {
    // Parse date/time
    const now = new Date();
    const parsed = parseEventDate(event);
    
    // Default to upcoming date if parsing fails
    let startTime = new Date(now);
    startTime.setDate(startTime.getDate() + 1);
    if (parsed.time) {
      startTime.setHours(parsed.time.hour, parsed.time.minute, 0);
    } else {
      startTime.setHours(18, 0, 0); // Default 6pm
    }
    
    // Default 2 hour duration
    let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);
    
    const eventDetails = {
      summary: `🎯 ${event.title}`,
      description: `${event.description || ''}\n\nSource: ${event.source}\nURL: ${event.url || 'N/A'}`,
      location: event.location || 'San Francisco, CA',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 }, // 24 hours before
          { method: 'popup', minutes: 60 },
        ],
      },
    };
    
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: eventDetails,
    });
    
    console.log(`✅ Added to calendar: ${event.title}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to add event: ${error.message}`);
    return null;
  }
}

async function postToDiscord(events) {
  if (!DISCORD_WEBHOOK || events.length === 0) {
    console.log('ℹ️  No Discord webhook configured or no events to report');
    return;
  }
  
  const https = require('https');
  const url = new URL(DISCORD_WEBHOOK);
  
  const content = {
    username: "Event Scout 🤖",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png",
    embeds: [{
      title: `🎯 Event Scout Report - ${new Date().toLocaleDateString()}`,
      color: 0x00ff00,
      description: `Found ${events.length} relevant AI/SaaS events in SF`,
      fields: events.map(e => ({
        name: e.title,
        value: `📅 ${e.date || 'TBD'} ${e.time ? `at ${e.time}` : ''}\n📍 ${e.location}\n🔗 [View on Lu.ma](${e.url})\n⭐ Score: ${e.score}/20`,
        inline: false
      })),
      timestamp: new Date().toISOString()
    }]
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      if (res.statusCode === 204) {
        console.log('✅ Posted to Discord #luma-scout');
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

async function runEventScout() {
  console.log('🚀 Event Scout Starting...\n');
  console.log(`Calendar: Service Account (syncs to shared calendars)\n`);
  
  try {
    const calendar = await getCalendarAuth();
    
    // Test calendar access
    const cal = await calendar.calendars.get({ calendarId: CALENDAR_ID });
    console.log(`✅ Connected to: ${cal.data.summary}`);
    console.log(`📧 Events will sync to shared calendars (including mohltbot10@gmail.com)\n`);
    
    // Scrape events
    const lumaEvents = await scrapeLumaEvents();
    
    if (lumaEvents.length === 0) {
      console.log('\nℹ️  No events found this week.');
      console.log('📋 Event Scout is configured and ready!');
      return;
    }
    
    console.log(`\n📊 Total events found: ${lumaEvents.length}`);
    
    // Score and filter events
    const scoredEvents = lumaEvents
      .map(e => ({ ...e, score: scoreEvent(e) }))
      .filter(e => e.score >= 3)
      .sort((a, b) => b.score - a.score);
    
    console.log(`🎯 Relevant events (score >= 3): ${scoredEvents.length}\n`);
    
    // Show top events
    scoredEvents.slice(0, 5).forEach((e, i) => {
      console.log(`${i + 1}. ${e.title}`);
      console.log(`   📅 ${e.date} ${e.time}`);
      console.log(`   📍 ${e.location}`);
      console.log(`   ⭐ Score: ${e.score}/20`);
      console.log(`   🔗 ${e.url}\n`);
    });
    
    // Add top events to calendar (check for conflicts first)
    const addedEvents = [];
    for (const event of scoredEvents.slice(0, 3)) {
      // Check for calendar conflicts
      const hasConflict = await checkCalendarConflict(calendar, event.date);
      if (hasConflict) {
        console.log(`⚠️  Skipping "${event.title}" - conflicts with existing calendar event`);
        continue;
      }
      
      const added = await addEventToCalendar(calendar, event);
      if (added) {
        addedEvents.push(event);
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    // Report to Discord
    await postToDiscord(addedEvents);
    
    console.log(`\n✨ Event Scout complete! Added ${addedEvents.length} events to calendar.`);
    
  } catch (error) {
    console.error('❌ Event Scout failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runEventScout();
}

module.exports = { runEventScout, scrapeLumaEvents, addEventToCalendar, scoreEvent };
