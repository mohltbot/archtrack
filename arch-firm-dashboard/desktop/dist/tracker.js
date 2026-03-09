import { powerMonitor, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { classifyActivity, generateDailySummary } from './classifier.js';
// Dynamic import for active-win (ESM module)
let activeWin = null;
// Activity tracking state
const activities = [];
const offlineQueue = [];
let lastActivity = null;
let lastSyncTime = 0;
let isOnline = true;
// Context for pattern detection
let currentAppStartTime = Date.now();
let lastInputTime = Date.now();
let windowChangeCount = 0;
let lastWindowTitle = '';
let lastAppName = '';
let lastCheckTime = Date.now();
let consecutiveIdleChecks = 0;
// Store config (simple JSON file)
let config = {
    employeeId: 'emp-001',
    employeeName: 'Test Employee',
    serverUrl: 'http://localhost:3001'
};
export async function startTracking() {
    console.log('🚀 Starting ArchTrack smart activity tracking...');
    // Load config
    loadConfig();
    // Load active-win dynamically
    try {
        const activeWinModule = await import('active-win');
        activeWin = activeWinModule.default || activeWinModule;
        console.log('✓ active-win library loaded');
    }
    catch (err) {
        console.error('Failed to load active-win:', err);
        console.log('⚠️ Running in mock mode for testing');
    }
    // Load offline queue
    loadOfflineQueue();
    // Check every 10 seconds for activity
    setInterval(checkActivity, 10000);
    // Sync to server every 60 seconds
    setInterval(syncToServer, 60000);
    // Check online status
    setInterval(checkOnlineStatus, 30000);
    console.log('✓ Smart tracking active');
    console.log('✓ Employee:', config.employeeName, `(${config.employeeId})`);
    console.log('✓ Server:', config.serverUrl);
    console.log('');
    console.log('📊 Tracking:');
    console.log('  • Core work activities');
    console.log('  • Communication (Slack, Teams, Email)');
    console.log('  • Idle time detection');
    console.log('  • Suspicious patterns (video idle, ghost presence)');
    console.log('');
}
async function checkActivity() {
    try {
        const now = Date.now();
        const timeSinceLastCheck = (now - lastCheckTime) / 1000;
        lastCheckTime = now;
        // Get system idle time (in milliseconds, convert to seconds)
        const idleTimeMs = powerMonitor.getSystemIdleTime();
        const idleTimeSec = Math.floor(idleTimeMs / 1000);
        // Detect input activity (no idle for last few seconds = active)
        const hasInputActivity = idleTimeSec < 3;
        if (hasInputActivity) {
            lastInputTime = now;
            consecutiveIdleChecks = 0;
        }
        else {
            consecutiveIdleChecks++;
        }
        // Get active window info
        let windowTitle = 'Unknown';
        let appName = 'Unknown';
        if (activeWin) {
            try {
                const winInfo = await activeWin();
                if (winInfo) {
                    windowTitle = winInfo.title || 'Untitled';
                    appName = winInfo.owner?.name || winInfo.owner?.bundleId || 'Unknown';
                }
            }
            catch (err) {
                // Use mock data for testing
                const mock = getMockData();
                windowTitle = mock.title;
                appName = mock.app;
            }
        }
        else {
            // Mock mode
            const mock = getMockData();
            windowTitle = mock.title;
            appName = mock.app;
        }
        // Track window changes
        if (windowTitle !== lastWindowTitle) {
            windowChangeCount++;
            lastWindowTitle = windowTitle;
        }
        // Track app changes
        if (appName !== lastAppName) {
            currentAppStartTime = now;
            lastAppName = appName;
            windowChangeCount = 0;
        }
        // Calculate context for classification
        const durationInCurrentApp = (now - currentAppStartTime) / 60000;
        const timeSinceLastInput = (now - lastInputTime) / 60000;
        // Detect if video is likely playing
        const isVideoPlaying = (appName.toLowerCase().includes('youtube') ||
            appName.toLowerCase().includes('netflix') ||
            appName.toLowerCase().includes('hulu')) && timeSinceLastInput > 2;
        // Classify the activity
        const classification = classifyActivity(appName, windowTitle, {
            durationMinutes: durationInCurrentApp,
            hasInputActivity,
            windowChangeCount,
            lastInputMinutesAgo: timeSinceLastInput,
            isVideoPlaying,
            isFullscreen: false
        });
        // Create the activity record
        const activity = {
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
            isIdle: classification.isIdle,
            idleTimeSeconds: idleTimeSec,
            durationSeconds: Math.round(timeSinceLastCheck),
            hasInputActivity
        };
        // Record activity if significant change or every minute
        const shouldRecord = !lastActivity ||
            lastActivity.appName !== activity.appName ||
            lastActivity.windowTitle !== activity.windowTitle ||
            lastActivity.isIdle !== activity.isIdle ||
            classification.isSuspicious ||
            timeSinceLastCheck >= 60;
        if (shouldRecord) {
            activities.push(activity);
            offlineQueue.push(activity);
            lastActivity = activity;
            logActivity(activity);
            if (classification.isSuspicious) {
                console.warn(`⚠️  SUSPICIOUS: ${classification.suspiciousReason}`);
            }
        }
        if (activities.length > 2000) {
            activities.splice(0, activities.length - 1000);
        }
    }
    catch (err) {
        console.error('Error checking activity:', err);
    }
}
function logActivity(activity) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    let icon = '⚪';
    if (activity.productivityLevel === 'productive')
        icon = '🟢';
    else if (activity.productivityLevel === 'idle')
        icon = '💤';
    else if (activity.productivityLevel === 'unproductive')
        icon = '🔴';
    else if (activity.productivityLevel === 'neutral')
        icon = '🟡';
    const idleStr = activity.isIdle ? ' [IDLE]' : '';
    const suspiciousStr = activity.isSuspicious ? ' ⚠️' : '';
    console.log(`[${time}] ${icon} ${activity.appName}` +
        ` | ${activity.categoryName}` +
        ` | Score: ${activity.productivityScore}` +
        `${idleStr}${suspiciousStr}`);
    if (activity.windowTitle.length > 50) {
        console.log(`     "${activity.windowTitle.substring(0, 50)}..."`);
    }
    else {
        console.log(`     "${activity.windowTitle}"`);
    }
    if (activity.suspiciousReason) {
        console.log(`     ⚠️ ${activity.suspiciousReason}`);
    }
}
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function getMockData() {
    const scenarios = [
        { title: 'Floor Plan v2.dwg - AutoCAD 2024', app: 'AutoCAD' },
        { title: 'Project Budget Q1.xlsx - Excel', app: 'Microsoft Excel' },
        { title: 'Downtown Office Complex - Revit', app: 'Revit' },
        { title: 'Email: Re: Client Meeting Tomorrow', app: 'Microsoft Outlook' },
        { title: 'Lo-Fi Beats to Study/Relax To - YouTube', app: 'YouTube' },
        { title: '#general | Slack', app: 'Slack' },
        { title: 'Design Review - Zoom Meeting', app: 'zoom.us' },
        { title: 'Project Proposal.docx - Word', app: 'Microsoft Word' },
        { title: 'Facebook - News Feed', app: 'Facebook' },
        { title: 'Netflix - Browse', app: 'Netflix' },
        { title: 'Amazon.com: Online Shopping', app: 'Amazon' },
        { title: 'Desktop', app: 'Finder' },
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
}
async function syncToServer() {
    if (offlineQueue.length === 0)
        return;
    if (!isOnline) {
        console.log(`📴 Offline - ${offlineQueue.length} activities queued for later`);
        saveOfflineQueue();
        return;
    }
    // Process in batches of 50 to avoid payload too large
    const BATCH_SIZE = 50;
    let totalSynced = 0;
    let totalSuspicious = 0;
    while (offlineQueue.length > 0) {
        const batchSize = Math.min(BATCH_SIZE, offlineQueue.length);
        const batch = offlineQueue.splice(0, batchSize);
        try {
            const payload = {
                employeeId: config.employeeId,
                activities: batch.map(a => ({
                    id: a.id,
                    timestamp: a.timestamp,
                    appName: a.appName,
                    windowTitle: a.windowTitle,
                    category: a.category,
                    categoryName: a.categoryName,
                    productivityScore: a.productivityScore,
                    productivityLevel: a.productivityLevel,
                    isSuspicious: a.isSuspicious,
                    suspiciousReason: a.suspiciousReason,
                    isIdle: a.isIdle,
                    idleTimeSeconds: a.idleTimeSeconds,
                    durationSeconds: a.durationSeconds
                }))
            };
            const response = await fetch(`${config.serverUrl}/api/activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const result = await response.json();
                totalSynced += batch.length;
                totalSuspicious += result.data?.suspiciousCount || 0;
            }
            else {
                offlineQueue.unshift(...batch);
                console.error(`Sync failed for batch: ${response.statusText}`);
                break;
            }
        }
        catch (err) {
            offlineQueue.unshift(...batch);
            isOnline = false;
            console.error('Sync error:', err);
            break;
        }
    }
    if (totalSynced > 0) {
        console.log(`✓ Synced ${totalSynced} activities`);
        if (totalSuspicious > 0) {
            console.warn(`⚠️ Server flagged ${totalSuspicious} suspicious activities`);
        }
        lastSyncTime = Date.now();
        saveOfflineQueue();
    }
}
async function checkOnlineStatus() {
    try {
        const response = await fetch(`${config.serverUrl}/api/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        const wasOffline = !isOnline;
        isOnline = response.ok;
        if (wasOffline && isOnline && offlineQueue.length > 0) {
            console.log('🌐 Back online - syncing queued activities...');
            syncToServer();
        }
    }
    catch {
        isOnline = false;
    }
}
function loadConfig() {
    try {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        if (fs.existsSync(configPath)) {
            const saved = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            config = { ...config, ...saved };
        }
    }
    catch (err) {
        console.error('Failed to load config:', err);
    }
}
function saveConfig() {
    try {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
    catch (err) {
        console.error('Failed to save config:', err);
    }
}
function loadOfflineQueue() {
    try {
        const queuePath = path.join(app.getPath('userData'), 'offline-queue.json');
        if (fs.existsSync(queuePath)) {
            const data = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
            if (Array.isArray(data)) {
                offlineQueue.push(...data);
                console.log(`📦 Loaded ${data.length} queued activities from disk`);
            }
        }
    }
    catch (err) {
        console.error('Failed to load offline queue:', err);
    }
}
function saveOfflineQueue() {
    try {
        const queuePath = path.join(app.getPath('userData'), 'offline-queue.json');
        fs.writeFileSync(queuePath, JSON.stringify(offlineQueue, null, 2));
    }
    catch (err) {
        console.error('Failed to save offline queue:', err);
    }
}
export function setupIpcHandlers() {
    ipcMain.handle('tracker:getStatus', () => {
        return {
            isOnline,
            activitiesCount: activities.length,
            queuedCount: offlineQueue.length,
            lastActivity,
            config
        };
    });
    ipcMain.handle('tracker:getStats', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayActivities = activities.filter(a => new Date(a.timestamp) >= today).map(a => ({
            category: a.category,
            duration: a.durationSeconds,
            isIdle: a.isIdle,
            isSuspicious: a.isSuspicious,
            appName: a.appName,
            windowTitle: a.windowTitle
        }));
        return generateDailySummary(config.employeeId, todayActivities);
    });
    ipcMain.handle('tracker:getRecentActivities', () => {
        return activities.slice(-50).reverse();
    });
    ipcMain.handle('tracker:updateConfig', (_, newConfig) => {
        config = { ...config, ...newConfig };
        saveConfig();
        return config;
    });
}
export function getTrackingStatus() {
    return {
        activitiesCount: activities.length,
        queuedCount: offlineQueue.length,
        isOnline,
        lastSync: lastSyncTime ? new Date(lastSyncTime).toISOString() : null,
        lastActivity,
        config
    };
}
//# sourceMappingURL=tracker.js.map