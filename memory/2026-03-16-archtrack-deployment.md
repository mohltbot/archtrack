# ArchTrack Deployment & Setup - March 16, 2026

## What We Built Today

### 1. Production Server (DigitalOcean)
- **IP:** 165.227.78.107
- **Dashboard URL:** http://165.227.78.107
- **Server API:** http://165.227.78.107:3001
- **Status:** Live and working
- **Process Manager:** PM2 (auto-restart on crash)
- **Reverse Proxy:** Nginx

### 2. What Was Broken & Fixed

#### Problem 1: Docker Build Failed (Render)
**Root Cause:** Dockerfile was broken in 3 ways:
1. Installed deps then overwrote node_modules with COPY
2. Build script only type-checked, never compiled server
3. Server looked for static files in wrong directory

**Fix:** Rewrote Dockerfile with multi-stage build, fixed npm build script, fixed static file paths

#### Problem 2: Desktop Tracker Deleted
**Root Cause:** Files accidentally deleted in March 12 sync commit (d9fbd407)
- package.json, tsconfig.json, vite.config.ts
- src/main.ts, src/tracker.ts, src/classifier.ts

**Fix:** Restored all files from git history

#### Problem 3: Vite Build Breaking Node.js Modules
**Root Cause:** Vite was treating fs/path as browser modules

**Fix:** Added `ssr: true` to vite.config.ts to tell Vite this is a Node.js build

#### Problem 4: Wrong Server URL
**Root Cause:** Tracker defaulted to localhost:3001

**Fix:** Updated default serverUrl in tracker.ts to production server

#### Problem 5: macOS Screen Recording Permission
**Root Cause:** active-win library needs Screen Recording permission

**Fix:** Added Electron.app to System Settings › Privacy & Security › Screen Recording

### 3. Current Status

**Server:** ✅ Working
- Dashboard accessible at http://165.227.78.107
- API endpoint working (/api/activity)
- Test activity successfully synced

**Desktop Tracker:** ✅ Working (after restart)
- Builds without errors (SSR mode)
- Connects to production server
- Tracks activity and syncs

### 4. How to Run Everything

**Start Tracker (Employee):**
```bash
cd ~/.openclaw/workspace/arch-firm-dashboard/desktop
npm start
```

**View Dashboard:**
http://165.227.78.107

**Login:**
- Username: admin
- Password: changeme123

### 5. For New Employees

1. Clone repo: `git clone https://github.com/mohltbot/mission-control.git`
2. Go to desktop folder: `cd mission-control/arch-firm-dashboard/desktop`
3. Install deps: `npm install`
4. Run: `npm start`
5. Grant Screen Recording permission when prompted
6. Enter name and employee ID on first run

### 6. Key Files Changed Today

- `deployment/Dockerfile` - Fixed multi-stage build
- `admin/package.json` - Fixed build script
- `admin/server/index.ts` - Fixed static file paths
- `desktop/package.json` - Restored
- `desktop/vite.config.ts` - Added SSR mode
- `desktop/src/tracker.ts` - Updated server URL
- `desktop/src/main.ts` - Updated server URL
- `desktop/tsconfig.json` - Restored

### 7. What to Remember

- The desktop tracker needs Screen Recording permission on macOS
- If build shows warnings about fs/path, vite config needs `ssr: true`
- Server runs on port 3001 internally, Nginx proxies port 80
- Tracker syncs every 60 seconds
- Activities appear in dashboard immediately after sync

### 8. Next Steps for Production Use

1. Change default admin password (currently changeme123)
2. Set up SSL/HTTPS (Let's Encrypt)
3. Add employee accounts via dashboard
4. Distribute tracker to employees
5. Monitor server logs: `pm2 logs archtrack`

### 9. AI Chatbot Deployed (Basic Version)

**Status:** ✅ AIChatPanel restored and deployed
- **Location:** Bottom of dashboard
- **Features:** Ask questions about productivity data
- **Note:** This is the basic analytics chatbot. The "Genesis AI" floating chatbot was a different, more advanced version that was also deleted March 12 and not fully recovered.

**Files restored:**
- `admin/src/client/components/AIChatPanel.tsx`
- Updated `admin/src/client/pages/Dashboard.tsx` to include AIChatPanel
- Added `lucide-react` dependency

**Server Deploy Commands Used:**
```bash
cd /opt/archtrack
rm -rf arch-firm-dashboard/admin/data
git checkout -- .
git clean -fd
git pull origin main
cd arch-firm-dashboard/admin
rm -rf node_modules package-lock.json
npm install
npm install @rollup/rollup-linux-x64-gnu --save-dev
npm run build
pm2 restart archtrack
```

### 10. Outstanding Issues / Future Work

1. **Genesis AI Floating Chatbot** - More advanced version mentioned by user, not recovered
2. **SSL/HTTPS** - Currently HTTP only
3. **Employee Onboarding Flow** - Need smoother setup for new employees
4. **Database Persistence** - Currently SQLite, may need Postgres for scale

---
Documented: March 16, 2026
Last Updated: March 16, 2026 (9:07 AM)
