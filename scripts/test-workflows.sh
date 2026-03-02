#!/bin/bash
# Test all workflows for validity
# Usage: ./test-workflows.sh

WORKFLOW_DIR="/Users/mohlt/.openclaw/workspace/vc-portfolio/n8n-workflows"

echo "🧪 Testing All VC Portfolio Workflows"
echo ""

VALID=0
INVALID=0
TOTAL_NODES=0

echo "═══════════════════════════════════════"
echo "VALIDATION RESULTS"
echo "═══════════════════════════════════════"

for workflow in "$WORKFLOW_DIR"/*.json; do
  if [ -f "$workflow" ]; then
    name=$(basename "$workflow")
    
    if python3 -m json.tool "$workflow" > /dev/null 2>&1; then
      nodes=$(jq '.nodes | length' "$workflow" 2>/dev/null || echo "0")
      TOTAL_NODES=$((TOTAL_NODES + nodes))
      printf "✅ %-40s %3s nodes\n" "$name" "$nodes"
      ((VALID++))
    else
      printf "❌ %-40s INVALID JSON\n" "$name"
      ((INVALID++))
    fi
  fi
done

echo "═══════════════════════════════════════"
echo "SUMMARY"
echo "═══════════════════════════════════════"
echo "Valid: $VALID"
echo "Invalid: $INVALID"
echo "Total Nodes: $TOTAL_NODES"
echo ""

if [ $INVALID -eq 0 ]; then
  echo "✅ All workflows are valid!"
  exit 0
else
  echo "⚠️  Some workflows need fixing"
  exit 1
fi
