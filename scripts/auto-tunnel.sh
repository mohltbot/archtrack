#!/bin/zsh
# Auto-start Mission Control tunnel
# This script runs continuously and restarts the tunnel if it fails

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/tunnel.log"
PID_FILE="/tmp/mission-control-tunnel.pid"

mkdir -p "$WORKSPACE/logs"

echo "$(date): Starting Mission Control tunnel auto-starter..." >> "$LOG_FILE"

# Function to start tunnel
start_tunnel() {
    # Kill any existing tunnel
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        kill "$OLD_PID" 2>/dev/null
        rm "$PID_FILE"
    fi
    
    # Start new tunnel
    /opt/homebrew/bin/cloudflared tunnel --url http://localhost:3001 >> "$LOG_FILE" 2>&1 &
    NEW_PID=$!
    echo $NEW_PID > "$PID_FILE"
    
    echo "$(date): Tunnel started with PID $NEW_PID" >> "$LOG_FILE"
    
    # Extract and display the URL
    sleep 5
    URL=$(grep "trycloudflare.com" "$LOG_FILE" | tail -1 | grep -o "https://[^ ]*")
    if [ -n "$URL" ]; then
        echo "$(date): Tunnel URL: $URL" >> "$LOG_FILE"
        echo "$URL" > "$WORKSPACE/current-tunnel-url.txt"
    fi
}

# Start initial tunnel
start_tunnel

# Monitor and restart if needed
while true; do
    sleep 30
    
    # Check if tunnel is still running
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ! kill -0 "$PID" 2>/dev/null; then
            echo "$(date): Tunnel died, restarting..." >> "$LOG_FILE"
            start_tunnel
        fi
    else
        echo "$(date): PID file missing, restarting..." >> "$LOG_FILE"
        start_tunnel
    fi
done
