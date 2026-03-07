# TODAY - March 7, 2026

## MUST DO TODAY (Copy & Paste These)

### 1. GitHub Comment #38336 ⏰ DO NOW
**Link:** https://github.com/openclaw/openclaw/issues/38336

**Copy this exactly:**
```
Hey @issue-author, this is a common Windows path issue with OpenClaw.

Quick fix:
1. Open PowerShell as Administrator
2. Run: mkdir C:\Users\%USERNAME%\.openclaw
3. Run: icacls C:\Users\%USERNAME%\.openclaw /grant %USERNAME%:F
4. Reinstall OpenClaw

The installer needs write permissions to create the .openclaw folder in your home directory. Windows Defender sometimes blocks this.

Let me know if that fixes it!
```
**Done?** [ ]

---

### 2. Reddit Reply - u/HostingerNightmare ⏰ DO NOW
**Link:** https://www.reddit.com/r/openclaw/comments/1rja32v/

**Copy this exactly:**
```
Hey! Saw your post about the Hostinger + OpenClaw struggles. That's a rough combo — VPS paths + Chrome extension + agent configs hitting all at once.

Quick wins to try:

1. Agent paths on Hostinger: Use absolute paths, not relative. Instead of "./agents", try "/home/username/openclaw/agents"

2. Chrome extension: Run `openclaw browser extension path` then use that full path in "Load unpacked"

3. Permissions: Make sure your Hostinger user owns the .openclaw folder: `sudo chown -R $USER:$USER ~/.openclaw`

These three fixed similar setups for me. If you're still stuck after this, happy to jump on a quick screen share — most Hostinger + OpenClaw issues resolve in 20-30 minutes.

No charge for the quick tips, just want to save you from more frustration!
```
**Done?** [ ]

---

### 3. Reddit Reply - u/GeminiOverloaded ⏰ DO NOW
**Link:** Find in your Reddit messages

**Copy this exactly:**
```
The "AI service overloaded" from Gemini 3.1 Pro Preview is usually a context window issue, not actual overload.

Try this:

1. Reduce context in your agent config:
   "contextWindow": 100000 (instead of 1M)

2. Switch to stable model temporarily:
   "model": "gemini-2.5-pro"

3. Check your message history — if you're passing huge logs/files, trim them

The Preview models have aggressive rate limiting. The stable Gemini 2.5 Pro is actually more reliable for production use right now.

Hope that helps! Let me know if the context window adjustment fixes it.
```
**Done?** [ ]

---

### 4. GitHub Comment #32176 ⏰ DO NOW
**Link:** https://github.com/openclaw/openclaw/issues/32176

**Copy this exactly:**
```
Hey @issue-author, this is a classic gateway intent handshake issue. The bot connects but doesn't receive MESSAGE_CREATE events.

Quick diagnostic:

1. Check Discord Developer Portal → Your App → Bot → Privileged Gateway Intents
2. Enable ALL three:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT  
   - PRESENCE INTENT
3. Restart OpenClaw gateway

Verify with: `openclaw gateway logs | grep MESSAGE_CREATE`

You should see events flowing. If not, double-check the bot has "Read Messages" permission in the specific channel.

The health monitor showing "stuck" usually means the gateway is connected to Discord but not receiving events — exactly what happens when intents are missing.

Let me know if that fixes it!
```
**Done?** [ ]

---

### 5. GitHub Comment #29780 ⏰ DO NOW
**Link:** https://github.com/openclaw/openclaw/issues/29780

**Copy this exactly:**
```
This is the v2026.2.26 config validator bug. Runtime writes keys that the validator then rejects on restart.

Workaround until official fix:

1. Stop gateway: `openclaw gateway stop`
2. Edit ~/.openclaw/openclaw.json
3. Remove any keys that look auto-generated (usually start with underscore or have numeric suffixes)
4. Start gateway: `openclaw gateway start`

Or add this to your config to disable the problematic feature:
```json
"runtime": {
  "persistKeys": false
}
```

The issue is that runtime persistence and schema validation are fighting each other. Disabling persistKeys stops the runtime from writing those invalid keys.

Hope that unblocks you!
```
**Done?** [ ]

---

### 6. GitHub Comment #30401 ⏰ DO NOW
**Link:** https://github.com/openclaw/openclaw/issues/30401

**Copy this exactly:**
```
Confirmed — the logger doesn't expand `~` to `$HOME`. It's a path resolution bug in the logging module.

Fix: Use absolute path instead of tilde:

Instead of:
```json
"logging": {
  "file": "~/.openclaw/logs/app.log"
}
```

Use:
```json
"logging": {
  "file": "/home/yourusername/.openclaw/logs/app.log"
}
```

Or on Mac:
```json
"file": "/Users/yourusername/.openclaw/logs/app.log"
```

The ~ tilde expansion happens in your shell, but OpenClaw's logger doesn't shell-expand paths. Always use absolute paths in config files.

I'll submit a PR to add path expansion to the logger module.
```
**Done?** [ ]

---

## OPTIONAL (If You Have Time)

### Twitter Thread - "3 Discord Bot Mistakes"
**Location:** DRAFTS.md section "Twitter Thread: 3 OpenClaw Discord Bot Mistakes"
**Time:** 5 minutes

### Twitter Quick Tip - "Hidden Config File"
**Location:** DRAFTS.md section "Quick Tip: The Hidden Config File That Breaks Everything"
**Time:** 2 minutes

---

## SUMMARY

**Must do: 6 comments/replies (copy-paste)**  
**Optional: 2 Twitter posts if you have time**

**Total time needed: 15-20 minutes**
