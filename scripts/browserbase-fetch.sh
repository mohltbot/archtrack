#!/bin/bash
# BrowserBase Fetch Agent Wrapper
# Ben's Bites Implementation: March 12, 2026

URL=$1
FORMAT=${2:-markdown}

if [ -z "$URL" ]; then
  echo "Usage: $0 <url> [markdown|html|text]"
  echo ""
  echo "Examples:"
  echo "  $0 https://example.com"
  echo "  $0 https://example.com text"
  exit 1
fi

if [ -z "$BROWSERBASE_API_KEY" ]; then
  echo "❌ Error: BROWSERBASE_API_KEY not set"
  echo "Set it with: export BROWSERBASE_API_KEY='your-key'"
  exit 1
fi

echo "🌐 Fetching $URL as $FORMAT..."

curl -s -X POST https://api.browserbase.com/v1/fetch \
  -H "Authorization: Bearer $BROWSERBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$URL\",
    \"format\": \"$FORMAT\"
  }" | jq -r '.content // .'
