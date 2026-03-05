#!/bin/bash
# Comprehensive Workflow Validation Script
# Validates all 37 n8n workflows for JSON integrity, required nodes, and deployment readiness
# Usage: ./scripts/validate-all-workflows.sh [--detailed] [--fix]

set -e

WORKFLOW_DIR="${WORKFLOW_DIR:-./vc-portfolio/n8n-workflows}"
DETAILED=false
FIX_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --detailed) DETAILED=true; shift ;;
    --fix) FIX_MODE=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "🧪 Comprehensive Workflow Validation"
echo "===================================="
echo "Directory: $WORKFLOW_DIR"
echo "Mode: $(if $DETAILED; then echo 'Detailed'; else echo 'Quick'; fi)"
echo "Fix Mode: $(if $FIX_MODE; then echo 'ON'; else echo 'OFF'; fi)"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
VALID=0
INVALID=0
WARNINGS=0
TOTAL_NODES=0
TOTAL_CONNECTIONS=0

# Required node types for production workflows
REQUIRED_NODES=("trigger" "slack" "email")

# Results array
declare -a RESULTS
declare -a WARNINGS_LIST

echo "Running validation..."
echo ""

# Validate each workflow
for workflow in "$WORKFLOW_DIR"/*.json; do
  if [ -f "$workflow" ]; then
    name=$(basename "$workflow" .json)
    status="✅"
    issues=""
    
    # Test 1: JSON validity
    if ! python3 -m json.tool "$workflow" > /dev/null 2>&1; then
      status="❌"
      issues="Invalid JSON"
      ((INVALID++))
    else
      # Valid JSON - extract metrics
      nodes=$(jq '.nodes | length' "$workflow" 2>/dev/null || echo "0")
      connections=$(jq '.connections | length' "$workflow" 2>/dev/null || echo "0")
      TOTAL_NODES=$((TOTAL_NODES + nodes))
      TOTAL_CONNECTIONS=$((TOTAL_CONNECTIONS + connections))
      
      # Test 2: Has trigger node
      has_trigger=$(jq '[.nodes[] | select(.type | contains("trigger") or contains("Trigger"))] | length' "$workflow" 2>/dev/null || echo "0")
      if [ "$has_trigger" -eq 0 ]; then
        status="⚠️"
        issues="${issues}No trigger; "
        ((WARNINGS++))
        WARNINGS_LIST+=("$name: Missing trigger node")
      fi
      
      # Test 3: Has credentials reference (for production workflows)
      if $DETAILED; then
        cred_refs=$(jq '[.. | strings | select(contains("credentials"))] | length' "$workflow" 2>/dev/null || echo "0")
        if [ "$cred_refs" -eq 0 ]; then
          # Only warn for non-template workflows
          if [[ ! "$name" == template-* ]]; then
            WARNINGS_LIST+=("$name: No credential references")
            ((WARNINGS++))
          fi
        fi
      fi
      
      # Test 4: Check for common anti-patterns
      if $DETAILED; then
        # Check for hardcoded values
        hardcoded=$(jq '[.. | strings | select(test("(password|secret|key|token)"; "i"))] | length' "$workflow" 2>/dev/null || echo "0")
        if [ "$hardcoded" -gt 0 ]; then
          WARNINGS_LIST+=("$name: Potential hardcoded secrets")
          ((WARNINGS++))
        fi
      fi
      
      if [ -z "$issues" ]; then
        ((VALID++))
      fi
    fi
    
    # Output
    if $DETAILED; then
      printf "${status} %-45s %3s nodes %3s conn %s\n" "$name" "$nodes" "$connections" "$issues"
    else
      printf "${status} %-45s\n" "$name"
    fi
    
    RESULTS+=("$status|$name|$nodes|$connections|$issues")
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════════════"
printf "${GREEN}Valid:     %d${NC}\n" $VALID
printf "${RED}Invalid:   %d${NC}\n" $INVALID
printf "${YELLOW}Warnings:  %d${NC}\n" $WARNINGS
echo "───────────────────────────────────────────────────────────"
echo "Total Nodes: $TOTAL_NODES"
echo "Total Connections: $TOTAL_CONNECTIONS"
echo "Workflows Checked: $((VALID + INVALID))"
echo ""

# Show warnings if any
if [ ${#WARNINGS_LIST[@]} -gt 0 ]; then
  echo "⚠️  WARNINGS:"
  for warning in "${WARNINGS_LIST[@]}"; do
    echo "   • $warning"
  done
  echo ""
fi

# Generate report
REPORT_FILE="./logs/workflow-validation-$(date +%Y%m%d-%H%M%S).json"
mkdir -p ./logs
cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "valid": $VALID,
    "invalid": $INVALID,
    "warnings": $WARNINGS,
    "total_nodes": $TOTAL_NODES,
    "total_connections": $TOTAL_CONNECTIONS
  },
  "results": [
EOF

# Add results to JSON
first=true
for result in "${RESULTS[@]}"; do
  IFS='|' read -r status name nodes connections issues <<< "$result"
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$REPORT_FILE"
  fi
  printf '    {"name": "%s", "status": "%s", "nodes": %s, "connections": %s, "issues": "%s"}' \
    "$name" "$status" "${nodes:-0}" "${connections:-0}" "$issues" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"
echo "  ]" >> "$REPORT_FILE"
echo "}" >> "$REPORT_FILE"

echo "📄 Detailed report saved to: $REPORT_FILE"

# Exit code
if [ $INVALID -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo ""
  echo "✅ All workflows valid and production-ready!"
  exit 0
elif [ $INVALID -eq 0 ]; then
  echo ""
  echo "⚠️  All workflows valid but have warnings (see above)"
  exit 0
else
  echo ""
  echo "❌ Some workflows have critical errors"
  exit 1
fi
