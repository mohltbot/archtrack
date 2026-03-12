# Upstash Box Setup
# Ben's Bites Implementation: March 12, 2026
# Source: https://upstash.com/blog/upstash-box
# Newsletter: "Make any media searchable"

## Overview
Upstash Box is described as "the best way to give your AI agents a computer." It provides sandboxed, ephemeral computing environments for agents to run code safely.

## Key Features
- Ephemeral sandboxes for agent code execution
- Pre-configured environments (Node.js, Python, etc.)
- Persistent storage between sessions
- Network access control
- Resource limits and quotas

## Quick Start

### 1. Installation

```bash
# Install Upstash CLI
npm install -g @upstash/cli

# Or use npx
npx @upstash/cli@latest
```

### 2. Authentication

```bash
upstash auth login
# Follow prompts to authenticate
```

### 3. Create a Box

```bash
# Create a new box
upstash box create --name my-agent-box --template nodejs

# List available templates
upstash box templates
```

### 4. Run Code in Box

```bash
# Execute command in box
upstash box exec my-agent-box -- "node -e 'console.log(\"Hello from box\")'"

# Run a script
upstash box run my-agent-box --file ./script.js
```

## Integration with OpenClaw

### Environment Setup
```bash
export UPSTASH_TOKEN="your-upstash-token"
```

### Agent Wrapper Script
```bash
#!/bin/bash
# upstash-box-agent.sh - Wrapper for agent box operations

BOX_NAME="${1:-openclaw-agent-box}"
ACTION="${2:-create}"

case $ACTION in
  create)
    echo "📦 Creating box: $BOX_NAME"
    upstash box create --name "$BOX_NAME" --template nodejs
    ;;
    
  exec)
    COMMAND="$3"
    if [ -z "$COMMAND" ]; then
      echo "Usage: $0 <box-name> exec <command>"
      exit 1
    fi
    echo "⚡ Executing in $BOX_NAME: $COMMAND"
    upstash box exec "$BOX_NAME" -- "$COMMAND"
    ;;
    
  destroy)
    echo "🗑️ Destroying box: $BOX_NAME"
    upstash box delete "$BOX_NAME"
    ;;
    
  list)
    echo "📋 Listing boxes:"
    upstash box list
    ;;
    
  *)
    echo "Usage: $0 <box-name> [create|exec|destroy|list]"
    exit 1
    ;;
esac
```

### OpenClaw Skill
Create `~/.openclaw/skills/upstash-box/SKILL.md`:

```yaml
---
name: upstash-box
description: Ephemeral sandbox environments for AI agents
metadata:
  openclaw:
    emoji: 📦
    requires:
      env: [UPSTASH_TOKEN]
---

# Upstash Box

Give your agents a secure, ephemeral computer to run code.

## Commands

- `upstash-box create <name>` - Create new sandbox
- `upstash-box exec <name> <command>` - Run command in sandbox
- `upstash-box destroy <name>` - Delete sandbox
- `upstash-box list` - Show all boxes

## Templates

- `nodejs` - Node.js 20 environment
- `python` - Python 3.11 environment
- `bun` - Bun runtime environment
- `deno` - Deno runtime environment

## Examples

```bash
# Create and use a box
upstash-box create my-box
upstash-box exec my-box "npm install axios"
upstash-box exec my-box "node script.js"
upstash-box destroy my-box
```
```

## Pricing
- Free tier: 10 hours/month
- Starter: $10/month (100 hours)
- Pro: $29/month (500 hours)
- Enterprise: Custom

## Use Cases for Mission Control

1. **Safe Code Execution**: Run untrusted agent-generated code
2. **Dependency Isolation**: Test packages without polluting host
3. **Parallel Processing**: Spin up multiple boxes for concurrent tasks
4. **CI/CD**: Run tests in clean environments
5. **Sandboxed Research**: Browse web safely in isolated environment

## Comparison with Alternatives

| Tool | Type | Best For | Price |
|------|------|----------|-------|
| Upstash Box | Ephemeral sandboxes | Quick code execution | $ |
| Mastra Remote Sandboxes | Agent-focused | Secure agent environments | $$ |
| Agent Safehouse | macOS native | Local agent sandboxing | Free |
| Docker | General purpose | Full containerization | Free/$ |

## Advanced Configuration

```json
{
  "name": "my-agent-box",
  "template": "nodejs",
  "resources": {
    "cpu": 2,
    "memory": "4GB",
    "storage": "10GB"
  },
  "network": {
    "outbound": true,
    "inbound": false
  },
  "timeout": 3600
}
```

## Security Features

- Ephemeral environments (destroyed after use)
- Network isolation
- Resource quotas
- No persistent access to host system
- Automatic cleanup of temporary files
