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

Scrape websites and convert to LLM-readable formats using Firecrawl CLI.

## Installation

```bash
npm install -g firecrawl-cli
# or use: npx firecrawl-cli@latest
```

## Commands

- `firecrawl scrape <url>` - Scrape single URL to markdown
- `firecrawl crawl <url>` - Crawl entire site
- `firecrawl search <query>` - Search and scrape results
- `firecrawl map <url>` - Generate URL map of site

## Agent Scripts

- `/Users/mohlt/.openclaw/workspace/scripts/firecrawl-agent.sh` - Wrapper script

## Usage Examples

```bash
# Scrape a page
./scripts/firecrawl-agent.sh https://example.com scrape markdown

# Crawl a site
./scripts/firecrawl-agent.sh https://example.com crawl

# Search
./scripts/firecrawl-agent.sh "AI agent frameworks" search
```

## Options

- `--format markdown|html|json` - Output format
- `--only-main-content` - Remove nav/ads/footer
- `--wait-for <ms>` - Wait for JS rendering
- `--max-depth <n>` - Crawl depth limit
- `--limit <n>` - Max pages to crawl

## Pricing

- Free: 500 credits/month
- Starter: $19/month (5,000 credits)
- Standard: $49/month (50,000 credits)

## Source

Ben's Bites Newsletter - March 12, 2026
https://docs.firecrawl.dev/sdks/cli
