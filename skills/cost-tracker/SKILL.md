# Cost Tracker Skill

Track API costs across all providers and monitor your $200/month budget.

## Installation

Already installed in your workspace at `skills/cost-tracker/`

## Usage

### Check Budget Status
```bash
node skills/cost-tracker/track.js status
```

### Log an API Call Manually
```bash
node skills/cost-tracker/track.js log moonshot kimi-k2.5 15000 2000 "Description"
```

### Programmatic Usage
```javascript
const { logAPICall, getBudgetStatus } = require('./skills/cost-tracker/track');

// Log an API call
logAPICall('moonshot', 'kimi-k2.5', 15000, 2000, 'Mission Control update');

// Check budget
const status = getBudgetStatus();
console.log(`Spent: $${status.spent}, Remaining: $${status.remaining}`);
```

## Pricing

| Provider | Model | Input | Output |
|----------|-------|-------|--------|
| Moonshot | kimi-k2.5 | $0.0015/1K | $0.0015/1K |
| Gemini | 1.5-flash | $0.0001/1K | $0.0001/1K |
| DeepSeek | chat | $0.0003/1K | $0.0003/1K |
| Anthropic | claude-3-sonnet | $0.003/1K | $0.015/1K |

## Budget Alerts

- **OK**: < 75% ($150)
- **Warning**: 75-90% ($150-180)
- **Critical**: > 90% ($180+)

## Data Storage

Costs are logged to `mission-control/data/db.json` in the expenses array.
