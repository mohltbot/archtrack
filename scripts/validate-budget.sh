#!/bin/bash
# Pre-commit hook for mission-control
# Validates budget/expense entries before allowing commits

set -e

DB_FILE="data/db.json"
EXPENSE_PATTERN='"amount":\s*([0-9]+(\.[0-9]+)?)'
MAX_SINGLE_EXPENSE=50  # Flag expenses over $50
MAX_DAILY_TOTAL=100    # Flag daily totals over $100

echo "🔍 Running budget validation..."

# Check if db.json is being modified
if git diff --cached --name-only | grep -q "$DB_FILE"; then
    echo "  → Detected changes to $DB_FILE"
    
    # Get staged changes to db.json
    STAGED_DB=$(git show :"$DB_FILE" 2>/dev/null || echo "")
    
    if [ -n "$STAGED_DB" ]; then
        # Check for unusually large expenses
        LARGE_EXPENSES=$(echo "$STAGED_DB" | grep -oE '"amount":\s*[0-9]+(\.[0-9]+)?' | grep -oE '[0-9]+(\.[0-9]+)?' | awk -v max="$MAX_SINGLE_EXPENSE" '$1 > max {print $1}')
        
        if [ -n "$LARGE_EXPENSES" ]; then
            echo "⚠️  WARNING: Large expense(s) detected:"
            echo "$LARGE_EXPENSES" | while read amount; do
                echo "   - \$$amount (threshold: \$$MAX_SINGLE_EXPENSE)"
            done
            echo ""
            echo "If this is intentional, commit with --no-verify"
            echo "Otherwise, review the expense entry in $DB_FILE"
            exit 1
        fi
        
        # Check for negative amounts (could indicate corrections)
        NEGATIVE_AMOUNTS=$(echo "$STAGED_DB" | grep -oE '"amount":\s*-?[0-9]+(\.[0-9]+)?' | grep -oE '-[0-9]+(\.[0-9]+)?')
        
        if [ -n "$NEGATIVE_AMOUNTS" ]; then
            echo "⚠️  WARNING: Negative expense amount(s) detected:"
            echo "$NEGATIVE_AMOUNTS" | while read amount; do
                echo "   - \$$amount"
            done
            echo ""
            echo "Negative amounts may indicate corrections. Please verify:"
            echo "1. The correction is necessary"
            echo "2. The original erroneous entry is also being removed"
            echo ""
            echo "If intentional, commit with --no-verify"
            exit 1
        fi
        
        # Check for duplicate entries (same amount + description within same day)
        # This is a simple check - more sophisticated deduplication could be added
        DUPLICATE_CHECK=$(echo "$STAGED_DB" | grep -oE '"amount":\s*[0-9]+(\.[0-9]+)?' | sort | uniq -d)
        
        if [ -n "$DUPLICATE_CHECK" ]; then
            echo "ℹ️  INFO: Duplicate expense amounts detected:"
            echo "$DUPLICATE_CHECK" | while read amount; do
                echo "   - $amount appears multiple times"
            done
            echo ""
            echo "This may be intentional (e.g., multiple API calls at same price)"
            echo "Review the entries to ensure no accidental duplicates"
        fi
    fi
    
    echo "✅ Budget validation passed"
else
    echo "  → No budget changes detected, skipping validation"
fi

# Check for uncommitted changes in other tracked files
UNCOMMITTED=$(git status --porcelain | grep -E '^\s*M' | wc -l)
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo ""
    echo "📋 Note: $UNCOMMITTED modified file(s) not staged for commit"
    echo "   Run 'git status' to see uncommitted changes"
fi

echo ""
exit 0
