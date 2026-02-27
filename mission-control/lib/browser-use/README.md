# Browser Use Agent API Integration

> From Ben's Bites (Feb 26, 2026): https://docs.cloud.browser-use.com/

Browser Use provides a cloud-based browser automation API that can complete complex web tasks with a single API call. This integration enables agents to interact with websites programmatically without running a local browser.

## Why Browser Use?

| Local Browser | Browser Use API |
|--------------|-----------------|
| Requires local Chrome/Puppeteer | Cloud-hosted browsers |
| High memory usage (~500MB) | Zero local overhead |
| Complex setup | Single API call |
| Limited concurrency | Scale to multiple sessions |
| Maintenance burden | Managed infrastructure |

## Use Cases for Mission Control

1. **Ben's Bites Scanning** - Scrape newsletter when Gmail API unavailable
2. **Research Tasks** - Web search and information extraction
3. **Monitoring** - Check website status, competitor analysis
4. **Form Submission** - Automated data entry tasks
5. **Screenshot Capture** - Visual verification of deployments

## API Overview

```typescript
import { BrowserUseAgent } from '@/lib/browser-use';

const agent = new BrowserUseAgent({ apiKey: process.env.BROWSER_USE_API_KEY });

const result = await agent.run({
  task: 'Go to bensbites.com and extract the latest newsletter title',
  maxSteps: 10,
});

console.log(result.output); // Extracted content
```

## Configuration

```env
BROWSER_USE_API_KEY=your_api_key_here
BROWSER_USE_BASE_URL=https://api.browser-use.com
```

## Pricing (as of Feb 2026)

- Free tier: 100 requests/month
- Starter: $29/month for 1,000 requests
- Pro: $99/month for 5,000 requests

For our $200/mo budget, Browser Use fits well for specific automation needs.

## Integration with OpenClaw

This skill can be added to OpenClaw as a tool, enabling:
```
User: "Check the latest Ben's Bites newsletter"
Agent: Uses browser-use skill to scrape and extract
```
