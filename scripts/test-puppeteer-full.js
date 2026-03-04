#!/usr/bin/env node
/**
 * Additional Puppeteer Tests
 * Test 2: Extract specific content
 * Test 3: Navigate and extract multiple pages
 */

const puppeteer = require('puppeteer');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function test1_SimpleScrape() {
  console.log('\n=== TEST 1: Simple Page Scrape ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    const h1 = await page.$eval('h1', el => el.textContent);
    
    console.log('✅ SUCCESS');
    console.log('Title:', title);
    console.log('H1:', h1);
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function test2_ExtractLinks() {
  console.log('\n=== TEST 2: Extract Links from Page ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com', { waitUntil: 'networkidle2' });
    
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.titleline > a'))
        .slice(0, 5)
        .map(a => ({ title: a.textContent, url: a.href }));
    });
    
    console.log('✅ SUCCESS');
    console.log('Top 5 HN stories:');
    links.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.title.substring(0, 60)}...`);
    });
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function test3_Screenshot() {
  console.log('\n=== TEST 3: Take Screenshot ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
    
    const screenshotPath = '/tmp/puppeteer-test-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    const stats = require('fs').statSync(screenshotPath);
    console.log('✅ SUCCESS');
    console.log('Screenshot saved:', screenshotPath);
    console.log('File size:', (stats.size / 1024).toFixed(2), 'KB');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.log('🚀 Running Puppeteer Tests...');
  console.log('Chrome:', CHROME_PATH);
  
  const results = [];
  
  results.push(await test1_SimpleScrape());
  results.push(await test2_ExtractLinks());
  results.push(await test3_Screenshot());
  
  console.log('\n=== SUMMARY ===');
  const passed = results.filter(r => r).length;
  console.log(`Passed: ${passed}/${results.length}`);
  
  process.exit(passed === results.length ? 0 : 1);
}

runAllTests();
