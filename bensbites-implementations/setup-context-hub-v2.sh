#!/bin/bash
# Context Hub Setup Script
# Ben's Bites Implementation: March 12, 2026
# Source: https://github.com/andrewyng/context-hub
# Newsletter: "Just use GPT-5.4 xhigh"

set -e

WORKSPACE="/Users/mohlt/.openclaw/workspace"
CONTEXT_HUB_DIR="$WORKSPACE/context-hub"

echo "🔧 Setting up Context Hub..."

# Check if already installed
if [ -d "$CONTEXT_HUB_DIR/.git" ]; then
    echo "✅ Context Hub already installed at $CONTEXT_HUB_DIR"
    cd "$CONTEXT_HUB_DIR"
    git pull
else
    echo "📥 Cloning Context Hub repository..."
    git clone https://github.com/andrewyng/context-hub.git "$CONTEXT_HUB_DIR"
    cd "$CONTEXT_HUB_DIR"
fi

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f "package.json" ]; then
    npm install
elif [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
elif [ -f "pyproject.toml" ]; then
    pip install -e .
fi

# Create config for Mission Control
echo "⚙️ Creating Mission Control configuration..."
mkdir -p "$CONTEXT_HUB_DIR/config"

cat > "$CONTEXT_HUB_DIR/config/mission-control.yaml" << 'EOF'
# Context Hub Configuration for Mission Control
# Provides up-to-date API documentation for coding agents

name: mission-control-context
version: "1.0"

# API documentation sources to keep updated
sources:
  - name: openai-api
    url: https://platform.openai.com/docs/api-reference
    refresh: daily
    
  - name: anthropic-api
    url: https://docs.anthropic.com/en/api
    refresh: daily
    
  - name: github-api
    url: https://docs.github.com/en/rest
    refresh: weekly
    
  - name: discord-api
    url: https://discord.com/developers/docs
    refresh: weekly
    
  - name: cloudflare-api
    url: https://api.cloudflare.com/
    refresh: weekly

# Local project contexts
local_contexts:
  - path: /Users/mohlt/.openclaw/workspace/mission-control
    name: mission-control
    
  - path: /Users/mohlt/.openclaw/workspace/arch-firm-dashboard
    name: archtrack
    
  - path: /Users/mohlt/.openclaw/workspace/business/openclaw-debugger
    name: openclaw-debugger

# Output configuration
output:
  format: markdown
  directory: ./context-output
  combine: false

# Agent integration
agent_integration:
  claude_code: true
  cursor: true
  openclaw: true
EOF

# Create wrapper script
echo "📝 Creating wrapper script..."
cat > "$CONTEXT_HUB_DIR/context-hub-agent.sh" << 'EOF'
#!/bin/bash
# Context Hub Agent Wrapper
# Usage: ./context-hub-agent.sh [update|serve|search]

WORKSPACE="/Users/mohlt/.openclaw/workspace"
CONTEXT_HUB_DIR="$WORKSPACE/context-hub"
cd "$CONTEXT_HUB_DIR"

COMMAND=${1:-update}

case $COMMAND in
  update)
    echo "🔄 Updating API documentation..."
    # Run context hub update
    if [ -f "package.json" ]; then
      npm run update 2>/dev/null || node index.js update
    else
      python -m context_hub update 2>/dev/null || python main.py update
    fi
    ;;
    
  serve)
    echo "🌐 Starting Context Hub server..."
    if [ -f "package.json" ]; then
      npm run serve 2>/dev/null || node index.js serve
    else
      python -m context_hub serve 2>/dev/null || python main.py serve
    fi
    ;;
    
  search)
    QUERY=$2
    if [ -z "$QUERY" ]; then
      echo "Usage: $0 search <query>"
      exit 1
    fi
    echo "🔍 Searching for: $QUERY"
    # Search implementation
    grep -r "$QUERY" ./context-output/ 2>/dev/null | head -20 || echo "No results found"
    ;;
    
  *)
    echo "Usage: $0 [update|serve|search]"
    exit 1
    ;;
esac
EOF

chmod +x "$CONTEXT_HUB_DIR/context-hub-agent.sh"

# Create launchd plist for auto-updates
echo "⏰ Creating auto-update schedule..."
cat > "$WORKSPACE/scripts/com.mohltbot.context-hub.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.mohltbot.context-hub</string>
    <key>ProgramArguments</key>
    <array>
        <string>$CONTEXT_HUB_DIR/context-hub-agent.sh</string>
        <string>update</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>6</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>$WORKSPACE/logs/context-hub.log</string>
    <key>StandardErrorPath</key>
    <string>$WORKSPACE/logs/context-hub-error.log</string>
</dict>
</plist>
EOF

# Create skill documentation for OpenClaw
mkdir -p "$WORKSPACE/skills/context-hub"
cat > "$WORKSPACE/skills/context-hub/SKILL.md" << 'EOF'
---
name: context-hub
description: Provides up-to-date API documentation for coding agents
metadata:
  openclaw:
    emoji: 📚
    requires:
      dirs: [/Users/mohlt/.openclaw/workspace/context-hub]
---

# Context Hub

Context Hub (by Andrew Ng) keeps your coding agents up-to-date with the latest API documentation.

## Commands

- `context-hub update` - Refresh all API documentation
- `context-hub serve` - Start documentation server
- `context-hub search <query>` - Search documentation

## Integration

The context hub is automatically used by:
- Claude Code
- Cursor
- OpenClaw agents

## Configuration

Edit `/Users/mohlt/.openclaw/workspace/context-hub/config/mission-control.yaml` to add new API sources.

## Output

Documentation is stored in `/Users/mohlt/.openclaw/workspace/context-hub/context-output/`
EOF

echo ""
echo "✅ Context Hub setup complete!"
echo ""
echo "Next steps:"
echo "1. Review config: $CONTEXT_HUB_DIR/config/mission-control.yaml"
echo "2. Run initial update: $CONTEXT_HUB_DIR/context-hub-agent.sh update"
echo "3. Load the launchd agent:"
echo "   launchctl load ~/Library/LaunchAgents/com.mohltbot.context-hub.plist"
echo ""
echo "Usage:"
echo "  context-hub-agent.sh update  # Update all documentation"
echo "  context-hub-agent.sh serve   # Start documentation server"
echo "  context-hub-agent.sh search <query>  # Search docs"
