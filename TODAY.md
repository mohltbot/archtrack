# TODAY - March 7, 2026

## ✅ DONE TODAY

- [x] GitHub Comment #38336 - Windows path fix
- [x] Reddit Reply - u/HostingerNightmare  
- [x] Reddit Reply - u/GeminiOverloaded
- [x] GitHub Comment #32176 - Discord bot intents
- [x] GitHub Comment #29780 - Config validator bug
- [x] GitHub Comment #30401 - Tilde path bug

---

## OPTIONAL (Do If You Have Time)

### Twitter Thread - "3 Discord Bot Mistakes"

Tweet 1:
Your Discord bot shows online but doesn't respond to messages?

You're probably missing these 3 gateway intents.

Here's the 2-minute fix that saves hours of debugging: 🧵

Tweet 2:
OpenClaw's Discord integration requires 3 Privileged Gateway Intents:

• GUILDS — Know which servers/channels exist
• GUILD_MESSAGES — Receive message events  
• MESSAGE_CONTENT — Actually read message content

Without all 3, your bot logs in but stays "deaf."

Tweet 3:
Go to Discord Developer Portal → Your App → Bot → Privileged Gateway Intents

Enable ALL three:
✅ SERVER MEMBERS INTENT
✅ MESSAGE CONTENT INTENT
✅ PRESENCE INTENT

Then restart your OpenClaw gateway.

Tweet 4:
Discord made MESSAGE_CONTENT a privileged intent in 2022.

Most bots need it explicitly enabled now.

OpenClaw needs it to read your messages and respond.

Without it: bot connects, shows online, but never "hears" anything.

Tweet 5:
Test it:

1. Send a message in your configured channel
2. Check openclaw gateway logs
3. You should see: "MESSAGE_CREATE event received"

If not → intents aren't enabled correctly.

Tweet 6:
Also check:

• Bot has "Send Messages" permission in the channel
• requireMention: false (if you want replies without @bot)
• Your user is paired: DM the bot first for pairing code

Tweet 7:
Still stuck? I debug OpenClaw configs for $75 in 30 minutes.

DM me your error — I'll point you in the right direction (free).

Or book a session: [link when ready]

---

### Twitter Quick Tip - "Hidden Config File"

Spent 2 hours debugging OpenClaw?

The fix is probably in ~/.openclaw/openclaw.json

Most people don't know this file exists because it's in a hidden folder.

On Mac: Cmd+Shift+G → paste ~/.openclaw
On Windows: %USERPROFILE%\.openclaw

Your entire config lives here. Bookmark it.

---

## SUMMARY

✅ 6 must-do items completed  
⏳ 2 optional Twitter posts ready to copy-paste

**Time needed for optional: 7 minutes**
