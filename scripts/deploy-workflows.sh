#!/bin/bash
# Deploy all VC Portfolio workflows to n8n
# Usage: ./deploy-workflows.sh [n8n-url] [api-key]

N8N_URL="${1:-http://localhost:5678}"
API_KEY="${2:-}"

WORKFLOW_DIR="/Users/mohlt/.openclaw/workspace/vc-portfolio/n8n-workflows"

echo "🚀 Deploying VC Portfolio Workflows to n8n"
echo "Target: $N8N_URL"
echo ""

DEPLOYED=0
FAILED=0

for workflow in "$WORKFLOW_DIR"/*.json; do
  if [ -f "$workflow" ]; then
    name=$(basename "$workflow" .json)
    echo "Deploying: $name..."
    
    if [ -n "$API_KEY" ]; then
      response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "@$workflow" 2>&1)
    else
      response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -d "@$workflow" 2>&1)
    fi
    
    if echo "$response" | grep -q "id"; then
      echo "  ✅ Deployed successfully"
      ((DEPLOYED++))
    else
      echo "  ❌ Failed: $response"
      ((FAILED++))
    fi
  fi
done

echo ""
echo "═══════════════════════════════════════"
echo "DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════"
echo "Deployed: $DEPLOYED"
echo "Failed: $FAILED"
echo "Total: $((DEPLOYED + FAILED))"
