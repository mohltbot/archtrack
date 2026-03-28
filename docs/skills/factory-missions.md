# Factory Missions Integration

**Source:** Ben's Bites March 28, 2026 - Factory AI  
**Tool:** Factory Missions (long-running agents)

## What are Missions?

Factory Missions are long-running AI agents designed to automate large software tasks:
- Building applications from scratch
- Code migrations
- AI research
- Any complex, multi-step software task

## Key Features

- **Long-running:** Agents work for hours/days, not seconds
- **Autonomous:** Minimal human intervention needed
- **Large scope:** Handle entire projects, not just snippets
- **Any model:** Works with any LLM provider
- **Any IDE:** Available in any terminal/IDE

## Installation

```bash
# Run setup script
./scripts/setup-factory-missions.sh

# Or manually
npm install -g pm2
mkdir -p ~/.openclaw/missions
```

## Usage

### Start a mission
```bash
openclaw missions start build-app \
  --prompt "Build a React app with auth and payments" \
  --context ./PROJECT.md \
  --timeout 4h
```

### List active missions
```bash
openclaw missions list
```

### Check mission logs
```bash
openclaw missions logs build-app
```

### Stop a mission
```bash
openclaw missions stop build-app
```

## Mission Types

### 1. Greenfield Development
Build new applications from scratch:
```bash
openclaw missions start greenfield \
  --prompt "Build a Next.js SaaS with Stripe, Clerk auth, and Postgres" \
  --output ./my-new-app
```

### 2. Migration
Migrate codebases:
```bash
openclaw missions start migrate \
  --prompt "Migrate from Express to Fastify" \
  --source ./src \
  --test
```

### 3. Research
Deep research tasks:
```bash
openclaw missions start research \
  --prompt "Research optimal DB schema for analytics" \
  --output ./research-report.md
```

## How It Works

1. **Define mission** — Prompt + context + constraints
2. **Agent plans** — Breaks into subtasks
3. **Long execution** — Works autonomously
4. **Checkpoints** — Saves progress periodically
5. **Completion** — Delivers final output

## Comparison to Regular Agents

| Feature | Regular Agents | Factory Missions |
|---------|---------------|------------------|
| Duration | Seconds/minutes | Hours/days |
| Scope | Single task | Entire project |
| Intervention | High | Low |
| Output | Code snippets | Full applications |

## Integration with OpenClaw

```json
{
  "missions": {
    "enabled": true,
    "maxConcurrent": 3,
    "defaultTimeout": "4h",
    "checkpointInterval": "15m"
  }
}
```

## Best Practices

1. **Start with clear prompts** — Missions need direction
2. **Provide context** — PROJECT.md, CONTEXT.md
3. **Set timeouts** — Prevent runaway agents
4. **Monitor checkpoints** — Review progress periodically
5. **Test outputs** — Missions aren't perfect

## Cost Considerations

- Longer runtime = higher API costs
- Set budgets per mission
- Use local models for cost savings

## Documentation

- Factory: https://www.factory.ai
- Droid: https://docs.factory.ai/droid
