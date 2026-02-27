# GitAgent Integration

> From Ben's Bites (Feb 26, 2026): https://www.gitagent.sh/

GitAgent is a git-native, framework-agnostic, open standard for defining AI agents. This integration provides a standardized way to define and version control agents within Mission Control.

## What is GitAgent?

GitAgent allows you to define AI agents as code using a simple JSON/YAML format that can be:
- Version controlled with git
- Shared across projects
- Executed by any compatible runner
- Framework-agnostic (works with OpenClaw, Claude Code, etc.)

## Structure

```
agents/
├── gitagent-schema.json    # JSON Schema for validation
├── README.md               # This file
└── examples/
    ├── bensbites-scanner.agent.json
    ├── nightly-worker.agent.json
    └── mission-control.agent.json
```

## Agent Definition Format

```json
{
  "$schema": "./gitagent-schema.json",
  "name": "example-agent",
  "version": "1.0.0",
  "description": "What this agent does",
  "author": "mohltbot",
  "runtime": {
    "type": "openclaw",
    "version": ">=2026.2.0"
  },
  "capabilities": ["read", "write", "exec"],
  "tools": ["browser", "filesystem", "github"],
  "config": {
    "model": "kimi-k2.5",
    "timeout": 300000
  },
  "instructions": "System prompt or behavior definition...",
  "triggers": {
    "schedule": "0 2 * * *",
    "events": ["git.push", "webhook"]
  }
}
```

## Usage

1. Define agents in `agents/` directory
2. Validate with schema: `npm run validate-agents`
3. Deploy via Mission Control dashboard

## Integration with Mission Control

This enables:
- Agent versioning alongside code
- Easy agent sharing between projects
- Audit trail for agent behavior changes
- Standardized agent metadata for the dashboard
