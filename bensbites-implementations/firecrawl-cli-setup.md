# Firecrawl CLI Setup
# Ben's Bites Implementation: March 12, 2026
# Source: https://docs.firecrawl.dev/sdks/cli
# Newsletter: "Make any media searchable"

## Overview
Firecrawl CLI is a toolkit for agents to scrape, search, and browse the web. It converts any website into LLM-ready markdown or structured data.

## Installation

```bash
# Install via npm
npm install -g firecrawl-cli

# Or use npx (no install)
npx firecrawl-cli@latest
```

## Quick Start

### 1. Set API Key
```bash
export FIRECRAWL_API_KEY="your-api-key"
```

### 2. Basic Scraping
```bash
# Scrape a single URL
firecrawl scrape https://example.com

# Scrape with options
firecrawl scrape https://example.com --format markdown --only-main-content
```

### 3. Crawl Entire Site
```bash
# Crawl with limits
firecrawl crawl https://example.com --limit 100 --max-depth 3

# Crawl with output
firecrawl crawl https://example.com --output ./crawled-content/
```

### 4. Search and Scrape
```bash
# Search and scrape results
firecrawl search "AI agent frameworks" --limit 10
```

## Integration with OpenClaw

### Skill Definition
Create `~/.openclaw/skills/firecrawl/SKILL.md`:

```yaml
---
name: firecrawl
description: Scrape and crawl web content for agent consumption
metadata:
  openclaw:
    emoji: 🔥
    requires:
      env: [FIRECRAWL_API_KEY]
---

# Firecrawl

Scrape websites and convert to LLM-readable formats.

## Commands

- `firecrawl scrape <url>` - Scrape single URL to markdown
- `firecrawl crawl <url>` - Crawl entire site
- `firecrawl search <query>` - Search and scrape results
- `firecrawl map <url>` - Generate URL map of site

## Options

- `--format markdown|html|json` - Output format
- `--only-main-content` - Remove nav/ads/footer
- `--wait-for <ms>` - Wait for JS rendering
- `--max-depth <n>` - Crawl depth limit
- `--limit <n>` - Max pages to crawl
```

### Agent Integration Script
```bash
#!/bin/bash
# firecrawl-agent.sh - Wrapper for agent use

URL=$1
ACTION=${2:-scrape}

case $ACTION in
  scrape)
    firecrawl scrape "$URL" --format markdown --only-main-content
    ;;
  crawl)
    firecrawl crawl "$URL" --limit 50 --max-depth 2 --output /tmp/crawl-$(date +%s)
    ;;
  map)
    firecrawl map "$URL"
    ;;
  *)
    echo "Usage: $0 <url> [scrape|crawl|map]"
    exit 1
    ;;
esac
```

## Use Cases for Mission Control

1. **Lead Research**: Scrape prospect websites for context
2. **Competitor Analysis**: Crawl competitor sites for feature comparison
3. **Documentation**: Convert docs sites to searchable markdown
4. **Content Aggregation**: Gather industry news from multiple sources

## Pricing
- Free tier: 500 credits/month
- Starter: $19/month (5,000 credits)
- Standard: $49/month (50,000 credits)
- Growth: $99/month (200,000 credits)

## Rate Limits
- 20 requests/minute on free tier
- 100+ requests/minute on paid tiers

## Alternatives
- **BrowserBase Fetch API**: Simpler, cheaper for basic page fetching
- **Cloudflare /crawl**: Good for bulk site crawling
- **Parallel CLI**: High-quality data extraction
