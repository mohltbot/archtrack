# ArchTrack Browser Extension

Track your productivity across the web. The ArchTrack browser extension captures your browsing activity and categorizes it automatically, syncing with your ArchTrack dashboard for comprehensive time analytics.

## 🚀 Quick Install

### Option 1: Chrome Web Store (Coming Soon)
Once published, install directly from the Chrome Web Store with one click.

### Option 2: Developer Mode (Current)
1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select this `browser-extension` folder
5. The ArchTrack icon will appear in your toolbar

### Option 3: Build from Source
```bash
cd arch-firm-dashboard/browser-extension
# Make any modifications
# Load as unpacked extension (see Option 2)
```

## ✨ Features

### Activity Tracking
- **Automatic URL capture** — Tracks domains and pages you visit
- **Time-on-page calculation** — Measures active engagement time
- **Idle detection** — Pauses tracking when you're away from keyboard
- **Privacy-first** — Data stays local until you choose to sync

### Smart Categorization
- **Automatic categorization** — Work, Social, Learning, Entertainment, etc.
- **Custom rules** — Define your own categorization patterns
- **Manual override** — Adjust categories when needed

### Seamless Sync
- **Dashboard integration** — Syncs with ArchTrack desktop app
- **Cross-device** — View activity from any device with ArchTrack
- **Offline support** — Queues data when offline, syncs when connected

### Privacy & Security
- **Local-first** — All data stored locally by default
- **No third-party tracking** — We don't track your tracking
- **Open source** — Full transparency, audit the code yourself
- **Optional sync** — You control when and what to sync

## 🏗️ Architecture

```
browser-extension/
├── manifest.json          # Extension manifest (v3)
├── background.js          # Service worker — core tracking logic
├── popup.html            # Extension popup UI
├── popup.js              # Popup interaction logic
└── README.md             # This file
```

### Components

#### Background Script (`background.js`)
- Runs as a service worker (Manifest V3)
- Listens for tab activation, URL changes, window focus
- Calculates time spent on each page
- Manages idle state detection
- Stores activity data locally
- Syncs with ArchTrack server when configured

#### Popup UI (`popup.html`, `popup.js`)
- Quick view of today's activity
- Start/stop tracking toggle
- Category override for current page
- Sync status indicator
- Link to full ArchTrack dashboard

#### Content Script (Future)
- Will enable in-page productivity features
- Focus mode overlay
- Distraction blocking
- Time limit warnings

## 🛠️ Development

### Prerequisites
- Chrome/Edge browser
- Text editor or IDE
- Basic knowledge of JavaScript

### Local Development
1. Make changes to source files
2. Go to `chrome://extensions/`
3. Find ArchTrack extension and click the **refresh** icon
4. Test your changes immediately

### Debug Mode
- Right-click the extension icon → **Inspect popup** for popup debugging
- Go to `chrome://extensions/` → **Service Worker** link for background debugging
- Check Console for logs and errors

### Building for Production
Currently, no build step is required. For future TypeScript migration:
```bash
npm install
npm run build
# Load the dist/ folder as unpacked extension
```

## 🔒 Permissions

The extension requires these permissions:

| Permission | Purpose |
|------------|---------|
| `tabs` | Track active tab changes and URLs |
| `activeTab` | Access current page for categorization |
| `storage` | Save activity data locally |
| `idle` | Detect when user is away |
| `alarms` | Periodic sync and cleanup tasks |
| `host permission: <all_urls>` | Track activity across all websites (can be restricted) |

### Privacy Note
We only store domain and time data, not page content. You can review everything we capture in the source code — it's all local and transparent.

## 🐛 Troubleshooting

### Extension not tracking?
- Check that it's enabled in `chrome://extensions/`
- Verify tracking is turned on (click icon, toggle should be ON)
- Check Console for errors (Inspect popup → Console)

### Sync not working?
- Ensure ArchTrack desktop app is running
- Check that sync is enabled in extension settings
- Verify network connection
- Check server URL configuration

### High CPU usage?
- Idle detection runs periodically — this is normal
- If excessive, check for errors in Console
- Try disabling and re-enabling the extension

## 🗺️ Roadmap

### v1.0 (March 2026) — Open Source Launch
- ✅ Core activity tracking
- ✅ Automatic categorization
- ✅ Dashboard sync
- ✅ Privacy-first design

### v1.1 (April 2026)
- Firefox support
- Focus mode overlay
- Daily productivity goals
- Weekly summary emails

### v1.2 (May 2026)
- Distraction blocking
- Site time limits
- Pomodoro integration
- Team/enterprise features

## 🤝 Contributing

We welcome contributions! See the main [ArchTrack repository](https://github.com/mohltbot/arch-firm-dashboard) for:
- Contribution guidelines
- Code of conduct
- Development setup
- Issue reporting

### Quick Contributions
- **Bug reports** — Open an issue with steps to reproduce
- **Feature requests** — Open an issue with use case
- **Documentation** — PRs welcome for README improvements
- **Translations** — Help us go global

## 📄 License

MIT License — see [LICENSE](../LICENSE) file for details.

## 🔗 Links

- [ArchTrack Dashboard](https://github.com/mohltbot/arch-firm-dashboard)
- [Open Source Checklist](../OPEN-SOURCE-CHECKLIST.md)
- [Issue Tracker](https://github.com/mohltbot/arch-firm-dashboard/issues)
- [Discord Community](https://discord.gg/archtrack) (coming soon)

---

**Built with ❤️ by the ArchTrack team**

*Part of the ArchTrack open source productivity suite — track time, analyze patterns, optimize your day.*
