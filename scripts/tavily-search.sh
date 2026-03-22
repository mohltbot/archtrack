#!/bin/bash
# Tavily search wrapper
API_KEY="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"
QUERY="$1"

curl -s "https://api.tavily.com/search" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"$QUERY\",\"search_depth\":\"basic\",\"max_results\":5}" | jq -r '.results[] | "\(.title)\n\(.url)\n\(.content | split(".")[0:3] | join("."))...\n"' 2>/dev/null || echo "Search failed"
