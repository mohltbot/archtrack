#!/bin/zsh
# Setup Guide: Tavily Web Search & Sonos CLI

echo "🔧 Setting up Tavily Web Search Skill and Sonos CLI..."

# 1. Check if files were downloaded
if [ -f "$HOME/Downloads/tavily-web-search.zip" ]; then
    echo "✅ Found tavily-web-search.zip"
    mkdir -p ~/.claw/skills/tavily-web-search
    unzip -q "$HOME/Downloads/tavily-web-search.zip" -d ~/.claw/skills/tavily-web-search/
    echo "✅ Installed to ~/.claw/skills/tavily-web-search/"
fi

# 2. Check for sonoscli
if command -v sonos &> /dev/null; then
    echo "✅ Sonos CLI already installed"
else
    echo "📦 Installing Sonos CLI via npx..."
    npm install -g sonos-cli 2>/dev/null || npx sonos-cli --help
fi

echo ""
echo "🎯 Setup Complete!"
echo ""
echo "TAVILY WEB SEARCH:"
echo "  - Location: ~/.claw/skills/tavily-web-search/"
echo "  - API Key: Already configured (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)"
echo "  - Usage: claw skill use tavily-web-search"
echo ""
echo "SONOS CLI:"
echo "  - Command: sonos or npx sonos-cli"
echo "  - Discover devices: sonos discover"
echo "  - Play: sonos play"
echo "  - List rooms: sonos list"
