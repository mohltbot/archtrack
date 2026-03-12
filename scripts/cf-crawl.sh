#!/bin/bash
# Cloudflare Crawl Agent Wrapper
# Ben's Bites Implementation: March 12, 2026

URL=$1
MAX_PAGES=${2:-50}
MAX_DEPTH=${3:-2}

if [ -z "$URL" ]; then
  echo "Usage: $0 <url> [max_pages] [max_depth]"
  echo ""
  echo "Examples:"
  echo "  $0 https://example.com"
  echo "  $0 https://example.com 100 3"
  exit 1
fi

if [ -z "$CF_API_TOKEN" ] || [ -z "$CF_ACCOUNT_ID" ]; then
  echo "❌ Error: CF_API_TOKEN and CF_ACCOUNT_ID must be set"
  echo "Set them with:"
  echo "  export CF_API_TOKEN='your-token'"
  echo "  export CF_ACCOUNT_ID='your-account-id'"
  exit 1
fi

echo "🕷️  Starting crawl of $URL..."
echo "   Max pages: $MAX_PAGES"
echo "   Max depth: $MAX_DEPTH"

RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/browser-rendering/crawl" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$URL\",
    \"max_pages\": $MAX_PAGES,
    \"max_depth\": $MAX_DEPTH,
    \"format\": \"markdown\"
  }")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  CRAWL_ID=$(echo "$RESPONSE" | jq -r '.result.crawl_id // .result.id // "unknown"')
  PAGES_CRAWLED=$(echo "$RESPONSE" | jq -r '.result.pages_crawled // .result.pages // "unknown"')
  echo ""
  echo "✅ Crawl completed!"
  echo "   Crawl ID: $CRAWL_ID"
  echo "   Pages crawled: $PAGES_CRAWLED"
  echo ""
  echo "Full response:"
  echo "$RESPONSE" | jq '.'
else
  echo ""
  echo "❌ Crawl failed:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi
