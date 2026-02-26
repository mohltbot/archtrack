#!/bin/zsh
# Universal API Expense Logger
# Usage: log-expense.sh <provider> <amount> <description> [model] [tokens_in] [tokens_out]
# 
# Examples:
#   log-expense.sh moonshot 0.002 "kimi session" kimi-k2.5 1500 800
#   log-expense.sh openai 0.015 "GPT-4 call" gpt-4 2000 1500
#   log-expense.sh anthropic 0.008 "Claude session" claude-3 3000 1200

WORKSPACE="/Users/mohlt/.openclaw/workspace"
API_ENDPOINT="http://localhost:3000/api/expenses/auto"

# Parse arguments
PROVIDER="$1"
AMOUNT="$2"
DESCRIPTION="$3"
MODEL="${4:-unknown}"
TOKENS_IN="${5:-0}"
TOKENS_OUT="${6:-0}"

# Validation
if [[ -z "$PROVIDER" || -z "$AMOUNT" || -z "$DESCRIPTION" ]]; then
  echo "Usage: $0 <provider> <amount> <description> [model] [tokens_in] [tokens_out]"
  echo "Example: $0 moonshot 0.002 'kimi session' kimi-k2.5 1500 800"
  exit 1
fi

# Log the expense
curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"provider\": \"$PROVIDER\",
    \"amount\": $AMOUNT,
    \"description\": \"$DESCRIPTION\",
    \"model\": \"$MODEL\",
    \"tokens_in\": $TOKENS_IN,
    \"tokens_out\": $TOKENS_OUT,
    \"category\": \"api_call\"
  }" | jq -r '.success // "failed"'
