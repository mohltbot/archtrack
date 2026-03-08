"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_store_1 = __importDefault(require("electron-store"));
const tracker_1 = require("./tracker");
const store = new electron_store_1.default({
    defaults: {
        employeeId: 'emp-001',
        employeeName: 'Mohammed',
        serverUrl: 'http://localhost:3001'
    }
});
let tray = null;
electron_1.app.whenReady().then(async () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     ArchTrack Auto-Tracker v2.0        ║');
    console.log('║  Automatic Activity Tracking System    ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    createTray();
    await (0, tracker_1.startTracking)();
    console.log('');
    console.log('✓ Tracker running in background');
    console.log('✓ Detecting active windows every 5 seconds');
    console.log('✓ Syncing to admin dashboard every 30 seconds');
});
function createTray() {
    // Simple colored square icon (green for active)
    const icon = electron_1.nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABWSURBVDiNY2RgYPgPBAzUAIY1QLwKiP9D+Tg1oCkY1gDxw/8pDIOJ41SDa4ZRM7E0w2wYdTMxDcE0o+smhGFG3UxsM8xuRt1MbDOsbsI1jFE3E9sMtxsZ1QAAtg4Xy4eo4TkAAAAASUVORK5CYII=');
    tray = new electron_1.Tray(icon);
    tray.setToolTip('ArchTrack - Activity Tracker');
    updateTrayMenu();
    // Update menu every 5 seconds to show current status
    setInterval(updateTrayMenu, 5000);
}
function updateTrayMenu() {
    if (!tray)
        return;
    const status = (0, tracker_1.getTrackingStatus)();
    const employeeId = store.get('employeeId');
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: 'ArchTrack v2.0', enabled: false },
        { type: 'separator' },
        { label: `Employee: ${employeeId}`, enabled: false },
        { label: `Activities: ${status.activitiesCount}`, enabled: false },
        { label: `Queued: ${status.queuedCount}`, enabled: false },
        { label: `Status: ${status.isOnline ? '🟢 Online' : '🔴 Offline'}`, enabled: false },
        { type: 'separator' },
        { label: 'Quit', click: () => electron_1.app.quit() }
    ]);
    tray.setContextMenu(contextMenu);
}
electron_1.app.on('window-all-closed', () => {
    // Keep running in background
});
