# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

### Tavily Search API

- API Key: `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`
- Used for: AI-optimized web search

### Google Gemini API

- API Key: `[STORED_SECURELY]`
- Free tier: 60 requests/minute
- Use for: Simple chats, basic tasks (FREE)

### DeepSeek API

- API Key: `[STORED_SECURELY]`
- Cost: $0.0003/1K tokens (5x cheaper than kimi)
- Use for: Coding, analysis (CHEAP)

### Moonshot API

- API Key: `[STORED_SECURELY]`
- Cost: $0.0015/1K tokens
- Use for: Complex tasks, high quality

---

Add whatever helps you do your job. This is your cheat sheet.

### Google API Access (Updated Feb 28)
**Scopes now include:**
- ✅ Google Calendar (read/write/events) - Event Scout auto-booking
- ✅ Google Sheets (read-only) - Ninja CRM contact analysis
- **Token expires:** 1 hour (auto-refresh enabled)
