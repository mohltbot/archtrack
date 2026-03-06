# Discord Version (OpenClaw Official)

**Short, code-block friendly, conversational**

---

**Message:**

🧰 **5 Common Issues & Quick Fixes**

Based on debugging sessions this week — these are the issues wasting the most time:

**1. Node 22 Required**
```bash
node --version  # Should show v22.x
nvm install 22 && nvm use 22
```

**2. 2026.2.19 Broke Connections**
```bash
openclaw devices rotate --device <id> --scope operator.admin --scope operator.write --scope operator.read
```
See GitHub #23006

**3. Rate Limit / API Burn**
Add to your agent config:
```yaml
rateLimit:
  requestsPerMinute: 10
```

**4. Ghost Cron Jobs**
```bash
rm ~/.openclaw/cron/*.tmp
openclaw gateway restart
```

**5. Plugin Not Available**
Gateway Dashboard → Settings → Plugin entries → Enable → Save → Restart

---

Running into something else? Drop it in #help 👇
