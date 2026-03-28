#!/bin/bash
# Factory Missions-style Long-Running Agent Setup
# Source: Ben's Bites March 28, 2026 - Factory AI Missions

set -e

echo "Setting up Factory-style Missions (long-running agents)..."

# Check dependencies
if ! command -v node &> /dev/null; then
    echo "Error: Node.js required"
    exit 1
fi

# Create missions directory
mkdir -p ~/.openclaw/missions

# Install PM2 for process management if not present
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 for mission process management..."
    npm install -g pm2
fi

echo ""
echo "Factory Missions Setup Complete!"
echo ""
echo "Missions are long-running agents for:"
echo "  - Building applications from scratch"
echo "  - Code migrations"
echo "  - AI research tasks"
echo "  - Any large software task"
echo ""
echo "Usage:"
echo "  openclaw missions start <mission-name> --prompt 'build a react app'"
echo "  openclaw missions list"
echo "  openclaw missions logs <mission-name>"
echo "  openclaw missions stop <mission-name>"
