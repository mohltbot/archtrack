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

Give your agents a secure, ephemeral computer to run code. "The best way to give your AI agents a computer."

## Installation

```bash
npm install -g @upstash/cli
# or use: npx @upstash/cli@latest
```

## Commands

Use the wrapper script:
- `./scripts/upstash-box-agent.sh <box-name> [create|exec|destroy|list] [command]`

## Usage Examples

```bash
# Create a box
./scripts/upstash-box-agent.sh my-box create

# Execute command in box
./scripts/upstash-box-agent.sh my-box exec "node -e 'console.log(1+1)'"

# List all boxes
./scripts/upstash-box-agent.sh - list

# Destroy box
./scripts/upstash-box-agent.sh my-box destroy
```

## Environment

```bash
export UPSTASH_TOKEN="your-upstash-token"
```

## Templates

- `nodejs` - Node.js 20 environment
- `python` - Python 3.11 environment
- `bun` - Bun runtime environment
- `deno` - Deno runtime environment

## Features

- Ephemeral sandboxes for agent code execution
- Pre-configured environments
- Persistent storage between sessions
- Network access control
- Resource limits and quotas

## Pricing

- Free: 10 hours/month
- Starter: $10/month (100 hours)
- Pro: $29/month (500 hours)

## When to Use

Best for safe code execution and testing agent-generated code.

## Source

Ben's Bites Newsletter - March 12, 2026
https://upstash.com/blog/upstash-box
