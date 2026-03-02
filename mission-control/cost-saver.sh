#!/bin/bash
#
# OpenClaw Cost Saver Mode
# Toggles between Local MLX (free) and Cloud models
#
# Usage:
#   ./cost-saver.sh on     # Switch to local MLX primary (save $)
#   ./cost-saver.sh off    # Switch to cloud primary (full power)
#   ./cost-saver.sh status # Check current mode

CONFIG="$HOME/.openclaw/openclaw.json"
MLX_SERVER="/Users/mohlt/.openclaw/workspace/mission-control/mlx-server.mjs"

status() {
    local primary=$(grep -A1 '"primary"' "$CONFIG" | grep -v '^--' | head -1 | sed 's/.*: "\(.*\)".*/\1/')
    echo "Current primary model: $primary"
    
    if echo "$primary" | grep -q "local/mlx"; then
        echo "Mode: 💰 COST SAVER (Local MLX - FREE)"
        return 0
    else
        echo "Mode: ☁️  CLOUD (Full Power - Paid)"
        return 1
    fi
}

start_mlx_server() {
    if lsof -i :8787 >/dev/null 2>&1; then
        echo "✅ MLX server already running on port 8787"
    else
        echo "🚀 Starting MLX server..."
        cd "$(dirname "$MLX_SERVER")"
        node mlx-server.mjs &
        sleep 2
        if lsof -i :8787 >/dev/null 2>&1; then
            echo "✅ MLX server started"
        else
            echo "❌ Failed to start MLX server"
            exit 1
        fi
    fi
}

stop_mlx_server() {
    if lsof -i :8787 >/dev/null 2>&1; then
        echo "🛑 Stopping MLX server..."
        kill $(lsof -t -i :8787) 2>/dev/null
        echo "✅ MLX server stopped"
    fi
}

enable_cost_saver() {
    echo "💰 Enabling Cost Saver Mode..."
    start_mlx_server
    
    # Update config to use local as primary
    sed -i.bak 's/"primary": "moonshot\/kimi-k2.5"/"primary": "local\/mlx-local\/smollm2-360m"/' "$CONFIG"
    
    echo "✅ Cost Saver Mode ENABLED"
    echo "   Primary: Local MLX (FREE)"
    echo "   Fallbacks: Kimi, Minimax, DeepSeek"
    echo ""
    echo "⚠️  Note: Complex tasks may fail. Switch back with: ./cost-saver.sh off"
}

disable_cost_saver() {
    echo "☁️  Disabling Cost Saver Mode..."
    
    # Update config to use cloud as primary
    sed -i.bak 's/"primary": "local\/mlx-local\/smollm2-360m"/"primary": "moonshot\/kimi-k2.5"/' "$CONFIG"
    
    stop_mlx_server
    
    echo "✅ Cost Saver Mode DISABLED"
    echo "   Primary: Kimi K2.5 (Full Power)"
}

case "$1" in
    on|enable)
        enable_cost_saver
        ;;
    off|disable)
        disable_cost_saver
        ;;
    status)
        status
        ;;
    *)
        echo "OpenClaw Cost Saver Mode"
        echo ""
        echo "Usage:"
        echo "  $0 on      - Enable cost saver (Local MLX primary)"
        echo "  $0 off     - Disable cost saver (Cloud primary)"
        echo "  $0 status  - Check current mode"
        echo ""
        status
        ;;
esac
