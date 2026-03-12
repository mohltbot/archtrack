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

Simple, cheap, and reliable way to get page content from a URL. Perfect for LLM consumption.

## Installation

No installation required - uses HTTP API.

## Commands

Use the wrapper script:
- `./scripts/browserbase-fetch.sh <url> [format]`

## Usage Examples

```bash
# Fetch as markdown (default)
./scripts/browserbase-fetch.sh https://example.com

# Fetch as plain text
./scripts/browserbase-fetch.sh https://example.com text

# Fetch as HTML
./scripts/browserbase-fetch.sh https://example.com html
```

## Environment

```bash
export BROWSERBASE_API_KEY="your-api-key"
```

## Features

- Simple HTTP API (no complex browser automation)
- JavaScript rendering support
- Automatic retry and error handling
- Cheaper than full browser automation

## Pricing

- Free: 100 requests/day
- Starter: $29/month (1,000 requests/day)
- Pro: $79/month (5,000 requests/day)

## When to Use

Best for simple page fetching when you don't need full crawling capabilities.

## Source

Ben's Bites Newsletter - March 12, 2026
https://www.browserbase.com/blog/fetch-api
