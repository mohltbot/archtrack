# Outreach Templates - OpenClaw Debugger

## Twitter Reply Templates

### Template 1: Node Version Issues
"Node 22 is required for latest OpenClaw. Try `node --version` to verify. If stuck on Node 20, use nvm: `nvm install 22 && nvm use 22`. Then reinstall OpenClaw. Still stuck? We're here to help! — OpenClaw Debugger Team"

### Template 2: Rate Limit / API Quota Issues  
"Rate limits are rough! Quick fixes: 1) Add rate limiting to your config 2) Use local models (mlx-local/llama-3.2-1b) for dev/testing 3) Implement token budgeting. Need help setting up guardrails? DM us! — OpenClaw Debugger Team"

### Template 3: 2026.2.19 Upgrade Breakage
"Known issue with 2026.2.19! New scopes weren't auto-granted. Fix: `openclaw devices rotate --device <id> --scope operator.admin --scope operator.write --scope operator.read`. See GitHub #23006 for full workaround. — OpenClaw Debugger Team"

### Template 4: Models Not Responding
"'All models failed' = API key or rate limit issue. Check: 1) `openclaw doctor` for key validity 2) Try simple model first: `model: local/mlx-local/llama-3.2-1b` 3) Check logs: `openclaw logs --follow` — OpenClaw Debugger Team"

### Template 5: Cron/Ghost Jobs
"The .tmp recovery files are the culprit! Quick fix: `rm ~/.openclaw/cron/*.tmp` then restart gateway. Also follow GitHub #6814 for the permanent fix. — OpenClaw Debugger Team"

### Template 6: Plugin Not Available
"After install, plugins need enabling! Go to Gateway Dashboard > Settings > Plugin entries > Enable Discord/Telegram/WhatsApp > Save. Then restart gateway. — OpenClaw Debugger Team"

### Template 7: General "Not Working"
"Start with `openclaw doctor` - it catches 90% of issues. Then check `openclaw status --all` and `openclaw logs --follow`. Still stuck? We're here to debug! — OpenClaw Debugger Team"

## DM Templates

### DM 1: High Frustration (Node/Setup Issues)
"Hey! Saw your tweet about the [X-hour] struggle with OpenClaw - that's rough. The [specific issue] is tricky but fixable. Happy to jump on a quick call to walk through your setup and get you unblocked. We've helped folks through this exact issue. DM me if interested! — OpenClaw Debugger Team"

### DM 2: Rate Limit/API Burn
"That [timeout/quota issue] is a special kind of pain 😅 Your agent really went full throttle! Quick wins: [2-3 actionable tips]. Want help setting up guardrails so this doesn't happen again? We're here! — OpenClaw Debugger Team"

## Discord Support Templates

### Discord 1: Plugin Not Available
"Hey! After a fresh install, you need to enable plugins manually. Go to your Gateway Dashboard (http://localhost:18789) > Settings > Plugin entries > Enable the ones you need > Save. Then restart the gateway with `openclaw gateway restart`. Let me know if that helps!"

### Discord 2: Bot Online But Not Responding
"This is usually one of three things: 1) Bot lacks privileged intents (check Discord Developer Portal > Bot > Privileged Gateway Intents - enable all three) 2) Token is invalid/regenerated 3) Health-monitor is restarting due to stuck state. Check `openclaw logs --follow` for clues. What do you see?"

### Discord 3: Browser Control Issues
"Browser control not responding usually means the gateway needs a restart. Try: 1) `openclaw gateway restart` or use the OpenClaw.app menubar 2) Make sure Chrome is installed and `browser.executablePath` is set correctly in config 3) For headless servers, you may need Xvfb. Need more help?"
