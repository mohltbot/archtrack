# Budget Tracking Bug - Fix Plan

**Date:** March 4, 2026  
**Status:** Root cause identified, fix drafted  
**Actual Spend:** ~$4.50  
**Tracked Spend:** $30+ (6x over-reporting)

## Root Cause Analysis

### Issue Location
`scripts/sync-expenses-to-sheets.mjs` - Lines 45-78 (reconciliation function)

### Problem
The reconciliation loop accumulates expenses incorrectly:

```javascript
// BUGGY CODE (lines 52-67)
for (const expense of expenses) {
  // Each iteration ADDS to running total instead of reading fresh
  const currentTotal = runningTotal + expense.amount; // Wrong: accumulates
  runningTotal = currentTotal; // Double counting
  
  // When writing to sheet, it writes the accumulated value
  // instead of the actual expense amount
}
```

### Impact
- Each expense gets added to a running total
- Subsequent expenses include previous ones
- Results in exponential over-reporting
- 6x multiplier observed ($4.50 → $30+)

## Fix Implementation

### Option A: Fix Reconciliation Logic (Recommended)
```javascript
// FIXED CODE
for (const expense of expenses) {
  // Write individual expense, don't accumulate
  await sheets.writeRow({
    date: expense.date,
    provider: expense.provider,
    amount: expense.amount, // Actual amount, not running total
    tokens: expense.tokens,
  });
}

// Separate aggregation for summary
const total = expenses.reduce((sum, e) => sum + e.amount, 0);
```

### Option B: Reset and Rebuild (Nuclear Option)
1. Clear all tracked data
2. Re-import from provider APIs (Moonshot, DeepSeek)
3. Rebuild from ground truth

## Implementation Steps

1. [ ] Fix sync-expenses-to-sheets.mjs reconciliation logic
2. [ ] Add data validation (alert if daily > $10)
3. [ ] Reset tracked amounts to match actual
4. [ ] Add unit tests for expense calculation
5. [ ] Deploy and verify

## Verification Checklist

- [ ] Run `npm run sync-expenses --dry-run`
- [ ] Verify individual expense amounts are correct
- [ ] Confirm total matches actual spend (~$4.50)
- [ ] Test with new expense addition
- [ ] Monitor for 24 hours

## Related Files

- `scripts/sync-expenses-to-sheets.mjs` - Main bug location
- `lib/cost-tracker.ts` - Cost tracking logic
- `app/api/budget/route.ts` - Budget API endpoint
