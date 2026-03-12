# BrowserBase Fetch API Setup
# Ben's Bites Implementation: March 12, 2026
# Source: https://www.browserbase.com/blog/fetch-api
# Newsletter: "Make any media searchable"

## Overview
BrowserBase Fetch API provides a simple, cheap, and reliable way to get page content from a URL. It's designed specifically for AI agents that need to read web content.

## Key Features
- Simple HTTP API (no complex browser automation)
- JavaScript rendering support
- Automatic retry and error handling
- Cheaper than full browser automation
- Perfect for LLM consumption

## Quick Start

### 1. Get API Key
Sign up at https://browserbase.com and get your API key.

### 2. Basic Usage

```bash
# Using curl
curl -X POST https://api.browserbase.com/v1/fetch \
  -H "Authorization: Bearer $BROWSERBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "format": "markdown"
  }'
```

### 3. Response Format

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "content": "# Example Domain\n\nThis domain is for use in examples...",
  "format": "markdown",
  "metadata": {
    "statusCode": 200,
    "contentType": "text/html",
    "fetchTime": 1234
  }
}
```

## Integration with OpenClaw

### Environment Setup
```bash
export BROWSERBASE_API_KEY="your-api-key"
```

### Agent Script
```bash
#!/bin/bash
# browserbase-fetch.sh - Fetch web content for agents

URL=$1
FORMAT=${2:-markdown}

if [ -z "$BROWSERBASE_API_KEY" ]; then
  echo "Error: BROWSERBASE_API_KEY not set"
  exit 1
fi

if [ -z "$URL" ]; then
  echo "Usage: $0 <url> [markdown|html|text]"
  exit 1
fi

curl -s -X POST https://api.browserbase.com/v1/fetch \
  -H "Authorization: Bearer $BROWSERBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$URL\",
    \"format\": \"$FORMAT\"
  }" | jq -r '.content'
```

### OpenClaw Skill
Create `~/.openclaw/skills/browserbase/SKILL.md`:

```yaml
---
name: browserbase
description: Fetch web page content for agent consumption
metadata:
  openclaw:
    emoji: 🌐
    requires:
      env: [BROWSERBASE_API_KEY]
---

# BrowserBase Fetch API

Fetch web content in LLM-readable formats.

## Usage

```bash
browserbase-fetch <url> [format]
```

## Options

- `format`: markdown (default), html, or text
- Supports JavaScript-rendered content
- Automatic retries on failure

## Examples

```bash
# Fetch as markdown
browserbase-fetch https://example.com

# Fetch as plain text
browserbase-fetch https://example.com text

# Use in pipelines
browserbase-fetch https://example.com | head -100
```
```

## Pricing
- Free tier: 100 requests/day
- Starter: $29/month (1,000 requests/day)
- Pro: $79/month (5,000 requests/day)
- Enterprise: Custom pricing

## Comparison with Alternatives

| Tool | Best For | Price | Complexity |
|------|----------|-------|------------|
| BrowserBase Fetch | Simple page fetching | $ | Low |
| Firecrawl | Full crawling/scraping | $$ | Medium |
| Playwright/MCP | Complex automation | $$$ | High |
| Cloudflare /crawl | Bulk site crawling | $ | Low |

## Use Cases

1. **Quick Research**: Fetch competitor pricing pages
2. **Documentation**: Read API docs in agent context
3. **News Monitoring**: Fetch latest articles
4. **Content Validation**: Verify web content matches expectations

## API Options

```json
{
  "url": "https://example.com",
  "format": "markdown",
  "waitFor": 2000,
  "timeout": 30000,
  "headers": {
    "User-Agent": "Custom Agent"
  }
}
```

## Error Handling

The API returns structured errors:

```json
{
  "error": {
    "code": "TIMEOUT",
    "message": "Request timed out after 30s",
    "retryable": true
  }
}
```
