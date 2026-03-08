import { powerMonitor } from 'electron';
import Store from 'electron-store';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { 
  classifyActivity, 
  calculateFocusScore, 
  calculateTimeBreakdown,
  ActivityClassification,
  SUSPICIOUS_THRESHOLDS,
  ActivityCategory
} from './classifier';

// Dynamic import for active-win (ESM module)
let activeWin: any = null;

interface RawActivity {
  timestamp: string;
  windowTitle: string;
  appName: string;
  idle: boolean;
  idleTimeSeconds: number;
}

interface TrackedActivity {
  id: string;
  timestamp: string;
  appName: string;
  windowTitle: string;
  category: ActivityCategory;
  categoryName: string;
  productivityScore: number;
  productivityLevel: 'productive' | 'neutral' | 'unproductive';
  isSuspicious: boolean;
  suspiciousReason?: string;
  isIdle: boolean;
  idleTimeSeconds: number;
  durationSeconds: number;
}

interface Config {
  employeeId: string;
  employeeName: string;
  serverUrl: string;
}

interface ActivityContext {
  currentAppStartTime: number;
  lastInputTime: number;
  windowChangeCount: number;
  lastWindowTitle: string;
  activities: TrackedActivity[];
}

const store = new Store<Config>({
  defaults: {
    employeeId: 'emp-001',
    employeeName: 'Mohammed',
    serverUrl: 'http://localhost:3001'
  }
});

// Activity tracking state
const activities: TrackedActivity[] = [];
const offlineQueue: TrackedActivity[] = [];
let lastActivity: TrackedActivity | null = null;
let lastRawActivity: RawActivity | null = null;
let lastSyncTime = 0;
let isOnline = true;

// Context for suspicious pattern detection
const activityContext: ActivityContext = {
  currentAppStartTime: Date.now(),
  lastInputTime: Date.now(),
  windowChangeCount: 0,
  lastWindowTitle: '',
  activities: []
};

// Track last check time for calculating durations
let lastCheckTime = Date.now();

export async function startTracking(): Promise<void> {
  console.log('🚀 Starting ArchTrack smart activity tracking...');
  
  // Load active-win dynamically
  try {
    const activeWinModule = await import('active-win');
    activeWin = activeWinModule.default || activeWinModule;
    console.log('✓ active-win library loaded');
  } catch (err) {
    console.error('Failed to load active-win:', err);
    console.log('Falling back to mock window detection for testing');
  }
  
  // Load any saved offline queue
  loadOfflineQueue();
  
  // Check every 5 seconds for activity
  setInterval(checkActivity, 5000);
  
  // Sync to server every 30 seconds
  setInterval(syncToServer, 30000);
  
  // Check online status periodically
  setInterval(checkOnlineStatus, 10000);
  
  console.log('✓ Smart tracking active (checking every 5s, syncing every 30s)');
  console.log('✓ Productivity classification enabled');
  console.log('✓ Suspicious pattern detection enabled');
}

async function checkActivity(): Promise<void> {
  try {
    const now = Date.now();
    const timeSinceLastCheck = (now - lastCheckTime) / 1000;
    lastCheckTime = now;
    
    // Get idle time in seconds (powerMonitor gives seconds on macOS, ms on Windows)
    const idleTimeMs = powerMonitor.getSystemIdleTime();
    const idleTimeSec = Math.floor(idleTimeMs / 1000);
    const isIdle = idleTimeSec > 300; // 5 minutes threshold
    
    // Get active window info using active-win
    let windowTitle = 'Unknown';
    let appName = 'Unknown';
    
    if (activeWin) {
      try {
        const winInfo = await activeWin();
        if (winInfo) {
          windowTitle = winInfo.title || 'Untitled';
          appName = winInfo.owner?.name || winInfo.owner?.bundleId || 'Unknown App';
        }
      } catch (err) {
        // Fallback for testing
        windowTitle = getMockWindowTitle();
        appName = getMockAppName();
      }
    } else {
      // Mock data for testing when active-win isn't available
      windowTitle = getMockWindowTitle();
      appName = getMockAppName();
    }
    
    // Track window changes
    if (windowTitle !== activityContext.lastWindowTitle) {
      activityContext.windowChangeCount++;
      activityContext.lastWindowTitle = windowTitle;
      
      // Reset app start time when window changes
      if (appName !== lastActivity?.appName) {
        activityContext.currentAppStartTime = now;
        activityContext.windowChangeCount = 0;
      }
    }
    
    // Track input activity (approximated by lack of idle time)
    if (idleTimeSec < 5) {
      activityContext.lastInputTime = now;
    }
    
    // Calculate context for classification
    const currentHour = new Date().getHours();
    const durationInCurrentApp = (now - activityContext.currentAppStartTime) / 60000; // minutes
    const timeSinceLastInput = (now - activityContext.lastInputTime) / 60000; // minutes
    const switchFrequency = activityContext.windowChangeCount > 0 
      ? timeSinceLastCheck / activityContext.windowChangeCount 
      : undefined;
    
    // Classify the activity
    const classification = classifyActivity(
      appName, 
      windowTitle, 
      idleTimeSec,
      {
        youtubeDurationMinutes: appName === 'YouTube' ? durationInCurrentApp : undefined,
        rapidSwitchCount: switchFrequency && switchFrequency < 5000 ? activityContext.windowChangeCount : undefined
      }
    );
    
    // Create the activity record
    const activity: TrackedActivity = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      appName,
      windowTitle,
      category: classification.category,
      categoryName: classification.categoryName,
      productivityScore: classification.productivityScore,
      productivityLevel: classification.productivityLevel,
      isSuspicious: classification.isSuspicious,
      suspiciousReason: classification.suspiciousReason,
      isIdle,
      idleTimeSeconds: idleTimeSec,
      durationSeconds: Math.round(timeSinceLastCheck)
    };
    
    // Only record if changed significantly or every minute
    const shouldRecord = !lastActivity || 
      lastActivity.appName !== activity.appName ||
      lastActivity.windowTitle !== activity.windowTitle ||
      lastActivity.isIdle !== activity.isIdle ||
      classification.isSuspicious ||
      timeSinceLastCheck >= 60;
    
    if (shouldRecord) {
      activities.push(activity);
      activityContext.activities.push(activity);
      
      // Add to offline queue for syncing
      offlineQueue.push(activity);
      
      lastActivity = activity;
      
      // Log with appropriate styling
      logActivity(activity);
      
      // Alert if suspicious
      if (classification.isSuspicious) {
        console.warn(`⚠️  SUSPICIOUS ACTIVITY: ${classification.suspiciousReason}`);
      }
    }
    
    // Keep only last 1000 activities in memory
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }
    
  } catch (err) {
    console.error('Error checking activity:', err);
  }
}

function logActivity(activity: TrackedActivity): void {
  const time = new Date().toLocaleTimeString();
  const idleStr = activity.isIdle ? ' [IDLE]' : '';
  const suspiciousStr = activity.isSuspicious ? ' ⚠️' : '';
  
  // Color code by productivity level
  let productivityIcon = '⚪';
  if (activity.productivityLevel === 'productive') productivityIcon = '🟢';
  else if (activity.productivityLevel === 'unproductive') productivityIcon = '🔴';
  else if (activity.productivityLevel === 'neutral') productivityIcon = '🟡';
  
  console.log(
    `[${time}] ${productivityIcon} ${activity.appName} - "${activity.windowTitle}"` +
    ` → ${activity.categoryName} (score: ${activity.productivityScore})${idleStr}${suspiciousStr}`
  );
  
  if (activity.suspiciousReason) {
    console.log(`    ⚠️  ${activity.suspiciousReason}`);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getMockWindowTitle(): string {
  // Return realistic mock data for testing classification
  const mockData = [
    { title: 'arch-firm-dashboard - main.ts — Cursor', app: 'Cursor' },
    { title: 'AutoCAD 2024 - Floor Plan.dwg', app: 'AutoCAD' },
    { title: 'Revit 2024 - Residential Complex.rvt', app: 'Revit' },
    { title: 'SketchUp Pro - Downtown Office Model', app: 'SketchUp' },
    { title: 'Adobe Photoshop - Rendering.psd', app: 'Adobe Photoshop' },
    { title: 'YouTube - Rick Astley - Never Gonna Give You Up', app: 'YouTube' },
    { title: 'Facebook - News Feed', app: 'Facebook' },
    { title: 'Slack - #general', app: 'Slack' },
    { title: 'Terminal - zsh', app: 'Terminal' },
    { title: 'Docker Desktop', app: 'Docker' },
    { title: 'Notion - Project Notes', app: 'Notion' },
    { title: 'Figma - Design System', app: 'Figma' },
    { title: 'GitHub - Pull Requests', app: 'GitHub' },
    { title: 'Netflix - Browse', app: 'Netflix' },
    { title: 'Visual Studio Code - tracker.ts', app: 'Code' }
  ];
  
  const random = mockData[Math.floor(Math.random() * mockData.length)];
  return random.title;
}

function getMockAppName(): string {
  const mockApps = [
    'Cursor', 'AutoCAD', 'Revit', 'SketchUp', 'Adobe Photoshop',
    'YouTube', 'Facebook', 'Slack', 'Terminal', 'Docker Desktop',
    'Notion', 'Figma', 'GitHub', 'Netflix', 'Code'
  ];
  return mockApps[Math.floor(Math.random() * mockApps.length)];
}

async function syncToServer(): Promise<void> {
  if (offlineQueue.length === 0) return;
  
  const serverUrl = store.get('serverUrl');
  const employeeId = store.get('employeeId');
  
  if (!isOnline) {
    console.log(`📴 Offline - ${offlineQueue.length} activities queued`);
    saveOfflineQueue();
    return;
  }
  
  try {
    // Send batch of activities
    const batch = offlineQueue.splice(0, offlineQueue.length);
    
    const payload = {
      employeeId,
      timestamp: new Date().toISOString(),
      activities: batch
    };
    
    const response = await fetch(`${serverUrl}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✓ Synced ${batch.length} activities to server`);
      
      if (result.data?.suspiciousCount > 0) {
        console.warn(`⚠️  Server flagged ${result.data.suspiciousCount} suspicious activities`);
      }
      
      lastSyncTime = Date.now();
      saveOfflineQueue(); // Save empty queue
    } else {
      // Put back in queue on failure
      offlineQueue.unshift(...batch);
      console.error('Sync failed:', response.statusText);
    }
  } catch (err) {
    // Put back in queue on error
    const batch = offlineQueue.splice(0, offlineQueue.length);
    offlineQueue.unshift(...batch);
    isOnline = false;
    console.error('Sync error (offline?):', err);
    saveOfflineQueue();
  }
}

async function checkOnlineStatus(): Promise<void> {
  const serverUrl = store.get('serverUrl');
  try {
    const response = await fetch(`${serverUrl}/api/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    isOnline = response.ok;
    if (isOnline && offlineQueue.length > 0) {
      console.log('Back online - syncing queued activities...');
      syncToServer();
    }
  } catch {
    isOnline = false;
  }
}

function saveOfflineQueue(): void {
  try {
    const dataPath = path.join(app.getPath('userData'), 'offline-queue.json');
    fs.writeFileSync(dataPath, JSON.stringify(offlineQueue, null, 2));
  } catch (err) {
    console.error('Failed to save offline queue:', err);
  }
}

function loadOfflineQueue(): void {
  try {
    const dataPath = path.join(app.getPath('userData'), 'offline-queue.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      offlineQueue.push(...data);
      console.log(`Loaded ${data.length} queued activities from disk`);
    }
  } catch (err) {
    console.error('Failed to load offline queue:', err);
  }
}

// Export for debugging and stats
export function getTrackingStatus() {
  const recentActivities = activityContext.activities.slice(-50);
  
  return {
    activitiesCount: activities.length,
    queuedCount: offlineQueue.length,
    isOnline,
    lastSync: lastSyncTime ? new Date(lastSyncTime).toISOString() : null,
    lastActivity,
    stats: {
      focusScore: calculateFocusScore(recentActivities),
      timeBreakdown: calculateTimeBreakdown(recentActivities),
      suspiciousCount: recentActivities.filter(a => a.isSuspicious).length
    }
  };
}

// Get current productivity stats for the UI
export function getProductivityStats() {
  const recentActivities = activityContext.activities.slice(-100);
  const breakdown = calculateTimeBreakdown(recentActivities);
  
  return {
    currentActivity: lastActivity,
    focusScore: calculateFocusScore(recentActivities),
    productiveMinutes: breakdown.productiveMinutes,
    unproductiveMinutes: breakdown.unproductiveMinutes,
    neutralMinutes: breakdown.neutralMinutes,
    totalMinutes: breakdown.totalMinutes,
    suspiciousActivities: recentActivities.filter(a => a.isSuspicious)
  };
}
