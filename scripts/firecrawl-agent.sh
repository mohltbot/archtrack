#!/bin/bash
# Firecrawl Agent Wrapper
# Ben's Bites Implementation: March 12, 2026

URL=$1
ACTION=${2:-scrape}
FORMAT=${3:-markdown}

if [ -z "$URL" ]; then
  echo "Usage: $0 <url> [scrape|crawl|map|search] [format]"
  echo ""
  echo "Examples:"
  echo "  $0 https://example.com scrape markdown"
  echo "  $0 https://example.com crawl"
  echo "  $0 https://example.com map"
  echo "  $0 'AI agents' search"
  exit 1
fi

# Check for API key
if [ -z "$FIRECRAWL_API_KEY" ]; then
  echo "⚠️  Warning: FIRECRAWL_API_KEY not set"
  echo "Set it with: export FIRECRAWL_API_KEY='your-key'"
fi

case $ACTION in
  scrape)
    echo "🔥 Scraping $URL as $FORMAT..."
    npx firecrawl-cli@latest scrape "$URL" --format "$FORMAT" --only-main-content
    ;;
    
  crawl)
    OUTPUT_DIR="/tmp/firecrawl-$(date +%s)"
    echo "🕷️  Crawling $URL to $OUTPUT_DIR..."
    mkdir -p "$OUTPUT_DIR"
    npx firecrawl-cli@latest crawl "$URL" --limit 50 --max-depth 2 --output "$OUTPUT_DIR"
    echo "✅ Crawl complete. Output: $OUTPUT_DIR"
    ;;
    
  map)
    echo "🗺️  Generating URL map for $URL..."
    npx firecrawl-cli@latest map "$URL"
    ;;
    
  search)
    echo "🔍 Searching for: $URL"
    npx firecrawl-cli@latest search "$URL" --limit 10
    ;;
    
  *)
    echo "Unknown action: $ACTION"
    echo "Use: scrape, crawl, map, or search"
    exit 1
    ;;
esac
