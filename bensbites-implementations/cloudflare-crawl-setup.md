# Cloudflare /crawl Endpoint Setup
# Ben's Bites Implementation: March 12, 2026
# Source: https://developers.cloudflare.com/changelog/post/2026-03-10-br-crawl-endpoint/
# Newsletter: "Make any media searchable"

## Overview
Cloudflare's new `/crawl` endpoint allows you to crawl an entire website with a single API call, following robots.txt automatically. It's perfect for bulk content extraction.

## Features
- Single API call for entire site crawling
- Respects robots.txt
- Configurable depth and limits
- Built on Cloudflare's global network
- Cost-effective for large crawls

## Quick Start

### 1. Prerequisites
- Cloudflare account
- API token with Browser Rendering permissions

### 2. Basic Crawl

```bash
# Crawl a website
curl -X POST https://api.cloudflare.com/client/v4/accounts/{account_id}/browser-rendering/crawl \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "max_pages": 100,
    "max_depth": 3,
    "format": "markdown"
  }'
```

### 3. Response Format

```json
{
  "success": true,
  "result": {
    "crawl_id": "crawl_abc123",
    "status": "completed",
    "pages_crawled": 87,
    "pages": [
      {
        "url": "https://example.com/",
        "title": "Home",
        "content": "# Welcome...",
        "links": ["https://example.com/about"]
      }
    ]
  }
}
```

## Integration with OpenClaw

### Environment Setup
```bash
export CF_API_TOKEN="your-cloudflare-api-token"
export CF_ACCOUNT_ID="your-account-id"
```

### Agent Script
```bash
#!/bin/bash
# cf-crawl.sh - Cloudflare crawl wrapper for agents

URL=$1
MAX_PAGES=${2:-50}
MAX_DEPTH=${3:-2}

if [ -z "$CF_API_TOKEN" ] || [ -z "$CF_ACCOUNT_ID" ]; then
  echo "Error: CF_API_TOKEN and CF_ACCOUNT_ID must be set"
  exit 1
fi

if [ -z "$URL" ]; then
  echo "Usage: $0 <url> [max_pages] [max_depth]"
  exit 1
fi

echo "🕷️ Starting crawl of $URL..."

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

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
  CRAWL_ID=$(echo "$RESPONSE" | jq -r '.result.crawl_id')
  echo "✅ Crawl started: $CRAWL_ID"
  echo "$RESPONSE" | jq '.'
else
  echo "❌ Crawl failed:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi
```

### OpenClaw Skill
Create `~/.openclaw/skills/cloudflare-crawl/SKILL.md`:

```yaml
---
name: cloudflare-crawl
description: Crawl entire websites with a single API call
metadata:
  openclaw:
    emoji: 🕷️
    requires:
      env: [CF_API_TOKEN, CF_ACCOUNT_ID]
---

# Cloudflare /crawl Endpoint

Crawl entire websites efficiently using Cloudflare's infrastructure.

## Usage

```bash
cf-crawl <url> [max_pages] [max_depth]
```

## Options

- `max_pages`: Maximum pages to crawl (default: 50)
- `max_depth`: Maximum crawl depth (default: 2)
- Respects robots.txt automatically

## Examples

```bash
# Quick crawl
cf-crawl https://example.com

# Deep crawl
cf-crawl https://example.com 200 5

# Shallow crawl, many pages
cf-crawl https://example.com 500 1
```
```

## Pricing
- Free tier: 1,000 requests/day
- Pro: $5/month (10,000 requests/day)
- Business: $20/month (100,000 requests/day)
- Enterprise: Custom

## Use Cases

1. **Site Migration**: Extract all content from legacy sites
2. **Documentation**: Build searchable docs from scattered pages
3. **Competitor Analysis**: Crawl competitor feature pages
4. **SEO Audits**: Extract all page titles, meta descriptions
5. **Content Archives**: Create offline copies of websites

## Advanced Options

```json
{
  "url": "https://example.com",
  "max_pages": 100,
  "max_depth": 3,
  "format": "markdown",
  "include_paths": ["/blog/*", "/docs/*"],
  "exclude_paths": ["/admin/*", "/api/*"],
  "wait_for": 1000,
  "user_agent": "CustomBot/1.0"
}
```

## Comparison with Firecrawl

| Feature | Cloudflare /crawl | Firecrawl |
|---------|-------------------|-----------|
| Single call crawl | ✅ | ✅ |
| robots.txt respect | ✅ | ✅ |
| JavaScript rendering | ✅ | ✅ |
| Structured data extraction | ❌ | ✅ |
| Search integration | ❌ | ✅ |
| Price | $ | $$ |

## Best Practices

1. Start with small `max_pages` to test
2. Use `exclude_paths` to avoid crawling unnecessary areas
3. Set appropriate `wait_for` for JS-heavy sites
4. Monitor crawl status for large sites
5. Cache results to avoid re-crawling
