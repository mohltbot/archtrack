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

Crawl entire websites efficiently using Cloudflare's infrastructure. One API call crawls an entire site while respecting robots.txt.

## Installation

No installation required - uses Cloudflare API.

## Commands

Use the wrapper script:
- `./scripts/cf-crawl.sh <url> [max_pages] [max_depth]`

## Usage Examples

```bash
# Quick crawl (50 pages, depth 2)
./scripts/cf-crawl.sh https://example.com

# Deep crawl (100 pages, depth 3)
./scripts/cf-crawl.sh https://example.com 100 3

# Shallow but broad (500 pages, depth 1)
./scripts/cf-crawl.sh https://example.com 500 1
```

## Environment

```bash
export CF_API_TOKEN="your-cloudflare-api-token"
export CF_ACCOUNT_ID="your-account-id"
```

## Features

- Single API call for entire site crawling
- Respects robots.txt automatically
- Configurable depth and limits
- Built on Cloudflare's global network
- Cost-effective for large crawls

## Pricing

- Free: 1,000 requests/day
- Pro: $5/month (10,000 requests/day)
- Business: $20/month (100,000 requests/day)

## When to Use

Best for bulk site crawling and content extraction.

## Source

Ben's Bites Newsletter - March 12, 2026
https://developers.cloudflare.com/changelog/post/2026-03-10-br-crawl-endpoint/
