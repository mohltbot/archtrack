import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, powerMonitor } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipc';
import { initDatabase } from './db/database';
import Store from 'electron-store';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Initialize store early
const store = new Store();

// Initialize database BEFORE app ready (for IPC handlers)
let dbInitialized = false;

function initializeApp() {
  // Initialize database first
  if (!dbInitialized) {
    initDatabase();
    dbInitialized = true;
  }
  
  // Create window
  mainWindow = createWindow();
  
  // Register IPC handlers with the window reference
  registerIpcHandlers(mainWindow);
  
  // Create system tray
  createTray();
  
  // Setup power monitor for idle detection
  powerMonitor.on('suspend', () => {
    console.log('System suspended');
  });
  
  powerMonitor.on('resume', () => {
    console.log('System resumed');
  });
}

app.whenReady().then(initializeApp);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
    registerIpcHandlers(mainWindow);
  } else if (mainWindow) {
    mainWindow.show();
  }
});

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  const isDev = !app.isPackaged;
  if (isDev) {
    window.loadURL('http://localhost:5173');
    window.webContents.openDevTools();
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  window.once('ready-to-show', () => {
    window.show();
  });

  // Handle window close
  window.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      window.hide();
    }
  });

  return window;
}

function createTray(): void {
  // Create a simple colored square as tray icon
  const size = 16;
  const canvas = document?.createElement?.('canvas');
  let trayIcon: Electron.NativeImage;
  
  try {
    const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch {
    // Create a 16x16 colored image programmatically
    trayIcon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAXklEQVQ4T2NkYGD4z0ABYBw1gGE0DgwD2NjY3LCwsPjPQM4AmAaxsbH9x6kZWQ1gWIw0AN0QbGxs/3Fqw2YAy2KkAdgMwGkwgE0zNgPYNGMzwGgw4OPj+49NGwBzOBgN4E3p8wAAAABJRU5ErkJggg=='
    );
  }
  
  // Resize for tray
  trayIcon = trayIcon.resize({ width: 16, height: 16 });
  
  tray = new Tray(trayIcon);
  tray.setToolTip('ArchTrack - Time Tracker');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show ArchTrack',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Start Tracking',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray:start-tracking');
        }
      }
    },
    {
      label: 'Stop Tracking',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray:stop-tracking');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
  });
});