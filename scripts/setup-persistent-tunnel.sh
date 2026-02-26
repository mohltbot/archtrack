#!/bin/zsh
# Setup Persistent Cloudflare Tunnel for Mission Control
# Creates a named tunnel that survives restarts

set -e

echo "🚀 Setting up persistent Cloudflare tunnel for Mission Control..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared not found. Installing..."
    brew install cloudflared
fi

# Configuration
TUNNEL_NAME="mission-control"
CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"

mkdir -p "$CONFIG_DIR"

echo ""
echo "⚠️  You need to authenticate with Cloudflare first."
echo "   This requires a Cloudflare account (free tier works fine)."
echo ""
echo "   If you haven't authenticated yet, run:"
echo "   cloudflared tunnel login"
echo ""
read -p "Have you authenticated with Cloudflare? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please authenticate first:"
    echo "   cloudflared tunnel login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if tunnel already exists
echo "🔍 Checking for existing tunnel..."
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "✅ Tunnel '$TUNNEL_NAME' already exists"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
else
    echo "🆕 Creating new tunnel: $TUNNEL_NAME"
    TUNNEL_ID=$(cloudflared tunnel create "$TUNNEL_NAME" | grep -oP 'Created tunnel \K[^ ]+')
    echo "✅ Created tunnel with ID: $TUNNEL_ID"
fi

# Create credentials file symlink
CREDS_FILE="$CONFIG_DIR/$TUNNEL_ID.json"
if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ Credentials file not found. Trying to locate..."
    # Find credentials file
    FOUND_CREDS=$(find "$CONFIG_DIR" -name "*.json" -type f | head -1)
    if [ -n "$FOUND_CREDS" ]; then
        ln -sf "$FOUND_CREDS" "$CREDS_FILE"
        echo "✅ Linked credentials file"
    fi
fi

# Create config.yml
cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CREDS_FILE

ingress:
  - hostname: mission-control.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404

# Alternative: use a subdomain of trycloudflare.com (no domain needed)
# Remove the hostname line above and just use:
# ingress:
#   - service: http://localhost:3000
EOF

echo ""
echo "📝 Configuration created at: $CONFIG_FILE"
echo ""

# Create LaunchAgent for auto-start
LAUNCH_AGENT_DIR="$HOME/Library/LaunchAgents"
LAUNCH_AGENT_FILE="$LAUNCH_AGENT_DIR/com.cloudflare.mission-control.plist"

mkdir -p "$LAUNCH_AGENT_DIR"

cat > "$LAUNCH_AGENT_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.mission-control</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>run</string>
        <string>$TUNNEL_NAME</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/$(whoami)/.cloudflared/mission-control.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/$(whoami)/.cloudflared/mission-control-error.log</string>
</dict>
</plist>
EOF

echo "✅ LaunchAgent created for auto-start on boot"

echo ""
echo "🎯 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update $CONFIG_FILE with your domain (or remove hostname for trycloudflare.com)"
echo "2. Load the tunnel: launchctl load $LAUNCH_AGENT_FILE"
echo "3. Or run manually: cloudflared tunnel run $TUNNEL_NAME"
echo ""
echo "Your tunnel ID: $TUNNEL_ID"
echo ""

# Offer to start now
read -p "Start the tunnel now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting tunnel..."
    launchctl load "$LAUNCH_AGENT_FILE"
    sleep 2
    echo "✅ Tunnel started! Check logs: tail -f ~/.cloudflared/mission-control.log"
fi
