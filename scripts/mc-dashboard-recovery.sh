#!/bin/bash
# Mission Control Dashboard Recovery Script
# Created: March 15, 2026
# Purpose: Automate recovery of Mission Control Dashboard when it's not responding

set -e

echo "🚀 Mission Control Dashboard Recovery"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE_DIR="/Users/mohlt/.openclaw/workspace"
SERVER_DIR="$WORKSPACE_DIR/mission-control-server"
LOG_DIR="$WORKSPACE_DIR/logs"
PID_FILE="$SERVER_DIR/.server.pid"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to check if a process is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Function to kill existing server process
kill_existing() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        echo -e "${YELLOW}Found existing PID file: $pid${NC}"
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Killing existing process...${NC}"
            kill "$pid" 2>/dev/null || true
            sleep 2
            # Force kill if still running
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
        rm -f "$PID_FILE"
    fi
}

# Check if server directory exists
if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${RED}❌ Mission Control server directory not found at:${NC}"
    echo "   $SERVER_DIR"
    echo ""
    echo -e "${YELLOW}Possible solutions:${NC}"
    echo "1. The server may be in a different location"
    echo "2. The server files may need to be restored from git"
    echo "3. The server may need to be reinstalled"
    echo ""
    echo "Common locations to check:"
    find "$WORKSPACE_DIR" -maxdepth 2 -name "package.json" -exec grep -l "mission-control" {} \; 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✓ Server directory found:${NC} $SERVER_DIR"

# Check for node_modules
if [ ! -d "$SERVER_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Installing dependencies...${NC}"
    cd "$SERVER_DIR"
    npm install
fi

# Kill any existing process
kill_existing

# Check port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3000 is already in use. Attempting to free it...${NC}"
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Start the server
echo ""
echo -e "${GREEN}🚀 Starting Mission Control Dashboard...${NC}"
cd "$SERVER_DIR"

# Start server in background and capture PID
npm run dev > "$LOG_DIR/mc-dashboard-$(date +%Y%m%d-%H%M).log" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo -e "${GREEN}✓ Server started with PID: $SERVER_PID${NC}"
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Mission Control Dashboard is now responding!${NC}"
        echo ""
        echo "Dashboard URL: http://localhost:3000"
        echo "Health Check: http://localhost:3000/api/health"
        echo "Log file: $LOG_DIR/mc-dashboard-$(date +%Y%m%d-%H%M).log"
        exit 0
    fi
    sleep 1
    echo -n "."
done

echo ""
echo -e "${YELLOW}⚠ Server started but health check not responding yet.${NC}"
echo "Check logs: tail -f $LOG_DIR/mc-dashboard-$(date +%Y%m%d-%H%M).log"
echo "PID: $SERVER_PID"
