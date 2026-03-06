# 5 OpenClaw Issues That Waste Hours (And Their 2-Minute Fixes)

Cross-platform content versions for Shift 2 distribution.

---

## Reddit Version (r/openclaw)

**Title:** PSA: 5 OpenClaw Issues That Waste Hours (And Their 2-Minute Fixes)

**Body:**

After helping debug OpenClaw setups all week, here are the 5 issues I see wasting the most time — and exactly how to fix each one:

---

**1. "OpenClaw not working" after update**

The culprit: **Node 22 is now REQUIRED**

Check your version:
```bash
node --version
```

If you see v20.x, upgrade:
```bash
nvm install 22 && nvm use 22
```

Then reinstall OpenClaw.

---

**2. 2026.2.19 upgrade broke all tool connections**

New scopes (`operator.write`/`read`) weren't auto-granted during upgrade.

Fix it:
```bash
openclaw devices rotate --device <id> --scope operator.admin --scope operator.write --scope operator.read
```

See GitHub #23006 for full workaround.

---

**3. Burned through API quota with 106-hour timeouts**

Add rate limiting to your agent config:
```yaml
rateLimit:
  requestsPerMinute: 10
```

Also consider local models (`mlx-local/llama-3.2-1b`) for dev/testing.

---

**4. Deleted cron jobs still running?**

Ghost jobs live in `.tmp` recovery files:
```bash
rm ~/.openclaw/cron/*.tmp
openclaw gateway restart
```

---

**5. "Plugin not available" after fresh install**

Enable them manually:
1. Gateway Dashboard → Settings → Plugin entries
2. Enable Discord/Telegram/WhatsApp
3. Save
4. Restart gateway

---

**What issues are you running into?** Drop them below and I'll add solutions to the list.
