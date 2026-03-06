#!/bin/bash
# Deploy all workflows to wasifmo1.app.n8n.cloud
# Requires: N8N_API_KEY environment variable

N8N_HOST="https://wasifmo1.app.n8n.cloud"
API_KEY="${N8N_API_KEY:-}"

if [ -z "$API_KEY" ]; then
  echo "Error: N8N_API_KEY not set"
  echo "Reminder: Get API key from user tonight"
  exit 1
fi

echo "Deploying to $N8N_HOST..."
cd /Users/mohlt/.openclaw/workspace/vc-portfolio/n8n-workflows

SUCCESS=0
FAILED=0

for workflow in *.json; do
  echo -n "Deploying $workflow... "
  
  response=$(curl -s -X POST "$N8N_HOST/api/v1/workflows" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d @$workflow 2>/dev/null)
  
  if echo "$response" | grep -q '"id"'; then
    echo "✅"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "❌"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Deployment complete: $SUCCESS success, $FAILED failed"
